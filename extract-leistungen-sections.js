const { chromium } = require('playwright');
const fs = require('fs');

async function extractLeistungenSections() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('Navigating to https://www.lineo.finance/leistungen/');
        await page.goto('https://www.lineo.finance/leistungen/', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        // Extract all major sections
        const sectionsData = await page.evaluate(() => {
            const sections = [];
            
            // Find all potential section containers
            const selectors = [
                'section',
                'div[class*="section"]',
                'div[class*="container"]',
                'header',
                'main > div',
                'div[id]',
                '.hero',
                '.banner',
                '.content',
                '.process',
                '.workflow',
                '.services',
                '.features'
            ];
            
            const foundElements = new Set();
            
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        // Avoid duplicates and too small elements
                        if (!foundElements.has(el) && el.offsetHeight > 100) {
                            foundElements.add(el);
                        }
                    });
                } catch (e) {
                    console.log(`Error with selector ${selector}:`, e);
                }
            });
            
            // Convert to array and process each element
            Array.from(foundElements).forEach((element, index) => {
                try {
                    const rect = element.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(element);
                    
                    // Get all images within this section
                    const images = Array.from(element.querySelectorAll('img')).map(img => ({
                        src: img.src,
                        alt: img.alt,
                        width: img.width,
                        height: img.height
                    }));
                    
                    // Get background images from CSS
                    const backgroundImage = computedStyle.backgroundImage;
                    const bgImages = [];
                    if (backgroundImage && backgroundImage !== 'none') {
                        const matches = backgroundImage.match(/url\(['"]?([^'"]*?)['"]?\)/g);
                        if (matches) {
                            matches.forEach(match => {
                                const url = match.match(/url\(['"]?([^'"]*?)['"]?\)/)[1];
                                bgImages.push(url);
                            });
                        }
                    }
                    
                    sections.push({
                        index: index,
                        tagName: element.tagName,
                        className: element.className,
                        id: element.id,
                        innerHTML: element.innerHTML,
                        textContent: element.textContent.trim().substring(0, 500) + '...',
                        position: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                        },
                        styles: {
                            backgroundColor: computedStyle.backgroundColor,
                            color: computedStyle.color,
                            fontSize: computedStyle.fontSize,
                            fontFamily: computedStyle.fontFamily,
                            padding: computedStyle.padding,
                            margin: computedStyle.margin,
                            display: computedStyle.display,
                            position: computedStyle.position,
                            zIndex: computedStyle.zIndex,
                            backgroundImage: computedStyle.backgroundImage
                        },
                        images: images,
                        backgroundImages: bgImages
                    });
                } catch (e) {
                    console.log(`Error processing element ${index}:`, e);
                }
            });
            
            // Sort by vertical position
            return sections.sort((a, b) => a.position.top - b.position.top);
        });
        
        // Also get page metadata
        const pageData = await page.evaluate(() => ({
            title: document.title,
            url: window.location.href,
            metaDescription: document.querySelector('meta[name="description"]')?.content || '',
            h1Tags: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
            h2Tags: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
            h3Tags: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim())
        }));
        
        const result = {
            pageData,
            sections: sectionsData,
            totalSections: sectionsData.length,
            extractedAt: new Date().toISOString()
        };
        
        // Save to JSON file
        fs.writeFileSync('leistungen-sections-data.json', JSON.stringify(result, null, 2));
        
        console.log(`\n=== LEISTUNGEN PAGE ANALYSIS ===`);
        console.log(`Page Title: ${pageData.title}`);
        console.log(`URL: ${pageData.url}`);
        console.log(`Total Sections Found: ${sectionsData.length}`);
        console.log(`Meta Description: ${pageData.metaDescription}`);
        
        console.log(`\n=== HEADINGS STRUCTURE ===`);
        console.log('H1 Tags:', pageData.h1Tags);
        console.log('H2 Tags:', pageData.h2Tags);
        console.log('H3 Tags:', pageData.h3Tags);
        
        console.log(`\n=== SECTIONS BREAKDOWN ===`);
        sectionsData.forEach((section, index) => {
            console.log(`\n--- SECTION ${index + 1} ---`);
            console.log(`Tag: ${section.tagName}`);
            console.log(`Class: ${section.className}`);
            console.log(`ID: ${section.id}`);
            console.log(`Position: top=${Math.round(section.position.top)}, height=${Math.round(section.position.height)}`);
            console.log(`Background: ${section.styles.backgroundColor}`);
            console.log(`Images: ${section.images.length} found`);
            if (section.images.length > 0) {
                section.images.forEach(img => {
                    console.log(`  - ${img.src} (${img.alt || 'no alt'})`);
                });
            }
            if (section.backgroundImages.length > 0) {
                console.log(`Background Images: ${section.backgroundImages.length} found`);
                section.backgroundImages.forEach(bg => {
                    console.log(`  - ${bg}`);
                });
            }
            console.log(`Text Preview: ${section.textContent.substring(0, 200)}...`);
        });
        
        console.log(`\nData saved to: leistungen-sections-data.json`);
        
    } catch (error) {
        console.error('Error extracting sections:', error);
    } finally {
        await browser.close();
    }
}

extractLeistungenSections();