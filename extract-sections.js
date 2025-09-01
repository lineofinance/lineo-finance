const { chromium } = require('playwright');

async function extractSections() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to https://www.lineo.finance/leistungen/...');
    await page.goto('https://www.lineo.finance/leistungen/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Extract all sections with their HTML and computed styles
    const sectionsData = await page.evaluate(() => {
      const sections = [];
      
      // Helper function to get computed styles for an element
      function getComputedStyles(element) {
        const styles = window.getComputedStyle(element);
        const importantStyles = {};
        
        // Key style properties to extract
        const properties = [
          'display', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems',
          'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
          'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
          'backgroundColor', 'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
          'textAlign', 'width', 'height', 'maxWidth', 'minHeight',
          'background', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
          'border', 'borderRadius', 'boxShadow', 'position', 'top', 'right', 'bottom', 'left',
          'zIndex', 'overflow', 'gap', 'gridTemplateColumns', 'gridGap'
        ];
        
        properties.forEach(prop => {
          const value = styles.getPropertyValue(prop);
          if (value) {
            importantStyles[prop] = value;
          }
        });
        
        return importantStyles;
      }
      
      // Try to find sections by various selectors and content
      const potentialSections = [
        // Look for hero/banner sections
        document.querySelector('.hero, .hero-section, .banner, .jumbotron, [class*="hero"]'),
        
        // Look for main content sections
        ...document.querySelectorAll('section'),
        ...document.querySelectorAll('.section'),
        ...document.querySelectorAll('main > div'),
        ...document.querySelectorAll('.container > div'),
        ...document.querySelectorAll('[class*="section"]'),
        
        // Look for specific content patterns
        ...document.querySelectorAll('[class*="benefit"], [class*="advantage"], [class*="warum"]'),
        ...document.querySelectorAll('[class*="process"], [class*="automation"], [class*="workflow"]'),
        ...document.querySelectorAll('[class*="broker"], [class*="integration"]'),
        ...document.querySelectorAll('[class*="carousel"], [class*="swiper"], [class*="slider"]'),
        ...document.querySelectorAll('[class*="cta"], [class*="contact"], [class*="kontakt"]'),
        ...document.querySelectorAll('[class*="faq"], [class*="accordion"]')
      ];
      
      // Remove duplicates and null elements
      const uniqueSections = [...new Set(potentialSections.filter(el => el && el.offsetHeight > 50))];
      
      uniqueSections.forEach((section, index) => {
        const textContent = section.textContent?.trim().substring(0, 300) || '';
        const className = section.className || section.tagName.toLowerCase();
        
        // Try to identify section type based on content
        let sectionName = `Section ${index + 1}`;
        if (textContent.includes('Zukunft der Wertpapierbuch')) {
          sectionName = 'Hero Section';
        } else if (textContent.includes('Warum lineo finance') || textContent.includes('richtige Wahl')) {
          sectionName = 'Benefits Section';
        } else if (textContent.includes('So automatisiert') || textContent.includes('automation')) {
          sectionName = 'Process/Automation Section';
        } else if (textContent.includes('Unterstützte Broker') || textContent.includes('broker')) {
          sectionName = 'Broker Integration Section';
        } else if (textContent.includes('Für wen eignet sich') || className.includes('carousel') || className.includes('swiper')) {
          sectionName = 'Target Audience Carousel Section';
        } else if (textContent.includes('FAQ') || className.includes('faq')) {
          sectionName = 'FAQ Section';
        } else if (textContent.includes('Kontakt') || className.includes('cta') || className.includes('contact')) {
          sectionName = 'Contact CTA Section';
        }
        
        sections.push({
          name: sectionName,
          html: section.outerHTML,
          styles: getComputedStyles(section),
          selector: className,
          textPreview: textContent.substring(0, 200),
          dimensions: {
            width: section.offsetWidth,
            height: section.offsetHeight,
            scrollWidth: section.scrollWidth,
            scrollHeight: section.scrollHeight
          }
        });
      });
      
      return sections;
    });
    
    // Get all images and their properties
    const images = await page.evaluate(() => {
      return Array.from(document.images).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        className: img.className,
        computedStyles: {
          width: window.getComputedStyle(img).width,
          height: window.getComputedStyle(img).height,
          objectFit: window.getComputedStyle(img).objectFit,
          display: window.getComputedStyle(img).display
        }
      }));
    });
    
    // Get page title and meta info
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }));
    
    console.log(`=== PAGE INFO ===`);
    console.log(JSON.stringify(pageInfo, null, 2));
    
    console.log(`\n=== FOUND ${sectionsData.length} SECTIONS ===`);
    
    sectionsData.forEach((section, index) => {
      console.log(`\n--- ${section.name.toUpperCase()} ---`);
      console.log(`Selector: ${section.selector}`);
      console.log(`Dimensions: ${section.dimensions.width}x${section.dimensions.height}`);
      console.log(`Text Preview: ${section.textPreview}`);
      console.log(`\nHTML (truncated to 1000 chars):`);
      console.log(section.html.substring(0, 1000) + (section.html.length > 1000 ? '...' : ''));
      console.log(`\nKey Styles:`);
      console.log(JSON.stringify(section.styles, null, 2));
    });
    
    console.log(`\n=== IMAGES (${images.length} found) ===`);
    images.forEach((img, index) => {
      console.log(`${index + 1}. ${img.src}`);
      console.log(`   Alt: ${img.alt}`);
      console.log(`   Dimensions: ${img.width}x${img.height}`);
      console.log(`   Class: ${img.className}`);
      console.log(`   Computed: ${JSON.stringify(img.computedStyles)}`);
    });
    
    return { sections: sectionsData, images, pageInfo };
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the extraction
extractSections().catch(console.error);