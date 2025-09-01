const { chromium } = require('playwright');

async function extractAllSections() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to https://www.lineo.finance/leistungen/...');
    await page.goto('https://www.lineo.finance/leistungen/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Scroll through the page to load all lazy-loaded content
    console.log('Scrolling through page to load content...');
    await page.evaluate(async () => {
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      
      for (let i = 0; i < 10; i++) {
        window.scrollBy(0, window.innerHeight);
        await delay(500);
      }
      
      // Scroll back to top
      window.scrollTo(0, 0);
      await delay(1000);
    });
    
    // Wait for lazy loading
    await page.waitForTimeout(3000);
    
    const allSectionsData = await page.evaluate(() => {
      const sections = [];
      
      // Helper function to get computed styles
      function getComputedStyles(element) {
        if (!element) return {};
        const styles = window.getComputedStyle(element);
        return {
          display: styles.display,
          flexDirection: styles.flexDirection,
          justifyContent: styles.justifyContent,
          alignItems: styles.alignItems,
          margin: styles.margin,
          padding: styles.padding,
          backgroundColor: styles.backgroundColor,
          background: styles.background,
          backgroundImage: styles.backgroundImage,
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          textAlign: styles.textAlign,
          width: styles.width,
          height: styles.height,
          maxWidth: styles.maxWidth,
          position: styles.position,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          gap: styles.gap
        };
      }
      
      // Get all major Elementor sections
      const elementorSections = document.querySelectorAll('.elementor-section, .e-con, .elementor-widget, [data-element_type="container"], [data-element_type="section"]');
      
      elementorSections.forEach((section, index) => {
        if (section.offsetHeight > 100) { // Only sections with substantial content
          const textContent = section.textContent?.trim() || '';
          const className = section.className || section.tagName.toLowerCase();
          
          // Try to identify section type based on content
          let sectionName = `Section ${index + 1}`;
          let sectionType = 'unknown';
          
          if (textContent.includes('Die Zukunft der Wertpapierbuch') || 
              textContent.includes('Wertpapierbuchhaltung') && 
              (section.style.background?.includes('yellow') || 
               section.style.background?.includes('#FFD700') ||
               className.includes('hero'))) {
            sectionName = 'Hero Section';
            sectionType = 'hero';
          } else if (textContent.includes('Warum lineo finance') || 
                    textContent.includes('richtige Wahl') || 
                    textContent.includes('Vorteile')) {
            sectionName = 'Benefits Section';
            sectionType = 'benefits';
          } else if (textContent.includes('So automatisiert') || 
                    textContent.includes('Automatisierung') ||
                    textContent.includes('Prozess')) {
            sectionName = 'Process/Automation Section';
            sectionType = 'process';
          } else if (textContent.includes('Unterstützte Broker') || 
                    textContent.includes('Brokeranbindung') ||
                    (textContent.includes('Broker') && textContent.includes('Integration'))) {
            sectionName = 'Broker Integration Section';
            sectionType = 'broker';
          } else if (className.includes('carousel') || 
                    className.includes('swiper') || 
                    textContent.includes('Für wen eignet sich') ||
                    textContent.includes('Zielgruppe')) {
            sectionName = 'Target Audience Carousel Section';
            sectionType = 'carousel';
          } else if (textContent.includes('Kontakt') && 
                   (textContent.includes('unverbindlich') || textContent.includes('Termin'))) {
            sectionName = 'Contact CTA Section';
            sectionType = 'cta';
          } else if (className.includes('accordion') || 
                   className.includes('faq') || 
                   textContent.includes('Welche Transaktionen') ||
                   textContent.includes('Häufige Fragen')) {
            sectionName = 'FAQ Section';
            sectionType = 'faq';
          }
          
          // Get all images in this section
          const sectionImages = Array.from(section.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            className: img.className
          }));
          
          sections.push({
            name: sectionName,
            type: sectionType,
            selector: className,
            html: section.outerHTML,
            styles: getComputedStyles(section),
            textPreview: textContent.substring(0, 400),
            images: sectionImages,
            dimensions: {
              width: section.offsetWidth,
              height: section.offsetHeight,
              scrollHeight: section.scrollHeight
            },
            position: {
              offsetTop: section.offsetTop,
              offsetLeft: section.offsetLeft
            }
          });
        }
      });
      
      return sections;
    });
    
    // Filter to get unique sections (avoid duplicates)
    const uniqueSections = {};
    const targetTypes = ['hero', 'benefits', 'process', 'broker', 'carousel', 'cta', 'faq'];
    
    // First pass: get sections we specifically want
    allSectionsData.forEach(section => {
      if (targetTypes.includes(section.type) && !uniqueSections[section.type]) {
        uniqueSections[section.type] = section;
      }
    });
    
    // Second pass: get remaining sections with significant content
    allSectionsData.forEach(section => {
      if (section.type === 'unknown' && section.dimensions.height > 200 && 
          section.textPreview.length > 100) {
        const key = `section_${Object.keys(uniqueSections).length}`;
        uniqueSections[key] = section;
      }
    });
    
    console.log('=== COMPLETE LINEO FINANCE LEISTUNGEN EXTRACTION ===\n');
    
    Object.keys(uniqueSections).forEach(key => {
      const section = uniqueSections[key];
      console.log(`--- ${section.name.toUpperCase()} (${section.type}) ---`);
      console.log(`Selector: ${section.selector}`);
      console.log(`Dimensions: ${section.dimensions.width}x${section.dimensions.height}`);
      console.log(`Position: ${section.position.offsetTop}px from top`);
      console.log(`Images: ${section.images.length} found`);
      
      // Log image details if any
      if (section.images.length > 0) {
        section.images.forEach((img, idx) => {
          console.log(`  Image ${idx + 1}: ${img.src}`);
          console.log(`    Alt: "${img.alt}"`);
          console.log(`    Size: ${img.width}x${img.height}`);
        });
      }
      
      console.log(`Text Preview: ${section.textPreview}`);
      console.log(`\nKey Styles:`);
      console.log(JSON.stringify(section.styles, null, 2));
      console.log(`\nHTML (first 1500 chars):`);
      console.log(section.html.substring(0, 1500) + (section.html.length > 1500 ? '...[truncated]' : ''));
      console.log('\n' + '='.repeat(100) + '\n');
    });
    
    // Also get page-level images that might not be in sections
    const allImages = await page.evaluate(() => {
      return Array.from(document.images)
        .filter(img => !img.src.startsWith('data:image/svg+xml'))
        .map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.naturalWidth,
          height: img.naturalHeight,
          className: img.className,
          parentText: img.parentElement?.textContent?.substring(0, 100) || ''
        }));
    });
    
    console.log(`=== ALL REAL IMAGES (${allImages.length} found) ===\n`);
    allImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img.src}`);
      console.log(`   Alt: "${img.alt}"`);
      console.log(`   Size: ${img.width}x${img.height}`);
      console.log(`   Context: "${img.parentText}"`);
      console.log('');
    });
    
    return { sections: uniqueSections, allImages };
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the extraction
extractAllSections().catch(console.error);