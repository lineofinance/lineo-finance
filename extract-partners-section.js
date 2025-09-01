const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to page...');
  await page.goto('https://www.lineo.finance/team_und_partner/', { waitUntil: 'networkidle' });
  
  console.log('Extracting section data...');
  
  // Find and extract the section
  const sectionData = await page.evaluate(() => {
    // Find the section by looking for the heading
    const headings = Array.from(document.querySelectorAll('h2, h3, h4'));
    const targetHeading = headings.find(h => 
      h.textContent && h.textContent.includes('Beratung trifft Technologie')
    );
    
    if (!targetHeading) {
      return { found: false, message: 'Heading not found' };
    }
    
    // Find the top-level elementor section containing this heading
    let section = targetHeading;
    while (section && !section.classList.contains('elementor-top-section')) {
      section = section.parentElement;
    }
    
    if (!section) {
      // Fallback: get the closest elementor-section
      section = targetHeading.closest('.elementor-section');
    }
    
    if (!section) {
      return { found: false, message: 'Section container not found' };
    }
    
    // Extract carousel/slider information
    const carousels = section.querySelectorAll('.swiper-container, .swiper, .elementor-carousel, .elementor-image-carousel, [class*="carousel"]');
    const carouselData = [];
    
    carousels.forEach(carousel => {
      const slides = carousel.querySelectorAll('.swiper-slide, .elementor-carousel-item, [class*="slide"]');
      const images = Array.from(carousel.querySelectorAll('img'));
      
      carouselData.push({
        className: carousel.className,
        slideCount: slides.length,
        images: images.map(img => ({
          src: img.src,
          alt: img.alt || '',
          title: img.title || ''
        }))
      });
    });
    
    // Extract all images in the section
    const allImages = Array.from(section.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt || '',
      title: img.title || '',
      parent: img.parentElement.className
    }));
    
    return {
      found: true,
      html: section.outerHTML,
      headingText: targetHeading.textContent,
      sectionClass: section.className,
      carouselData,
      allImages
    };
  });
  
  if (sectionData.found) {
    console.log('Section found!');
    console.log('Heading:', sectionData.headingText);
    console.log('Classes:', sectionData.sectionClass);
    console.log('Carousels found:', sectionData.carouselData.length);
    console.log('Total images:', sectionData.allImages.length);
    
    if (sectionData.carouselData.length > 0) {
      console.log('\nCarousel data:');
      sectionData.carouselData.forEach((c, i) => {
        console.log(`Carousel ${i + 1}: ${c.slideCount} slides, ${c.images.length} images`);
        c.images.forEach(img => console.log(`  - ${img.src}`));
      });
    }
    
    if (sectionData.allImages.length > 0) {
      console.log('\nAll images in section:');
      sectionData.allImages.forEach(img => console.log(`  - ${img.src}`));
    }
    
    console.log('\n--- HTML START ---');
    console.log(sectionData.html);
    console.log('--- HTML END ---\n');
  } else {
    console.log('Section not found. Listing all sections on the page...');
    
    const allSections = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('h2, h3'));
      return sections.map(h => ({
        tag: h.tagName,
        text: h.textContent.trim(),
        parent: h.parentElement.className
      }));
    });
    
    console.log('All sections found:');
    allSections.forEach(s => console.log(`- ${s.tag}: "${s.text}"`));
  }
  
  await browser.close();
})();