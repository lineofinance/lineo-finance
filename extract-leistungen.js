const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.lineo.finance');
  await page.waitForLoadState('networkidle');
  
  // Find the Leistungen section
  const leistungenSection = await page.evaluate(() => {
    // Look for the section with "Leistungen" heading
    const headings = document.querySelectorAll('h2, h3');
    let section = null;
    
    for (const heading of headings) {
      if (heading.textContent.includes('Leistungen') || heading.textContent.includes('Unsere Leistungen')) {
        // Get the parent section
        section = heading.closest('section') || heading.closest('div.elementor-section') || heading.parentElement;
        break;
      }
    }
    
    if (!section) {
      // Try to find by class or ID
      section = document.querySelector('.leistungen-section, #leistungen, [data-id*="leistungen"]');
    }
    
    if (!section) {
      // Look for the features/services area
      section = document.querySelector('.elementor-element-ca0f5e9, .elementor-element-5e7e5c5');
    }
    
    if (!section) {
      return { error: 'Leistungen section not found' };
    }
    
    // Extract HTML
    const html = section.outerHTML;
    
    // Extract all styles
    const extractStyles = (element) => {
      const styles = window.getComputedStyle(element);
      const important = [
        'display', 'position', 'width', 'height', 'margin', 'padding',
        'background', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
        'color', 'fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'textAlign',
        'border', 'borderRadius', 'boxShadow', 'flexDirection', 'justifyContent', 
        'alignItems', 'gap', 'gridTemplateColumns', 'transform', 'opacity'
      ];
      
      const styleObj = {};
      important.forEach(prop => {
        const value = styles[prop];
        if (value && value !== 'none' && value !== 'normal' && value !== '0px') {
          styleObj[prop] = value;
        }
      });
      return styleObj;
    };
    
    // Get styles for main section and key elements
    const mainStyles = extractStyles(section);
    
    // Get child element styles
    const childStyles = {};
    const keyElements = section.querySelectorAll('.elementor-widget-container, .elementor-column, .elementor-heading-title, .elementor-widget-text-editor');
    keyElements.forEach((el, index) => {
      if (el.className) {
        childStyles[el.className.split(' ')[0]] = extractStyles(el);
      }
    });
    
    // Extract images
    const images = [];
    section.querySelectorAll('img').forEach(img => {
      images.push({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        class: img.className
      });
    });
    
    // Extract text content structure
    const textContent = {
      headings: Array.from(section.querySelectorAll('h1, h2, h3, h4')).map(h => ({
        tag: h.tagName.toLowerCase(),
        text: h.textContent.trim(),
        class: h.className
      })),
      paragraphs: Array.from(section.querySelectorAll('p, .elementor-text-editor')).map(p => ({
        text: p.textContent.trim(),
        class: p.className
      }))
    };
    
    return {
      html: html,
      styles: {
        main: mainStyles,
        children: childStyles
      },
      images: images,
      content: textContent,
      bounds: section.getBoundingClientRect()
    };
  });
  
  console.log(JSON.stringify(leistungenSection, null, 2));
  
  await browser.close();
})();