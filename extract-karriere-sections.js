const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extractKarrierePageSections() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
        
        console.log('Extracting page structure...');
        
        // Get all main content sections (excluding header/footer)
        const sections = await page.evaluate(() => {
            const sectionsData = [];
            
            // Find all potential section containers
            const sectionSelectors = [
                'main section',
                'main .section',
                'main .container > div',
                '[class*="section"]',
                '[class*="hero"]',
                '[class*="content"]',
                '[class*="jobs"]',
                '[class*="career"]',
                '[class*="benefits"]',
                '[class*="process"]'
            ];
            
            const foundSections = new Set();
            
            sectionSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Skip if we already found this element
                    if (foundSections.has(element)) return;
                    
                    // Skip header, footer, nav elements
                    if (element.closest('header, footer, nav')) return;
                    
                    // Skip very small elements (likely not main sections)
                    const rect = element.getBoundingClientRect();
                    if (rect.height < 50) return;
                    
                    foundSections.add(element);
                    
                    // Get computed styles for key properties
                    const computedStyle = window.getComputedStyle(element);
                    const styles = {
                        display: computedStyle.display,
                        position: computedStyle.position,
                        backgroundColor: computedStyle.backgroundColor,
                        color: computedStyle.color,
                        fontSize: computedStyle.fontSize,
                        fontFamily: computedStyle.fontFamily,
                        padding: computedStyle.padding,
                        margin: computedStyle.margin,
                        width: computedStyle.width,
                        height: rect.height + 'px',
                        textAlign: computedStyle.textAlign,
                        backgroundImage: computedStyle.backgroundImage,
                        borderRadius: computedStyle.borderRadius,
                        boxShadow: computedStyle.boxShadow
                    };
                    
                    // Extract all image sources
                    const images = Array.from(element.querySelectorAll('img')).map(img => ({
                        src: img.src,
                        alt: img.alt,
                        width: img.width,
                        height: img.height
                    }));
                    
                    // Extract all background images from CSS
                    const backgroundImages = [];
                    const allElements = [element, ...element.querySelectorAll('*')];
                    allElements.forEach(el => {
                        const bgImage = window.getComputedStyle(el).backgroundImage;
                        if (bgImage && bgImage !== 'none') {
                            const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                            if (urlMatch) {
                                backgroundImages.push(urlMatch[1]);
                            }
                        }
                    });
                    
                    // Get section identifier
                    const sectionId = element.id || 
                                    element.className || 
                                    element.tagName.toLowerCase() + '_' + Array.from(element.parentNode.children).indexOf(element);
                    
                    // Extract text content for identification
                    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent.trim());
                    const firstParagraph = element.querySelector('p')?.textContent.slice(0, 100) + '...' || '';
                    
                    sectionsData.push({
                        identifier: sectionId,
                        tagName: element.tagName.toLowerCase(),
                        className: element.className,
                        id: element.id,
                        innerHTML: element.innerHTML,
                        textContent: element.textContent.slice(0, 200) + '...',
                        headings: headings,
                        firstParagraph: firstParagraph,
                        styles: styles,
                        images: images,
                        backgroundImages: [...new Set(backgroundImages)],
                        boundingRect: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        },
                        childrenCount: element.children.length,
                        hasForm: element.querySelector('form') !== null,
                        hasButtons: element.querySelectorAll('button, .btn, [class*="button"]').length,
                        hasLinks: element.querySelectorAll('a').length
                    });
                });
            });
            
            // Sort by Y position to get correct order
            return sectionsData.sort((a, b) => a.boundingRect.y - b.boundingRect.y);
        });
        
        console.log(`Found ${sections.length} sections`);
        
        // Take screenshots of each section
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            console.log(`Processing section ${i + 1}: ${section.identifier}`);
            
            // Find the element again for screenshot
            try {
                await page.evaluate((className, id) => {
                    let element;
                    if (id) {
                        element = document.getElementById(id);
                    } else if (className) {
                        element = document.querySelector(`.${className.split(' ')[0]}`);
                    }
                    
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, section.className, section.id);
                
                await page.waitForTimeout(1000);
                
                // Take screenshot of the section
                const screenshotPath = `karriere-section-${i + 1}-${section.identifier.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                await page.screenshot({ 
                    path: screenshotPath,
                    fullPage: false
                });
                
                sections[i].screenshotPath = screenshotPath;
            } catch (error) {
                console.log(`Could not take screenshot for section ${i + 1}: ${error.message}`);
            }
        }
        
        // Take full page screenshot
        console.log('Taking full page screenshot...');
        await page.screenshot({ 
            path: 'karriere-full-page.png',
            fullPage: true 
        });
        
        // Save extracted data to JSON file
        const outputData = {
            url: 'https://www.lineo.finance/karriere/',
            extractedAt: new Date().toISOString(),
            totalSections: sections.length,
            sections: sections
        };
        
        fs.writeFileSync('karriere-sections-data.json', JSON.stringify(outputData, null, 2));
        console.log('Data saved to karriere-sections-data.json');
        
        // Generate summary report
        let report = `# Karriere Page Section Analysis\n\n`;
        report += `**URL:** ${outputData.url}\n`;
        report += `**Extracted at:** ${outputData.extractedAt}\n`;
        report += `**Total sections found:** ${outputData.totalSections}\n\n`;
        
        sections.forEach((section, index) => {
            report += `## Section ${index + 1}: ${section.identifier}\n\n`;
            report += `- **Tag:** ${section.tagName}\n`;
            report += `- **Class:** ${section.className}\n`;
            report += `- **ID:** ${section.id || 'None'}\n`;
            report += `- **Dimensions:** ${section.boundingRect.width}x${section.boundingRect.height}px\n`;
            report += `- **Position:** x:${section.boundingRect.x}, y:${section.boundingRect.y}\n`;
            report += `- **Children count:** ${section.childrenCount}\n`;
            report += `- **Has form:** ${section.hasForm}\n`;
            report += `- **Buttons count:** ${section.hasButtons}\n`;
            report += `- **Links count:** ${section.hasLinks}\n`;
            
            if (section.headings.length > 0) {
                report += `- **Headings:** ${section.headings.join(', ')}\n`;
            }
            
            if (section.images.length > 0) {
                report += `- **Images:** ${section.images.length} found\n`;
                section.images.forEach(img => {
                    report += `  - ${img.src} (${img.alt})\n`;
                });
            }
            
            if (section.backgroundImages.length > 0) {
                report += `- **Background images:** ${section.backgroundImages.join(', ')}\n`;
            }
            
            report += `- **Key styles:**\n`;
            report += `  - Background: ${section.styles.backgroundColor}\n`;
            report += `  - Color: ${section.styles.color}\n`;
            report += `  - Font: ${section.styles.fontSize} ${section.styles.fontFamily}\n`;
            report += `  - Padding: ${section.styles.padding}\n`;
            report += `  - Text align: ${section.styles.textAlign}\n`;
            
            if (section.screenshotPath) {
                report += `- **Screenshot:** ${section.screenshotPath}\n`;
            }
            
            report += `- **Content preview:** ${section.firstParagraph}\n\n`;
        });
        
        fs.writeFileSync('karriere-sections-report.md', report);
        console.log('Report saved to karriere-sections-report.md');
        
        return sections;
        
    } catch (error) {
        console.error('Error extracting sections:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the extraction
extractKarrierePageSections()
    .then(sections => {
        console.log('\n=== EXTRACTION COMPLETE ===');
        console.log(`Successfully extracted ${sections.length} sections from karriere page`);
        console.log('Files created:');
        console.log('- karriere-sections-data.json (complete data)');
        console.log('- karriere-sections-report.md (formatted report)');
        console.log('- karriere-full-page.png (full page screenshot)');
        console.log('- karriere-section-*.png (individual section screenshots)');
    })
    .catch(error => {
        console.error('Extraction failed:', error);
        process.exit(1);
    });