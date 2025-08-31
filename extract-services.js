const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://www.lineo.finance', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Extract the complete page to analyze structure
  const pageAnalysis = await page.evaluate(() => {
    // Find all sections with Leistungen content
    const sections = [];
    
    // Look for the Leistungen heading and get its parent section
    document.querySelectorAll('h2, h3').forEach(heading => {
      if (heading.textContent.includes('Leistungen')) {
        let parent = heading.parentElement;
        // Go up until we find a section-level container
        while (parent && parent.parentElement) {
          if (parent.className.includes('elementor-section') || 
              parent.className.includes('elementor-element') ||
              parent.tagName === 'SECTION') {
            break;
          }
          parent = parent.parentElement;
        }
        
        // Now find all the service cards below this heading
        const serviceCards = [];
        
        // Look for icon boxes or service items
        const cards = parent.querySelectorAll('.elementor-widget-icon-box, .elementor-widget-image-box, [class*="service"], [class*="feature"]');
        
        // If no cards found with those selectors, look for columns
        const columns = parent.querySelectorAll('.elementor-column, .elementor-col-25, .elementor-col-33');
        
        const elementsToProcess = cards.length > 0 ? cards : columns;
        
        elementsToProcess.forEach(element => {
          const iconElement = element.querySelector('img, svg, .elementor-icon i');
          const titleElement = element.querySelector('h3, h4, .elementor-icon-box-title, .elementor-heading-title');
          const descElement = element.querySelector('p, .elementor-icon-box-description, .elementor-text-editor');
          
          if (titleElement || descElement) {
            serviceCards.push({
              icon: iconElement ? {
                type: iconElement.tagName.toLowerCase(),
                class: iconElement.className,
                src: iconElement.src || null,
                svg: iconElement.tagName === 'svg' ? iconElement.outerHTML : null,
                iconClass: iconElement.tagName === 'I' ? iconElement.className : null
              } : null,
              title: titleElement ? titleElement.textContent.trim() : '',
              description: descElement ? descElement.textContent.trim() : '',
              styles: {
                container: window.getComputedStyle(element).cssText,
                title: titleElement ? window.getComputedStyle(titleElement).cssText : '',
                description: descElement ? window.getComputedStyle(descElement).cssText : ''
              }
            });
          }
        });
        
        sections.push({
          heading: heading.textContent.trim(),
          headingTag: heading.tagName.toLowerCase(),
          cards: serviceCards,
          sectionClass: parent.className,
          sectionId: parent.id || null
        });
      }
    });
    
    // Also look for sections that might be services without explicit "Leistungen" heading
    const additionalSections = document.querySelectorAll('[data-id*="ca0f5e9"], [data-id*="5e7e5c5"], .services-section, #services');
    
    additionalSections.forEach(section => {
      const cards = [];
      const cardElements = section.querySelectorAll('.elementor-widget-icon-box, .elementor-column');
      
      cardElements.forEach(element => {
        const iconElement = element.querySelector('img, svg, .elementor-icon i');
        const titleElement = element.querySelector('h3, h4, .elementor-icon-box-title');
        const descElement = element.querySelector('p, .elementor-icon-box-description');
        
        if (titleElement || descElement) {
          cards.push({
            icon: iconElement ? {
              type: iconElement.tagName.toLowerCase(),
              class: iconElement.className,
              src: iconElement.src || null,
              iconClass: iconElement.tagName === 'I' ? iconElement.className : null
            } : null,
            title: titleElement ? titleElement.textContent.trim() : '',
            description: descElement ? descElement.textContent.trim() : ''
          });
        }
      });
      
      if (cards.length > 0) {
        sections.push({
          heading: 'Additional Services Section',
          cards: cards,
          sectionClass: section.className,
          sectionId: section.id || section.getAttribute('data-id')
        });
      }
    });
    
    return sections;
  });
  
  console.log(JSON.stringify(pageAnalysis, null, 2));
  
  // Take a screenshot for reference
  await page.screenshot({ path: 'leistungen-section.png', fullPage: true });
  
  await browser.close();
})();