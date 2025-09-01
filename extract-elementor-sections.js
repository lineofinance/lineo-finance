const { chromium } = require('playwright');
const fs = require('fs');

async function extractElementorSections() {
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
        await page.waitForTimeout(5000);
        
        console.log('Extracting Elementor sections...');
        
        // Extract all Elementor sections and their content
        const sections = await page.evaluate(() => {
            const sectionsData = [];
            
            // Find all Elementor containers/sections
            const elementorSections = document.querySelectorAll('.elementor-element[data-element_type="container"], .elementor-element[data-element_type="section"]');
            
            elementorSections.forEach((section, index) => {
                // Skip if this is inside another section (nested)
                const parentSection = section.parentElement.closest('.elementor-element[data-element_type="container"], .elementor-element[data-element_type="section"]');
                if (parentSection && parentSection !== section) return;
                
                const rect = section.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(section);
                
                // Extract all text content
                const headings = Array.from(section.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
                    tag: h.tagName.toLowerCase(),
                    text: h.textContent.trim(),
                    style: {
                        fontSize: window.getComputedStyle(h).fontSize,
                        fontWeight: window.getComputedStyle(h).fontWeight,
                        color: window.getComputedStyle(h).color
                    }
                }));
                
                const paragraphs = Array.from(section.querySelectorAll('p')).map(p => p.textContent.trim()).filter(text => text.length > 0);
                
                const lists = Array.from(section.querySelectorAll('ul, ol')).map(list => ({
                    type: list.tagName.toLowerCase(),
                    items: Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim())
                }));
                
                // Extract all images
                const images = Array.from(section.querySelectorAll('img')).map(img => ({
                    src: img.src,
                    alt: img.alt,
                    width: img.naturalWidth || img.width,
                    height: img.naturalHeight || img.height,
                    className: img.className
                }));
                
                // Extract buttons and links
                const buttons = Array.from(section.querySelectorAll('a, button, .elementor-button')).map(btn => ({
                    tag: btn.tagName.toLowerCase(),
                    text: btn.textContent.trim(),
                    href: btn.href || null,
                    className: btn.className,
                    style: {
                        backgroundColor: window.getComputedStyle(btn).backgroundColor,
                        color: window.getComputedStyle(btn).color,
                        borderRadius: window.getComputedStyle(btn).borderRadius,
                        padding: window.getComputedStyle(btn).padding
                    }
                }));
                
                // Check for forms
                const forms = Array.from(section.querySelectorAll('form')).map(form => ({
                    action: form.action,
                    method: form.method,
                    fields: Array.from(form.querySelectorAll('input, textarea, select')).map(field => ({
                        type: field.type || field.tagName.toLowerCase(),
                        name: field.name,
                        placeholder: field.placeholder,
                        required: field.required
                    }))
                }));
                
                // Extract background information
                const backgroundImage = computedStyle.backgroundImage;
                const backgroundImageUrl = backgroundImage && backgroundImage !== 'none' ? 
                    backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1] : null;
                
                // Determine section type based on content
                let sectionType = 'content';
                if (section.querySelector('.elementor-widget-heading') && !section.querySelector('p')) {
                    sectionType = 'hero';
                } else if (section.querySelector('form')) {
                    sectionType = 'form';
                } else if (section.querySelectorAll('.elementor-widget').length > 3) {
                    sectionType = 'features';
                } else if (section.querySelector('.elementor-button')) {
                    sectionType = 'cta';
                }
                
                sectionsData.push({
                    index: index,
                    id: section.id,
                    elementorId: section.dataset.id,
                    className: section.className,
                    sectionType: sectionType,
                    elementType: section.dataset.element_type,
                    settings: section.dataset.settings ? JSON.parse(section.dataset.settings) : {},
                    dimensions: {
                        width: rect.width,
                        height: rect.height,
                        x: rect.x,
                        y: rect.y
                    },
                    styles: {
                        backgroundColor: computedStyle.backgroundColor,
                        backgroundImage: backgroundImageUrl,
                        color: computedStyle.color,
                        padding: computedStyle.padding,
                        margin: computedStyle.margin,
                        display: computedStyle.display,
                        flexDirection: computedStyle.flexDirection,
                        alignItems: computedStyle.alignItems,
                        justifyContent: computedStyle.justifyContent,
                        textAlign: computedStyle.textAlign
                    },
                    content: {
                        headings: headings,
                        paragraphs: paragraphs,
                        lists: lists,
                        images: images,
                        buttons: buttons,
                        forms: forms
                    },
                    widgets: Array.from(section.querySelectorAll('.elementor-widget')).map(widget => ({
                        type: widget.dataset.widget_type,
                        id: widget.dataset.id,
                        className: widget.className
                    })),
                    innerHTML: section.innerHTML,
                    textContent: section.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) + '...'
                });
            });
            
            return sectionsData;
        });
        
        console.log(`Found ${sections.length} Elementor sections`);
        
        // Take screenshots of each section
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            console.log(`Taking screenshot of section ${i + 1}: ${section.sectionType}`);
            
            try {
                // Scroll to section
                await page.evaluate((elementorId) => {
                    const element = document.querySelector(`[data-id="${elementorId}"]`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, section.elementorId);
                
                await page.waitForTimeout(1000);
                
                // Take screenshot
                const element = await page.locator(`[data-id="${section.elementorId}"]`);
                if (await element.count() > 0) {
                    const screenshotPath = `karriere-section-${i + 1}-${section.sectionType}.png`;
                    await element.screenshot({ path: screenshotPath });
                    sections[i].screenshotPath = screenshotPath;
                }
            } catch (error) {
                console.log(`Could not take screenshot for section ${i + 1}: ${error.message}`);
            }
        }
        
        // Take full page screenshot
        console.log('Taking full page screenshot...');
        await page.screenshot({ 
            path: 'karriere-full-page-final.png',
            fullPage: true 
        });
        
        // Save data
        const outputData = {
            url: 'https://www.lineo.finance/karriere/',
            extractedAt: new Date().toISOString(),
            pageTitle: await page.title(),
            totalSections: sections.length,
            sections: sections
        };
        
        fs.writeFileSync('karriere-elementor-sections.json', JSON.stringify(outputData, null, 2));
        console.log('Data saved to karriere-elementor-sections.json');
        
        // Generate detailed report
        let report = generateDetailedReport(outputData);
        fs.writeFileSync('karriere-sections-detailed-report.md', report);
        console.log('Detailed report saved to karriere-sections-detailed-report.md');
        
        return sections;
        
    } catch (error) {
        console.error('Error extracting sections:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function generateDetailedReport(data) {
    let report = `# Karriere Page - Detailed Section Analysis\n\n`;
    report += `**URL:** ${data.url}\n`;
    report += `**Page Title:** ${data.pageTitle}\n`;
    report += `**Extracted at:** ${data.extractedAt}\n`;
    report += `**Total sections found:** ${data.totalSections}\n\n`;
    
    report += `## Page Structure Overview\n\n`;
    data.sections.forEach((section, index) => {
        report += `${index + 1}. **${section.sectionType.toUpperCase()}** (${section.dimensions.width}x${section.dimensions.height}px)\n`;
    });
    report += `\n`;
    
    data.sections.forEach((section, index) => {
        report += `## Section ${index + 1}: ${section.sectionType.toUpperCase()}\n\n`;
        
        // Basic information
        report += `### Basic Information\n`;
        report += `- **Section Type:** ${section.sectionType}\n`;
        report += `- **Element Type:** ${section.elementType}\n`;
        report += `- **Elementor ID:** ${section.elementorId}\n`;
        report += `- **CSS Classes:** ${section.className}\n`;
        report += `- **Dimensions:** ${section.dimensions.width}x${section.dimensions.height}px\n`;
        report += `- **Position:** x:${section.dimensions.x}, y:${section.dimensions.y}\n`;
        
        if (section.screenshotPath) {
            report += `- **Screenshot:** ${section.screenshotPath}\n`;
        }
        report += `\n`;
        
        // Styling information
        report += `### Styling\n`;
        report += `- **Background Color:** ${section.styles.backgroundColor}\n`;
        if (section.styles.backgroundImage) {
            report += `- **Background Image:** ${section.styles.backgroundImage}\n`;
        }
        report += `- **Text Color:** ${section.styles.color}\n`;
        report += `- **Padding:** ${section.styles.padding}\n`;
        report += `- **Margin:** ${section.styles.margin}\n`;
        report += `- **Display:** ${section.styles.display}\n`;
        report += `- **Text Align:** ${section.styles.textAlign}\n`;
        report += `\n`;
        
        // Content analysis
        report += `### Content\n`;
        
        if (section.content.headings.length > 0) {
            report += `**Headings:**\n`;
            section.content.headings.forEach(heading => {
                report += `- ${heading.tag.toUpperCase()}: "${heading.text}" (${heading.style.fontSize}, ${heading.style.fontWeight}, ${heading.style.color})\n`;
            });
            report += `\n`;
        }
        
        if (section.content.paragraphs.length > 0) {
            report += `**Paragraphs:**\n`;
            section.content.paragraphs.slice(0, 3).forEach(para => {
                report += `- "${para.slice(0, 100)}${para.length > 100 ? '...' : ''}"\n`;
            });
            if (section.content.paragraphs.length > 3) {
                report += `- ... and ${section.content.paragraphs.length - 3} more paragraphs\n`;
            }
            report += `\n`;
        }
        
        if (section.content.lists.length > 0) {
            report += `**Lists:**\n`;
            section.content.lists.forEach(list => {
                report += `- ${list.type.toUpperCase()} with ${list.items.length} items\n`;
                list.items.slice(0, 3).forEach(item => {
                    report += `  - "${item.slice(0, 50)}${item.length > 50 ? '...' : ''}"\n`;
                });
                if (list.items.length > 3) {
                    report += `  - ... and ${list.items.length - 3} more items\n`;
                }
            });
            report += `\n`;
        }
        
        if (section.content.images.length > 0) {
            report += `**Images:**\n`;
            section.content.images.forEach(img => {
                report += `- ${img.src} (${img.width}x${img.height}px, alt: "${img.alt}")\n`;
            });
            report += `\n`;
        }
        
        if (section.content.buttons.length > 0) {
            report += `**Buttons/Links:**\n`;
            section.content.buttons.forEach(btn => {
                report += `- ${btn.tag.toUpperCase()}: "${btn.text}"`;
                if (btn.href) report += ` → ${btn.href}`;
                report += ` (bg: ${btn.style.backgroundColor}, color: ${btn.style.color})\n`;
            });
            report += `\n`;
        }
        
        if (section.content.forms.length > 0) {
            report += `**Forms:**\n`;
            section.content.forms.forEach(form => {
                report += `- Form (${form.method.toUpperCase()} to ${form.action})\n`;
                report += `  Fields: ${form.fields.length} total\n`;
                form.fields.forEach(field => {
                    report += `  - ${field.type}: ${field.name} ${field.required ? '(required)' : ''}\n`;
                });
            });
            report += `\n`;
        }
        
        // Widgets information
        if (section.widgets.length > 0) {
            report += `### Elementor Widgets\n`;
            const widgetCounts = {};
            section.widgets.forEach(widget => {
                const type = widget.type || 'unknown';
                widgetCounts[type] = (widgetCounts[type] || 0) + 1;
            });
            
            Object.entries(widgetCounts).forEach(([type, count]) => {
                report += `- **${type}**: ${count} instance${count > 1 ? 's' : ''}\n`;
            });
            report += `\n`;
        }
        
        // Content preview
        report += `### Content Preview\n`;
        report += `\`\`\`\n${section.textContent}\n\`\`\`\n\n`;
        
        report += `---\n\n`;
    });
    
    return report;
}

// Run the extraction
extractElementorSections()
    .then(sections => {
        console.log('\n=== EXTRACTION COMPLETE ===');
        console.log(`Successfully extracted ${sections.length} sections from karriere page`);
        console.log('Files created:');
        console.log('- karriere-elementor-sections.json (complete structured data)');
        console.log('- karriere-sections-detailed-report.md (human-readable analysis)');
        console.log('- karriere-full-page-final.png (complete page screenshot)');
        console.log('- karriere-section-*.png (individual section screenshots)');
        
        // Print summary
        const sectionTypes = sections.reduce((acc, section) => {
            acc[section.sectionType] = (acc[section.sectionType] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\nSection types found:');
        Object.entries(sectionTypes).forEach(([type, count]) => {
            console.log(`- ${type}: ${count} section${count > 1 ? 's' : ''}`);
        });
    })
    .catch(error => {
        console.error('Extraction failed:', error);
        process.exit(1);
    });