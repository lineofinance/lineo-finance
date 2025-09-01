const { chromium } = require('playwright');
const fs = require('fs');
const https = require('https');
const path = require('path');

// Function to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to page...');
  await page.goto('https://www.lineo.finance/team_und_partner/', { waitUntil: 'networkidle' });
  
  // Wait for content and carousel to load
  await page.waitForTimeout(5000);
  
  // Scroll to the section to ensure images load
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('h2')).find(h => 
      h.textContent.includes('Beratung trifft Technologie')
    );
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  
  await page.waitForTimeout(2000);
  
  console.log('Extracting carousel structure and partner data...');
  
  const partnerData = await page.evaluate(() => {
    const result = {
      heading: '',
      partners: [],
      carouselStructure: null
    };
    
    // Find the heading
    const heading = Array.from(document.querySelectorAll('h2')).find(h => 
      h.textContent.includes('Beratung trifft Technologie')
    );
    
    if (heading) {
      result.heading = heading.textContent.trim();
      
      // Find the section containing the heading
      let section = heading.closest('.elementor-section') || heading.closest('section');
      
      // Look for carousel/swiper within this section
      const carousel = section ? section.querySelector('.swiper-container, .swiper, .elementor-carousel, .e-n-carousel') : null;
      
      if (carousel) {
        // Get carousel wrapper and slides
        const wrapper = carousel.querySelector('.swiper-wrapper, .e-n-carousel__swiper-wrapper');
        const slides = carousel.querySelectorAll('.swiper-slide, .e-n-carousel-item');
        
        result.carouselStructure = {
          containerClass: carousel.className,
          wrapperClass: wrapper ? wrapper.className : '',
          slideCount: slides.length,
          slides: []
        };
        
        // Extract each slide's content
        slides.forEach((slide, index) => {
          const slideData = {
            index: index,
            className: slide.className,
            partners: []
          };
          
          // Look for partner containers within each slide
          const partnerContainers = slide.querySelectorAll('.e-con.e-child, .elementor-column');
          
          partnerContainers.forEach(container => {
            const heading = container.querySelector('h3');
            const textContent = container.querySelector('.elementor-text-editor');
            const image = container.querySelector('img');
            
            if (heading) {
              const partner = {
                name: heading.textContent.trim(),
                description: textContent ? textContent.textContent.trim() : '',
                logo: null
              };
              
              // Try to find logo - might be in a different structure
              if (image) {
                partner.logo = {
                  src: image.src,
                  alt: image.alt || '',
                  width: image.width,
                  height: image.height
                };
              }
              
              slideData.partners.push(partner);
              result.partners.push(partner);
            }
          });
          
          result.carouselStructure.slides.push(slideData);
        });
      }
      
      // If no carousel found, look for partner cards directly
      if (!carousel) {
        const partnerContainers = section ? section.querySelectorAll('.e-con.e-child') : [];
        
        partnerContainers.forEach(container => {
          const heading = container.querySelector('h3');
          const textContent = container.querySelector('.elementor-text-editor');
          
          if (heading && heading.textContent.match(/Kemper|Zellmann|WSSK|Stenzel|KONEWKA|LowTax|S&V|steueragenten|Finovia/)) {
            result.partners.push({
              name: heading.textContent.trim(),
              description: textContent ? textContent.textContent.trim() : '',
              logo: null
            });
          }
        });
      }
    }
    
    return result;
  });
  
  console.log('\n=== EXTRACTION RESULTS ===');
  console.log('Heading:', partnerData.heading);
  console.log('Total partners found:', partnerData.partners.length);
  
  if (partnerData.carouselStructure) {
    console.log('\nCarousel Structure:');
    console.log('- Container class:', partnerData.carouselStructure.containerClass);
    console.log('- Wrapper class:', partnerData.carouselStructure.wrapperClass);
    console.log('- Number of slides:', partnerData.carouselStructure.slideCount);
    
    partnerData.carouselStructure.slides.forEach(slide => {
      console.log(`  Slide ${slide.index + 1}: ${slide.partners.length} partners`);
      slide.partners.forEach(p => {
        console.log(`    - ${p.name}`);
      });
    });
  }
  
  console.log('\nAll Partners:');
  partnerData.partners.forEach(partner => {
    console.log(`- ${partner.name}`);
    if (partner.logo) {
      console.log(`  Logo: ${partner.logo.src}`);
    }
  });
  
  // Save structured data
  fs.writeFileSync('partners-carousel-data.json', JSON.stringify(partnerData, null, 2));
  console.log('\nData saved to partners-carousel-data.json');
  
  // Download logos if found
  const logosToDownload = partnerData.partners
    .filter(p => p.logo && p.logo.src)
    .map(p => p.logo);
  
  if (logosToDownload.length > 0) {
    console.log(`\nDownloading ${logosToDownload.length} logos...`);
    
    const downloadDir = path.join(__dirname, 'src', 'assets', 'images', 'partners');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    for (const logo of logosToDownload) {
      const filename = path.basename(new URL(logo.src).pathname);
      const filepath = path.join(downloadDir, filename);
      
      try {
        await downloadImage(logo.src, filepath);
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.log(`Failed to download ${filename}: ${err.message}`);
      }
    }
  }
  
  await browser.close();
})();