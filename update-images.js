#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to check if WebP version exists
function webpExists(imagePath) {
  const webpPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const fullPath = path.join(__dirname, 'src', webpPath);
  return fs.existsSync(fullPath);
}

// Function to update image tag to picture element with WebP
function updateImageTag(html) {
  // Pattern to match img tags
  const imgPattern = /<img\s+([^>]*?)src=["']([^"']+\.(png|jpg|jpeg))["']([^>]*?)>/gi;
  
  return html.replace(imgPattern, (match, beforeSrc, src, ext, afterSrc) => {
    // Skip if already in a picture element
    if (html.indexOf(`<picture>`) > -1 && html.indexOf(match) > html.lastIndexOf(`<picture>`)) {
      return match;
    }
    
    // Check if it's an external URL
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return match;
    }
    
    // Extract attributes
    const allAttrs = beforeSrc + afterSrc;
    const altMatch = allAttrs.match(/alt=["']([^"']*?)["']/);
    const classMatch = allAttrs.match(/class=["']([^"']*?)["']/);
    const widthMatch = allAttrs.match(/width=["']?(\d+)["']?/);
    const heightMatch = allAttrs.match(/height=["']?(\d+)["']?/);
    
    const alt = altMatch ? altMatch[1] : '';
    const className = classMatch ? ` class="${classMatch[1]}"` : '';
    const width = widthMatch ? ` width="${widthMatch[1]}"` : '';
    const height = heightMatch ? ` height="${heightMatch[1]}"` : '';
    
    // Check if it's a hero/above-fold image (don't lazy load these)
    const isHero = allAttrs.includes('hero') || 
                   src.includes('logo') || 
                   src.includes('hero') ||
                   className.includes('hero');
    
    const loading = isHero ? '' : ' loading="lazy"';
    
    // Check if WebP version exists
    const webpPath = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    
    // Build picture element
    return `<picture>
      <source srcset="${webpPath}" type="image/webp">
      <source srcset="${src}" type="image/${ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : 'png'}">
      <img src="${src}" alt="${alt}"${className}${width}${height}${loading}>
    </picture>`;
  });
}

// Function to add lazy loading to existing img tags
function addLazyLoading(html) {
  const imgPattern = /<img\s+([^>]*?)>/gi;
  
  return html.replace(imgPattern, (match, attrs) => {
    // Skip if already has loading attribute
    if (attrs.includes('loading=')) {
      return match;
    }
    
    // Skip hero/logo images
    if (attrs.includes('hero') || attrs.includes('logo')) {
      return match;
    }
    
    // Add lazy loading
    return `<img ${attrs} loading="lazy">`;
  });
}

// Process HTML files
function processHtmlFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let html = fs.readFileSync(filePath, 'utf8');
  const originalLength = html.length;
  
  // Update image tags to picture elements with WebP
  html = updateImageTag(html);
  
  // Add lazy loading to any remaining img tags
  html = addLazyLoading(html);
  
  if (html.length !== originalLength) {
    fs.writeFileSync(filePath, html);
    console.log(`  ✓ Updated`);
  } else {
    console.log(`  - No changes needed`);
  }
}

// Find and process all HTML files
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
      findHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      processHtmlFile(filePath);
    }
  });
}

// Main execution
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  console.log('Updating HTML files with WebP support and lazy loading...\n');
  findHtmlFiles(srcDir);
} else {
  console.error('src directory not found!');
  process.exit(1);
}

console.log('\n✅ HTML update complete!');