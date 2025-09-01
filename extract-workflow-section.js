const { chromium } = require('playwright');
const fs = require('fs');
const https = require('https');
const path = require('path');

async function extractWorkflowSection() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        // First try the leistungen page
        console.log('Navigating to lineo.finance/leistungen...');
        await page.goto('https://www.lineo.finance/leistungen/', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        console.log('Looking for "So einfach kann es laufen" section...');
        
        // Search for the target text
        const pageAnalysis = await page.evaluate(() => {
            const allText = document.body.textContent;
            const hasTarget = allText.includes('So einfach kann es laufen') || allText.includes('einfach kann es laufen');
            
            // Get all major container elements that might contain workflow content
            const workflowContainers = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent.toLowerCase();
                return (text.includes('einfach') && text.includes('laufen')) ||
                       text.includes('schritt') || text.includes('ablauf') || 
                       text.includes('prozess') || text.includes('workflow') ||
                       text.includes('so funktioniert');
            }).map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                textPreview: el.textContent.substring(0, 300).replace(/\s+/g, ' ').trim(),
                hasTargetPhrase: el.textContent.includes('So einfach kann es laufen') || el.textContent.includes('einfach kann es laufen')
            }));
            
            return {
                url: window.location.href,
                hasTarget,
                workflowContainers: workflowContainers
            };
        });
        
        console.log('Page analysis:', JSON.stringify(pageAnalysis, null, 2));
        
        // If not found on leistungen page, try the main page again with more specific search
        if (!pageAnalysis.hasTarget) {
            console.log('Not found on leistungen page, trying main page again...');
            await page.goto('https://www.lineo.finance/', { 
                waitUntil: 'networkidle',
                timeout: 60000 
            });
            
            // Wait a bit more for dynamic content to load
            await page.waitForTimeout(3000);
        }
        
        // Now try to find the section with more specific search
        const sectionData = await page.evaluate(() => {
            // Multiple search strategies
            let targetElement = null;
            
            // Strategy 1: Look for exact text
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let node;
            while (node = walker.nextNode()) {
                const text = node.textContent;
                if (text.includes('So einfach kann es laufen') || 
                    text.includes('einfach kann es laufen')) {
                    targetElement = node.parentElement;
                    console.log('Found via text search:', text.substring(0, 100));
                    break;
                }
            }
            
            // Strategy 2: Look for workflow-related sections
            if (!targetElement) {
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                for (const heading of headings) {
                    const text = heading.textContent.toLowerCase();
                    if ((text.includes('einfach') && text.includes('laufen')) ||
                        text.includes('so funktioniert') || text.includes('ablauf') ||
                        text.includes('prozess') || text.includes('workflow')) {
                        targetElement = heading.closest('section, div[class*="section"], div[class*="container"]') || heading.parentElement;
                        console.log('Found via heading search:', heading.textContent);
                        break;
                    }
                }
            }
            
            // Strategy 3: Look for step-based content
            if (!targetElement) {
                const stepElements = Array.from(document.querySelectorAll('*')).filter(el => {
                    const text = el.textContent;
                    return (text.includes('Schritt 1') || text.includes('1.') || text.includes('Step 1')) ||
                           (text.includes('Schritt') && (text.includes('2') || text.includes('3')));
                });
                
                if (stepElements.length > 0) {
                    targetElement = stepElements[0].closest('section, div[class*="section"], div[class*="container"], div[class*="workflow"], div[class*="process"]');
                    console.log('Found via step content search');
                }
            }
            
            // Strategy 4: Look for any substantial section if still not found
            if (!targetElement) {
                const sections = document.querySelectorAll('section, div[class*="section"], div[class*="workflow"], div[class*="process"], div[id*="workflow"], div[id*="process"]');
                for (const section of sections) {
                    if (section.textContent.length > 1000) {
                        targetElement = section;
                        console.log('Using fallback large section');
                        break;
                    }
                }
            }
            
            if (!targetElement) {
                return null;
            }
            
            // Find the appropriate container
            let container = targetElement;
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
            
            return {
                html: container.outerHTML,
                tagName: container.tagName,
                className: container.className,
                id: container.id,
                textLength: container.textContent.length,
                textPreview: container.textContent.substring(0, 500).replace(/\s+/g, ' ').trim()
            };
        });
        
        if (!sectionData) {
            throw new Error('Could not find any suitable section');
        }
        
        console.log(`Found section! Container: ${sectionData.tagName}.${sectionData.className}, Content length: ${sectionData.textLength}`);
        console.log('Text preview:', sectionData.textPreview);
        
        // Extract all images from the section
        const images = await page.evaluate((htmlContent) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            const imgs = tempDiv.querySelectorAll('img');
            const backgroundImages = tempDiv.querySelectorAll('[style*="background-image"]');
            
            const imageUrls = [];
            
            // Regular img tags
            imgs.forEach(img => {
                if (img.src && !img.src.startsWith('data:')) {
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
                if (matches && matches[1] && !matches[1].startsWith('data:')) {
                    imageUrls.push({
                        type: 'background',
                        src: matches[1],
                        element: el.tagName,
                        className: el.className
                    });
                }
            });
            
            return imageUrls;
        }, sectionData.html);
        
        // Get computed styles for key elements
        const stylesData = await page.evaluate((htmlContent) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            document.body.appendChild(tempDiv);
            
            const keyElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div[class*="step"], div[class*="item"], img, svg, .elementor-element');
            const stylesMap = {};
            
            keyElements.forEach((element, index) => {
                if (element.textContent.trim().length > 0 || element.tagName === 'IMG' || element.tagName === 'SVG') {
                    const computedStyle = window.getComputedStyle(element);
                    const elementKey = `${element.tagName.toLowerCase()}-${index}`;
                    
                    stylesMap[elementKey] = {
                        tagName: element.tagName,
                        className: element.className,
                        id: element.id,
                        textContent: element.tagName === 'IMG' ? element.alt : element.textContent.substring(0, 100),
                        styles: {
                            // Layout
                            display: computedStyle.display,
                            position: computedStyle.position,
                            width: computedStyle.width,
                            height: computedStyle.height,
                            margin: computedStyle.margin,
                            padding: computedStyle.padding,
                            
                            // Flexbox/Grid
                            flexDirection: computedStyle.flexDirection,
                            justifyContent: computedStyle.justifyContent,
                            alignItems: computedStyle.alignItems,
                            gap: computedStyle.gap,
                            
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
                }
            });
            
            document.body.removeChild(tempDiv);
            return stylesMap;
        }, sectionData.html);
        
        // Save extracted data
        const extractedData = {
            html: sectionData.html,
            sectionInfo: {
                tagName: sectionData.tagName,
                className: sectionData.className,
                id: sectionData.id,
                textLength: sectionData.textLength,
                textPreview: sectionData.textPreview
            },
            images: images,
            styles: stylesData,
            timestamp: new Date().toISOString(),
            sourceUrl: await page.url()
        };
        
        fs.writeFileSync('workflow-section-data.json', JSON.stringify(extractedData, null, 2));
        console.log('Data saved to workflow-section-data.json');
        
        // Download images
        console.log(`Found ${images.length} images. Downloading...`);
        
        if (!fs.existsSync('workflow-assets')) {
            fs.mkdirSync('workflow-assets');
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
                const fileName = `workflow-${i + 1}-${image.type}${extension}`;
                const filePath = path.join('workflow-assets', fileName);
                
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
        fs.writeFileSync('workflow-section-data.json', JSON.stringify(extractedData, null, 2));
        
        console.log('\n=== WORKFLOW SECTION EXTRACTION COMPLETE ===');
        console.log(`HTML structure saved`);
        console.log(`${images.length} images processed`);
        console.log(`${Object.keys(stylesData).length} key elements styled`);
        
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
extractWorkflowSection().catch(console.error);