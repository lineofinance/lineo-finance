const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://www.lineo.finance', { waitUntil: 'networkidle' });
  
  // Wait for testimonials section to load
  await page.waitForTimeout(3000);
  
  // Find and extract the testimonials section
  const testimonialData = await page.evaluate(() => {
    // Try multiple possible selectors for testimonials
    const selectors = [
      '[class*="testimonial"]',
      '[class*="review"]',
      '[class*="feedback"]',
      '[class*="kunden"]',
      '[class*="referenz"]',
      '[id*="testimonial"]',
      '[id*="review"]',
      'section:has(h2:text-matches("testimonial", "i"))',
      'section:has(h2:text-matches("kunden", "i"))',
      'section:has(h2:text-matches("referenz", "i"))',
      'section:has(h2:text-matches("was unsere", "i"))',
      'section:has(h2:text-matches("meinungen", "i"))'
    ];
    
    let testimonialSection = null;
    
    // Try to find the section
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const text = el.textContent?.toLowerCase() || '';
          if (text.includes('kunden') || text.includes('testimonial') || 
              text.includes('referenz') || text.includes('meinung') ||
              text.includes('feedback') || text.includes('bewertung')) {
            testimonialSection = el;
            break;
          }
        }
        if (testimonialSection) break;
      } catch (e) {}
    }
    
    // Also check for sections with review-like content
    if (!testimonialSection) {
      const allSections = document.querySelectorAll('section, .elementor-section');
      for (const section of allSections) {
        const text = section.textContent?.toLowerCase() || '';
        if ((text.includes('"') && text.includes('"')) || 
            (text.includes('★') || text.includes('⭐')) ||
            (text.includes('kunden') && text.includes('sagen')) ||
            text.includes('kundenstimmen')) {
          testimonialSection = section;
          break;
        }
      }
    }
    
    if (!testimonialSection) {
      return { error: 'Testimonials section not found', availableSections: [] };
    }
    
    // Extract HTML
    const html = testimonialSection.outerHTML;
    
    // Extract computed styles for all elements
    const extractStyles = (element) => {
      const styles = window.getComputedStyle(element);
      const important = [
        'display', 'position', 'top', 'left', 'right', 'bottom',
        'width', 'height', 'max-width', 'min-height',
        'margin', 'padding', 'gap',
        'flex-direction', 'justify-content', 'align-items', 'flex-wrap',
        'grid-template-columns', 'grid-template-rows', 'grid-gap',
        'font-family', 'font-size', 'font-weight', 'line-height', 'text-align',
        'color', 'background-color', 'background-image', 'background-position', 'background-size',
        'border', 'border-radius', 'box-shadow',
        'opacity', 'transform', 'transition', 'animation'
      ];
      
      const result = {};
      important.forEach(prop => {
        const value = styles.getPropertyValue(prop);
        if (value && value !== 'none' && value !== 'auto' && value !== 'normal' && value !== '0px') {
          result[prop] = value;
        }
      });
      return result;
    };
    
    // Get styles for main container and key elements
    const containerStyles = extractStyles(testimonialSection);
    
    // Extract images
    const images = [];
    testimonialSection.querySelectorAll('img').forEach(img => {
      images.push({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
    });
    
    return {
      html,
      containerStyles,
      images,
      text: testimonialSection.textContent
    };
  });
  
  // Save the data
  const fs = require('fs');
  fs.writeFileSync('testimonial-data.json', JSON.stringify(testimonialData, null, 2));
  
  // Take screenshot for reference
  await page.screenshot({ path: 'testimonial-section.png', fullPage: true });
  
  await browser.close();
  console.log('Extraction complete!');
})();
