const { chromium } = require('playwright');
const fs = require('fs');
const https = require('https');
const path = require('path');

async function extractSection() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        console.log('Navigating to lineo.finance...');
        await page.goto('https://www.lineo.finance', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        console.log('Analyzing page structure...');
        
        // First, let's see what content is actually on the page
        const pageAnalysis = await page.evaluate(() => {
            const allText = document.body.textContent;
            const hasTarget = allText.includes('So einfach kann es laufen') || allText.includes('einfach kann es laufen');
            
            // Get all major container elements
            const containers = Array.from(document.querySelectorAll('div, section, article, main')).map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                hasTargetText: el.textContent.includes('einfach') && el.textContent.includes('laufen'),
                textPreview: el.textContent.substring(0, 200).replace(/\s+/g, ' ').trim()
            })).filter(el => el.textPreview.length > 10);
            
            // Look for workflow or process related content
            const workflowElements = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent.toLowerCase();
                return text.includes('schritt') || text.includes('ablauf') || text.includes('prozess') || text.includes('workflow');
            }).map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                textPreview: el.textContent.substring(0, 200).replace(/\s+/g, ' ').trim()
            }));
            
            return {
                hasTarget,
                totalContainers: containers.length,
                containers: containers,
                workflowElements: workflowElements
            };
        });
        
        console.log('Page analysis:', JSON.stringify(pageAnalysis, null, 2));
        
        // Get the section container based on analysis
        const sectionContainer = await page.evaluate(() => {
            // Look for the text in various ways
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let node;
            let targetElement = null;
            
            // Primary search for the exact text
            while (node = walker.nextNode()) {
                const text = node.textContent;
                if (text.includes('So einfach kann es laufen') || 
                    text.includes('einfach kann es laufen') ||
                    (text.includes('einfach') && text.includes('laufen'))) {
                    targetElement = node.parentElement;
                    console.log('Found target text in:', node.textContent.substring(0, 100));
                    break;
                }
            }
            
            // If not found, look for workflow/process sections
            if (!targetElement) {
                const allElements = document.querySelectorAll('*');
                for (const element of allElements) {
                    const text = element.textContent.toLowerCase();
                    if ((text.includes('schritt') || text.includes('ablauf') || text.includes('prozess')) &&
                        text.includes('einfach')) {
                        targetElement = element;
                        console.log('Found workflow element:', element.tagName, element.className);
                        break;
                    }
                }
            }
            
            // Still not found? Look for any section with substantial content
            if (!targetElement) {
                const sections = document.querySelectorAll('section, div[class*="section"], div[class*="workflow"], div[class*="process"]');
                for (const section of sections) {
                    if (section.textContent.length > 500) { // Substantial content
                        targetElement = section;
                        console.log('Using substantial section:', section.tagName, section.className);
                        break;
                    }
                }
            }
            
            // Find the appropriate container
            let container = targetElement;
            if (container) {
                while (container && container !== document.body) {
                    if (container.tagName === 'SECTION' || 
                        container.className.includes('section') ||
                        container.className.includes('workflow') ||
                        container.className.includes('process') ||
                        container.id ||
                        container.parentElement === document.body) {
                        break;
                    }
                    container = container.parentElement;
                }
            }
            
            return container ? {
                html: container.outerHTML,
                tagName: container.tagName,
                className: container.className,
                id: container.id,
                textLength: container.textContent.length
            } : null;
        });
        
        if (!sectionContainer || !sectionContainer.html) {
            console.log('Could not find the target section. Using fallback extraction...');
            
            // Fallback: get the entire main content
            const fallbackContent = await page.evaluate(() => {
                const main = document.querySelector('main') || document.querySelector('#main') || document.body;
                return {
                    html: main.outerHTML,
                    tagName: main.tagName,
                    className: main.className,
                    id: main.id,
                    textLength: main.textContent.length
                };
            });
            
            if (fallbackContent && fallbackContent.html) {
                console.log('Using fallback content extraction');
                sectionContainer = fallbackContent;
            } else {
                throw new Error('No content could be extracted');
            }
        }
        
        console.log(`Found section! Container: ${sectionContainer.tagName}.${sectionContainer.className}, Content length: ${sectionContainer.textLength}`);
        console.log('Extracting HTML and CSS...');
        
        // Extract all images from the section
        const images = await page.evaluate((htmlContent) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            const imgs = tempDiv.querySelectorAll('img');
            const backgroundImages = tempDiv.querySelectorAll('[style*="background-image"]');
            
            const imageUrls = [];
            
            // Regular img tags
            imgs.forEach(img => {
                if (img.src) {
                    imageUrls.push({
                        type: 'img',
                        src: img.src,
                        alt: img.alt,
                        className: img.className
                    });
                }
            });
            
            // Background images
            backgroundImages.forEach(el => {
                const style = el.style.backgroundImage;
                const matches = style.match(/url\(['"]?(.*?)['"]?\)/);
                if (matches && matches[1]) {
                    imageUrls.push({
                        type: 'background',
                        src: matches[1],
                        element: el.tagName,
                        className: el.className
                    });
                }
            });
            
            return imageUrls;
        }, sectionContainer.html);
        
        // Get computed styles for all elements in the section
        const stylesData = await page.evaluate((htmlContent) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            document.body.appendChild(tempDiv);
            
            const allElements = tempDiv.querySelectorAll('*');
            const stylesMap = {};
            
            allElements.forEach((element, index) => {
                const computedStyle = window.getComputedStyle(element);
                const elementKey = `${element.tagName.toLowerCase()}-${index}`;
                
                stylesMap[elementKey] = {
                    tagName: element.tagName,
                    className: element.className,
                    id: element.id,
                    styles: {
                        // Layout
                        display: computedStyle.display,
                        position: computedStyle.position,
                        top: computedStyle.top,
                        right: computedStyle.right,
                        bottom: computedStyle.bottom,
                        left: computedStyle.left,
                        width: computedStyle.width,
                        height: computedStyle.height,
                        margin: computedStyle.margin,
                        padding: computedStyle.padding,
                        
                        // Flexbox/Grid
                        flexDirection: computedStyle.flexDirection,
                        justifyContent: computedStyle.justifyContent,
                        alignItems: computedStyle.alignItems,
                        gap: computedStyle.gap,
                        gridTemplate: computedStyle.gridTemplate,
                        
                        // Typography
                        fontSize: computedStyle.fontSize,
                        fontFamily: computedStyle.fontFamily,
                        fontWeight: computedStyle.fontWeight,
                        lineHeight: computedStyle.lineHeight,
                        color: computedStyle.color,
                        textAlign: computedStyle.textAlign,
                        
                        // Background
                        backgroundColor: computedStyle.backgroundColor,
                        backgroundImage: computedStyle.backgroundImage,
                        backgroundSize: computedStyle.backgroundSize,
                        backgroundPosition: computedStyle.backgroundPosition,
                        
                        // Border
                        border: computedStyle.border,
                        borderRadius: computedStyle.borderRadius,
                        
                        // Transform & Effects
                        transform: computedStyle.transform,
                        boxShadow: computedStyle.boxShadow,
                        opacity: computedStyle.opacity
                    }
                };
            });
            
            document.body.removeChild(tempDiv);
            return stylesMap;
        }, sectionContainer.html);
        
        // Save extracted data
        const extractedData = {
            html: sectionContainer.html,
            sectionInfo: {
                tagName: sectionContainer.tagName,
                className: sectionContainer.className,
                id: sectionContainer.id,
                textLength: sectionContainer.textLength
            },
            images: images,
            styles: stylesData,
            timestamp: new Date().toISOString(),
            sourceUrl: 'https://www.lineo.finance'
        };
        
        fs.writeFileSync('extracted-section-data.json', JSON.stringify(extractedData, null, 2));
        console.log('Data saved to extracted-section-data.json');
        
        // Download images
        console.log(`Found ${images.length} images. Downloading...`);
        
        if (!fs.existsSync('downloaded-assets')) {
            fs.mkdirSync('downloaded-assets');
        }
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            try {
                let imageUrl = image.src;
                
                // Make relative URLs absolute
                if (imageUrl.startsWith('/')) {
                    imageUrl = 'https://www.lineo.finance' + imageUrl;
                } else if (imageUrl.startsWith('./')) {
                    imageUrl = 'https://www.lineo.finance/' + imageUrl.substring(2);
                } else if (!imageUrl.startsWith('http')) {
                    imageUrl = 'https://www.lineo.finance/' + imageUrl;
                }
                
                const urlObj = new URL(imageUrl);
                const extension = path.extname(urlObj.pathname) || '.png';
                const fileName = `image-${i + 1}-${image.type}${extension}`;
                const filePath = path.join('downloaded-assets', fileName);
                
                await downloadImage(imageUrl, filePath);
                console.log(`Downloaded: ${fileName}`);
                
                // Update the image data with local path
                images[i].localPath = filePath;
                images[i].originalUrl = image.src;
                images[i].absoluteUrl = imageUrl;
                
            } catch (error) {
                console.error(`Error downloading image ${i + 1}:`, error.message);
            }
        }
        
        // Update the JSON with download info
        extractedData.images = images;
        fs.writeFileSync('extracted-section-data.json', JSON.stringify(extractedData, null, 2));
        
        console.log('\n=== EXTRACTION COMPLETE ===');
        console.log(`HTML structure saved`);
        console.log(`${images.length} images processed`);
        console.log(`${Object.keys(stylesData).length} elements styled`);
        
        return extractedData;
        
    } catch (error) {
        console.error('Error during extraction:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode} for ${url}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
            
        }).on('error', (error) => {
            fs.unlink(filePath, () => {}); // Delete the file on error
            reject(error);
        });
    });
}

// Run the extraction
extractSection().catch(console.error);