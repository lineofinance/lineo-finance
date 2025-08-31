const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://www.lineo.finance');
  await page.waitForLoadState('networkidle');
  
  // Scroll to ensure everything is loaded
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  
  // Find and extract the complete Leistungen section
  const leistungenData = await page.evaluate(() => {
    // Find the section containing "Leistungen" heading and its content
    const heading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.trim() === 'Leistungen');
    
    if (!heading) {
      return { error: 'Leistungen heading not found' };
    }
    
    // Get the complete section - go up to find the main section container
    let section = heading.parentElement;
    while (section && !section.classList.contains('elementor-section')) {
      section = section.parentElement;
    }
    
    if (!section) {
      return { error: 'Could not find section container' };
    }
    
    // Helper function to extract computed styles
    const getStyles = (element) => {
      const styles = window.getComputedStyle(element);
      return {
        // Layout
        display: styles.display,
        position: styles.position,
        width: styles.width,
        height: styles.height,
        margin: styles.margin,
        padding: styles.padding,
        
        // Background
        background: styles.background,
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        backgroundSize: styles.backgroundSize,
        backgroundPosition: styles.backgroundPosition,
        
        // Typography
        color: styles.color,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        textAlign: styles.textAlign,
        
        // Borders
        border: styles.border,
        borderRadius: styles.borderRadius,
        
        // Effects
        boxShadow: styles.boxShadow,
        opacity: styles.opacity,
        transform: styles.transform,
        
        // Flex/Grid
        flexDirection: styles.flexDirection,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        gap: styles.gap,
        gridTemplateColumns: styles.gridTemplateColumns
      };
    };
    
    // Extract the cards/items in the Leistungen section
    const cards = [];
    const cardElements = section.querySelectorAll('.elementor-widget-icon-box, .elementor-widget-image-box, .elementor-col-25, .elementor-col-33');
    
    cardElements.forEach(card => {
      const icon = card.querySelector('img, svg, .elementor-icon');
      const title = card.querySelector('h3, h4, .elementor-icon-box-title, .elementor-image-box-title');
      const description = card.querySelector('p, .elementor-icon-box-description, .elementor-image-box-description');
      
      const cardData = {
        html: card.outerHTML,
        styles: getStyles(card),
        content: {
          title: title ? title.textContent.trim() : '',
          description: description ? description.textContent.trim() : '',
          icon: icon ? {
            src: icon.src || '',
            svg: icon.tagName === 'svg' ? icon.outerHTML : '',
            class: icon.className
          } : null
        }
      };
      
      if (cardData.content.title || cardData.content.description) {
        cards.push(cardData);
      }
    });
    
    // Get all images in the section
    const images = [];
    section.querySelectorAll('img').forEach(img => {
      images.push({
        src: img.src,
        alt: img.alt || '',
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        class: img.className
      });
    });
    
    // Get the main structure
    return {
      sectionHTML: section.outerHTML,
      sectionStyles: getStyles(section),
      heading: {
        text: heading.textContent.trim(),
        tag: heading.tagName.toLowerCase(),
        styles: getStyles(heading)
      },
      cards: cards,
      images: images,
      bounds: {
        width: section.offsetWidth,
        height: section.offsetHeight
      }
    };
  });
  
  console.log(JSON.stringify(leistungenData, null, 2));
  
  await browser.close();
})();