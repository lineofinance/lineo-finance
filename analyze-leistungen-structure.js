const fs = require('fs');

function analyzeLeistungenStructure() {
    try {
        const data = JSON.parse(fs.readFileSync('leistungen-sections-data.json', 'utf8'));
        
        console.log('=== LEISTUNGEN PAGE SECTION ANALYSIS ===\n');
        console.log(`Page: ${data.pageData.title}`);
        console.log(`URL: ${data.pageData.url}\n`);
        
        // Extract all unique image URLs
        const allImages = new Set();
        const allBgImages = new Set();
        
        data.sections.forEach(section => {
            section.images.forEach(img => {
                if (img.src && !img.src.startsWith('data:')) {
                    allImages.add(img.src);
                }
            });
            section.backgroundImages.forEach(bg => allBgImages.add(bg));
        });
        
        console.log('=== ALL IMAGE ASSETS FOUND ===');
        console.log('\n--- Regular Images ---');
        Array.from(allImages).sort().forEach(img => {
            console.log(`- ${img}`);
        });
        
        console.log('\n--- Background Images ---');
        Array.from(allBgImages).sort().forEach(bg => {
            console.log(`- ${bg}`);
        });
        
        // Analyze main sections by their structural importance
        console.log('\n=== MAIN SECTIONS IDENTIFIED ===');
        
        const mainSections = data.sections.filter(section => {
            const hasId = section.id && section.id.length > 0;
            const hasSignificantHeight = section.position.height > 300;
            const hasImportantClass = section.className.includes('e-con e-parent') || 
                                    section.className.includes('section') ||
                                    section.className.includes('header');
            const hasContent = section.textContent.trim().length > 200;
            
            return (hasId || hasSignificantHeight) && (hasImportantClass || hasContent);
        });
        
        mainSections.forEach((section, index) => {
            console.log(`\n--- SECTION ${index + 1}: ${section.id || 'NO ID'} ---`);
            console.log(`Tag: ${section.tagName}`);
            console.log(`Height: ${Math.round(section.position.height)}px`);
            console.log(`Background: ${section.styles.backgroundColor}`);
            
            if (section.id) {
                console.log(`ID: #${section.id}`);
            }
            
            // Extract key classes
            const classes = section.className.split(' ').filter(c => 
                c.includes('section') || c.includes('header') || c.includes('content') || 
                c.includes('elementor-element') && c.length < 30
            );
            if (classes.length > 0) {
                console.log(`Key Classes: ${classes.join(', ')}`);
            }
            
            if (section.images.length > 0) {
                console.log(`Images (${section.images.length}):`);
                section.images.slice(0, 3).forEach(img => {
                    if (!img.src.startsWith('data:')) {
                        console.log(`  • ${img.src}`);
                        if (img.alt) console.log(`    Alt: ${img.alt}`);
                    }
                });
            }
            
            // Get text content headings
            const innerHTML = section.innerHTML;
            const h1Matches = innerHTML.match(/<h1[^>]*>([^<]*)<\/h1>/gi);
            const h2Matches = innerHTML.match(/<h2[^>]*>([^<]*)<\/h2>/gi);
            const h3Matches = innerHTML.match(/<h3[^>]*>([^<]*)<\/h3>/gi);
            
            if (h1Matches) {
                console.log(`H1: ${h1Matches.map(h => h.replace(/<[^>]*>/g, '')).join(', ')}`);
            }
            if (h2Matches) {
                console.log(`H2: ${h2Matches.map(h => h.replace(/<[^>]*>/g, '')).join(', ')}`);
            }
            if (h3Matches) {
                console.log(`H3: ${h3Matches.slice(0, 3).map(h => h.replace(/<[^>]*>/g, '')).join(', ')}`);
            }
            
            // Preview text content (first 150 chars)
            const textPreview = section.textContent.replace(/\s+/g, ' ').trim();
            if (textPreview.length > 10) {
                console.log(`Content: ${textPreview.substring(0, 150)}...`);
            }
        });
        
        // Identify specific functional sections
        console.log('\n=== FUNCTIONAL SECTIONS ===');
        
        const functionalSections = {
            header: data.sections.find(s => s.className.includes('header')),
            hero: data.sections.find(s => s.position.top < 1000 && s.position.height > 400),
            features: data.sections.find(s => s.id === 'sicherheit'),
            process: data.sections.find(s => s.id === 'automatisierte_Buchhaltung'),
            brokers: data.sections.find(s => s.id === 'anbindung_Broker'),
            targetAudience: data.sections.find(s => s.className.includes('swiper-wrapper')),
        };
        
        Object.entries(functionalSections).forEach(([name, section]) => {
            if (section) {
                console.log(`\n${name.toUpperCase()}:`);
                console.log(`  Position: top=${Math.round(section.position.top)}, height=${Math.round(section.position.height)}`);
                console.log(`  ID: ${section.id || 'none'}`);
                console.log(`  Images: ${section.images.length}`);
                if (section.images.length > 0) {
                    section.images.slice(0, 2).forEach(img => {
                        if (!img.src.startsWith('data:')) {
                            console.log(`    - ${img.src.split('/').pop()}`);
                        }
                    });
                }
            }
        });
        
    } catch (error) {
        console.error('Error analyzing structure:', error);
    }
}

analyzeLeistungenStructure();