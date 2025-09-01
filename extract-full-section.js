const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to page...');
  await page.goto('https://www.lineo.finance/team_und_partner/', { waitUntil: 'networkidle' });
  
  // Wait for content to load
  await page.waitForTimeout(3000);
  
  console.log('Extracting full section with carousel...');
  
  // Extract the complete section data
  const sectionData = await page.evaluate(() => {
    // First, find the "Beratung trifft Technologie" heading
    const heading = Array.from(document.querySelectorAll('h2')).find(h => 
      h.textContent.includes('Beratung trifft Technologie')
    );
    
    if (!heading) {
      return { error: 'Heading not found' };
    }
    
    // Find all the partner cards that come after this heading
    // They appear to be h3 elements with company names
    const partnerHeadings = [
      'Dipl.-Kfm. (FH) Macus Kemper',
      'Zellmann & Schaz PartG mbB',
      'WSSK Stuhlmann Feldmann Breiden Westermilies',
      '4S Stenzel, Schmidt und Kollegen',
      'FRANK KONEWKA',
      'LowTax Steuerberatungs GmbH',
      'S&V Steuern und Vermögen',
      'steueragenten.de',
      'VM Finovia GmbH'
    ];
    
    // Find the section containing these partners
    let parentSection = heading;
    while (parentSection && parentSection.parentElement) {
      parentSection = parentSection.parentElement;
      // Check if this element contains partner cards
      const h3s = parentSection.querySelectorAll('h3');
      const hasPartners = Array.from(h3s).some(h3 => 
        partnerHeadings.some(partner => h3.textContent.includes(partner))
      );
      
      if (hasPartners && parentSection.classList.contains('elementor-section')) {
        break;
      }
    }
    
    // Extract all the data we need
    const result = {
      headingText: heading.textContent.trim(),
      sectionHTML: parentSection.outerHTML,
      partners: []
    };
    
    // Find all partner cards/items
    const partnerElements = parentSection.querySelectorAll('.elementor-widget-heading');
    partnerElements.forEach(elem => {
      const h3 = elem.querySelector('h3');
      if (h3 && partnerHeadings.some(p => h3.textContent.includes(p))) {
        // Find the parent column that contains this partner
        let col = elem.closest('.elementor-column');
        if (col) {
          const images = Array.from(col.querySelectorAll('img'));
          result.partners.push({
            name: h3.textContent.trim(),
            images: images.map(img => ({
              src: img.src,
              alt: img.alt || '',
              width: img.width,
              height: img.height
            }))
          });
        }
      }
    });
    
    // Check for carousel/swiper structure
    const carousel = parentSection.querySelector('.swiper-container, .swiper, .elementor-carousel');
    if (carousel) {
      result.hasCarousel = true;
      result.carouselClass = carousel.className;
      const slides = carousel.querySelectorAll('.swiper-slide');
      result.slideCount = slides.length;
    }
    
    return result;
  });
  
  console.log('Extraction complete!');
  console.log('Heading:', sectionData.headingText);
  console.log('Partners found:', sectionData.partners ? sectionData.partners.length : 0);
  console.log('Has carousel:', sectionData.hasCarousel);
  
  if (sectionData.partners) {
    console.log('\nPartner details:');
    sectionData.partners.forEach(partner => {
      console.log(`- ${partner.name}`);
      if (partner.images && partner.images.length > 0) {
        partner.images.forEach(img => {
          console.log(`  Image: ${img.src}`);
        });
      }
    });
  }
  
  // Save the HTML for analysis
  if (sectionData.sectionHTML) {
    fs.writeFileSync('extracted-partners-section.html', sectionData.sectionHTML);
    console.log('\nFull HTML saved to extracted-partners-section.html');
    
    // Also save structured data
    fs.writeFileSync('partners-data.json', JSON.stringify(sectionData, null, 2));
    console.log('Structured data saved to partners-data.json');
  }
  
  await browser.close();
})();