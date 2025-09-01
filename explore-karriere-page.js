const { chromium } = require('playwright');
const fs = require('fs');

async function exploreKarrierePage() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('Navigating to karriere page...');
        await page.goto('https://www.lineo.finance/karriere/', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        console.log('Getting page title and basic info...');
        const pageTitle = await page.title();
        console.log('Page title:', pageTitle);
        
        // Get the full HTML structure
        const bodyHTML = await page.evaluate(() => {
            return document.body.innerHTML;
        });
        
        // Get all elements with their basic info
        const allElements = await page.evaluate(() => {
            const elements = [];
            const allDivs = document.querySelectorAll('*');
            
            allDivs.forEach(element => {
                // Skip script and style elements
                if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
                
                const rect = element.getBoundingClientRect();
                
                // Only include elements that are visible and have some size
                if (rect.width > 0 && rect.height > 0) {
                    elements.push({
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className,
                        textContent: element.textContent ? element.textContent.slice(0, 100) + '...' : '',
                        children: element.children.length,
                        rect: {
                            width: rect.width,
                            height: rect.height,
                            x: rect.x,
                            y: rect.y
                        }
                    });
                }
            });
            
            return elements;
        });
        
        console.log(`Found ${allElements.length} visible elements`);
        
        // Look specifically for main content areas
        const mainContent = await page.evaluate(() => {
            const contentAreas = [];
            
            // Check for common content selectors
            const selectors = [
                'main',
                '[role="main"]',
                '.main-content',
                '.content',
                'article',
                'section',
                '.container',
                '.wrapper',
                'body > div',
                'body > *'
            ];
            
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((element, index) => {
                        const rect = element.getBoundingClientRect();
                        if (rect.height > 100) { // Only significant elements
                            contentAreas.push({
                                selector: selector,
                                index: index,
                                tagName: element.tagName,
                                id: element.id,
                                className: element.className,
                                innerHTML: element.innerHTML.slice(0, 500) + '...',
                                rect: {
                                    width: rect.width,
                                    height: rect.height,
                                    x: rect.x,
                                    y: rect.y
                                }
                            });
                        }
                    });
                } catch (e) {
                    console.log(`Error with selector ${selector}:`, e.message);
                }
            });
            
            return contentAreas;
        });
        
        // Take full page screenshot
        await page.screenshot({ 
            path: 'karriere-page-exploration.png',
            fullPage: true 
        });
        
        // Save all findings
        const explorationData = {
            url: 'https://www.lineo.finance/karriere/',
            pageTitle: pageTitle,
            exploredAt: new Date().toISOString(),
            totalElements: allElements.length,
            mainContentAreas: mainContent,
            allElements: allElements.slice(0, 50) // Limit to first 50 for readability
        };
        
        fs.writeFileSync('karriere-page-exploration.json', JSON.stringify(explorationData, null, 2));
        console.log('Exploration data saved to karriere-page-exploration.json');
        
        // Generate a readable report
        let report = `# Karriere Page Exploration Report\n\n`;
        report += `**URL:** ${explorationData.url}\n`;
        report += `**Page Title:** ${explorationData.pageTitle}\n`;
        report += `**Explored at:** ${explorationData.exploredAt}\n`;
        report += `**Total visible elements:** ${explorationData.totalElements}\n\n`;
        
        report += `## Main Content Areas Found\n\n`;
        mainContent.forEach((area, index) => {
            report += `### Area ${index + 1}: ${area.selector}\n`;
            report += `- **Tag:** ${area.tagName}\n`;
            report += `- **ID:** ${area.id || 'None'}\n`;
            report += `- **Class:** ${area.className || 'None'}\n`;
            report += `- **Dimensions:** ${area.rect.width}x${area.rect.height}px\n`;
            report += `- **Position:** x:${area.rect.x}, y:${area.rect.y}\n`;
            report += `- **Content preview:**\n\`\`\`html\n${area.innerHTML.slice(0, 300)}...\n\`\`\`\n\n`;
        });
        
        fs.writeFileSync('karriere-page-exploration-report.md', report);
        console.log('Report saved to karriere-page-exploration-report.md');
        
        return explorationData;
        
    } catch (error) {
        console.error('Error exploring page:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the exploration
exploreKarrierePage()
    .then(data => {
        console.log('\n=== EXPLORATION COMPLETE ===');
        console.log(`Page title: ${data.pageTitle}`);
        console.log(`Found ${data.totalElements} visible elements`);
        console.log(`Found ${data.mainContentAreas.length} main content areas`);
    })
    .catch(error => {
        console.error('Exploration failed:', error);
        process.exit(1);
    });