const { chromium } = require('playwright');

async function extractSpecificSections() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to https://www.lineo.finance/leistungen/...');
    await page.goto('https://www.lineo.finance/leistungen/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    const sectionsData = await page.evaluate(() => {
      const sections = {};
      
      // Helper function to get computed styles for an element
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
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          lineHeight: styles.lineHeight,
          textAlign: styles.textAlign,
          width: styles.width,
          height: styles.height,
          maxWidth: styles.maxWidth,
          minHeight: styles.minHeight,
          position: styles.position,
          top: styles.top,
          left: styles.left,
          zIndex: styles.zIndex,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          gap: styles.gap
        };
      }
      
      // 1. Hero Section - Look for yellow background section
      const heroSelectors = [
        '[style*="background"][style*="yellow"], [style*="background"][style*="#FFD700"], [style*="background"][style*="rgb(255, 215, 0)"]',
        '.hero, .hero-section, .banner',
        '[class*="hero"]',
        'section:first-of-type',
        '.elementor-section:first-child'
      ];
      
      for (const selector of heroSelectors) {
        const heroElement = document.querySelector(selector);
        if (heroElement && heroElement.textContent.includes('Zukunft der Wertpapierbuch')) {
          sections.hero = {
            name: 'Hero Section',
            selector: heroElement.className,
            html: heroElement.outerHTML,
            styles: getComputedStyles(heroElement),
            textPreview: heroElement.textContent.substring(0, 300),
            dimensions: {
              width: heroElement.offsetWidth,
              height: heroElement.offsetHeight
            }
          };
          break;
        }
      }
      
      // 2. Benefits Section
      const benefitsSelectors = [
        '*[class*="benefit"], *[class*="advantage"], *[class*="warum"]',
        'section, .section, .elementor-section'
      ];
      
      for (const selector of benefitsSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.textContent.includes('Warum lineo finance') || element.textContent.includes('richtige Wahl')) {
            sections.benefits = {
              name: 'Benefits Section',
              selector: element.className,
              html: element.outerHTML,
              styles: getComputedStyles(element),
              textPreview: element.textContent.substring(0, 300),
              dimensions: {
                width: element.offsetWidth,
                height: element.offsetHeight
              }
            };
          }
        });
      }
      
      // 3. Process/Automation Section
      const processSelectors = [
        '*[class*="process"], *[class*="automation"], *[class*="workflow"]',
        'section, .section, .elementor-section'
      ];
      
      for (const selector of processSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.textContent.includes('So automatisiert') || element.textContent.includes('automatisiert lineo finance')) {
            sections.process = {
              name: 'Process/Automation Section',
              selector: element.className,
              html: element.outerHTML,
              styles: getComputedStyles(element),
              textPreview: element.textContent.substring(0, 300),
              dimensions: {
                width: element.offsetWidth,
                height: element.offsetHeight
              }
            };
          }
        });
      }
      
      // 4. Broker Integration Section
      const brokerSelectors = [
        '*[class*="broker"], *[class*="integration"]',
        'section, .section, .elementor-section'
      ];
      
      for (const selector of brokerSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.textContent.includes('Unterstützte Broker') || element.textContent.includes('broker')) {
            sections.broker = {
              name: 'Broker Integration Section',
              selector: element.className,
              html: element.outerHTML,
              styles: getComputedStyles(element),
              textPreview: element.textContent.substring(0, 300),
              dimensions: {
                width: element.offsetWidth,
                height: element.offsetHeight
              }
            };
          }
        });
      }
      
      // 5. Target Audience Carousel Section
      const carouselElement = document.querySelector('.elementor-widget-n-carousel, [class*="carousel"], .swiper');
      if (carouselElement) {
        sections.carousel = {
          name: 'Target Audience Carousel Section',
          selector: carouselElement.className,
          html: carouselElement.outerHTML,
          styles: getComputedStyles(carouselElement),
          textPreview: carouselElement.textContent.substring(0, 300),
          dimensions: {
            width: carouselElement.offsetWidth,
            height: carouselElement.offsetHeight
          }
        };
      }
      
      // 6. Contact CTA Section
      const ctaSelectors = [
        '*[class*="cta"], *[class*="contact"], *[class*="kontakt"]',
        'section, .section, .elementor-section'
      ];
      
      for (const selector of ctaSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.textContent.includes('Kontakt') || element.textContent.includes('unverbindlich') || element.textContent.includes('Termin')) {
            sections.cta = {
              name: 'Contact CTA Section',
              selector: element.className,
              html: element.outerHTML,
              styles: getComputedStyles(element),
              textPreview: element.textContent.substring(0, 300),
              dimensions: {
                width: element.offsetWidth,
                height: element.offsetHeight
              }
            };
          }
        });
      }
      
      // 7. FAQ Section
      const faqElement = document.querySelector('.elementor-widget-n-accordion, [class*="faq"], [class*="accordion"]');
      if (faqElement) {
        sections.faq = {
          name: 'FAQ Section',
          selector: faqElement.className,
          html: faqElement.outerHTML,
          styles: getComputedStyles(faqElement),
          textPreview: faqElement.textContent.substring(0, 300),
          dimensions: {
            width: faqElement.offsetWidth,
            height: faqElement.offsetHeight
          }
        };
      }
      
      return sections;
    });
    
    // Get all images
    const images = await page.evaluate(() => {
      return Array.from(document.images).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        className: img.className,
        parentClassName: img.parentElement?.className || '',
        computedStyles: {
          width: window.getComputedStyle(img).width,
          height: window.getComputedStyle(img).height,
          objectFit: window.getComputedStyle(img).objectFit,
          display: window.getComputedStyle(img).display
        }
      }));
    });
    
    console.log('=== LINEO FINANCE LEISTUNGEN PAGE EXTRACTION ===\n');
    
    Object.keys(sectionsData).forEach(key => {
      const section = sectionsData[key];
      console.log(`--- ${section.name.toUpperCase()} ---`);
      console.log(`Selector: ${section.selector}`);
      console.log(`Dimensions: ${section.dimensions.width}x${section.dimensions.height}`);
      console.log(`Text Preview: ${section.textPreview}`);
      console.log(`\nKey Styles:`);
      console.log(JSON.stringify(section.styles, null, 2));
      console.log(`\nHTML (first 2000 chars):`);
      console.log(section.html.substring(0, 2000) + (section.html.length > 2000 ? '...[truncated]' : ''));
      console.log('\n' + '='.repeat(80) + '\n');
    });
    
    console.log(`=== IMAGES (${images.length} found) ===\n`);
    images.forEach((img, index) => {
      console.log(`${index + 1}. ${img.src}`);
      console.log(`   Alt: "${img.alt}"`);
      console.log(`   Natural: ${img.width}x${img.height}`);
      console.log(`   Computed: ${img.computedStyles.width} x ${img.computedStyles.height}`);
      console.log(`   Class: ${img.className}`);
      console.log(`   Parent: ${img.parentClassName}`);
      console.log('');
    });
    
    return { sections: sectionsData, images };
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the extraction
extractSpecificSections().catch(console.error);