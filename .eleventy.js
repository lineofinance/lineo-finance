const sass = require("sass");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

module.exports = function(eleventyConfig) {
  // Function to generate WebP versions of PNG/JPG images
  function generateWebPImages() {
    console.log("🖼️  Generating WebP images...");
    
    try {
      // Check if cwebp is available
      execSync('which cwebp', { stdio: 'ignore' });
    } catch (error) {
      console.warn("⚠️  Warning: cwebp not found. WebP generation skipped. Install webp with: brew install webp");
      return;
    }
    
    const srcAssetDir = './src/assets/images';
    const distAssetDir = './dist/assets/images';
    
    if (!fs.existsSync(srcAssetDir)) {
      console.log("📁 Source assets directory not found, skipping WebP generation");
      return;
    }
    
    // Ensure dist assets directory exists
    if (!fs.existsSync(distAssetDir)) {
      fs.mkdirSync(distAssetDir, { recursive: true });
    }
    
    // Find all PNG and JPG files recursively in source
    const findImages = (dir) => {
      let images = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          images = images.concat(findImages(fullPath));
        } else if (/\.(png|jpg|jpeg)$/i.test(item.name)) {
          images.push(fullPath);
        }
      }
      return images;
    };
    
    const imageFiles = findImages(srcAssetDir);
    let generatedCount = 0;
    
    for (const imagePath of imageFiles) {
      // Generate WebP path in dist directory, maintaining folder structure
      const relativePath = path.relative(srcAssetDir, imagePath);
      const distWebpPath = path.join(distAssetDir, relativePath).replace(/\.(png|jpg|jpeg)$/i, '.webp');
      
      // Ensure the directory exists in dist
      const distWebpDir = path.dirname(distWebpPath);
      if (!fs.existsSync(distWebpDir)) {
        fs.mkdirSync(distWebpDir, { recursive: true });
      }
      
      // Only generate if WebP doesn't exist or PNG/JPG is newer
      let shouldGenerate = !fs.existsSync(distWebpPath);
      if (!shouldGenerate) {
        const imageStats = fs.statSync(imagePath);
        const webpStats = fs.statSync(distWebpPath);
        shouldGenerate = imageStats.mtime > webpStats.mtime;
      }
      
      if (shouldGenerate) {
        try {
          execSync(`cwebp -q 85 "${imagePath}" -o "${distWebpPath}"`, { stdio: 'pipe' });
          generatedCount++;
          console.log(`✅ Generated: ${path.relative('./dist', distWebpPath)}`);
        } catch (error) {
          console.error(`❌ Failed to generate WebP for ${imagePath}:`, error.message);
        }
      }
    }
    
    if (generatedCount > 0) {
      console.log(`🎉 Generated ${generatedCount} WebP images`);
    } else {
      console.log("✅ All WebP images are up to date");
    }
  }
  
  // Generate WebP images during build
  eleventyConfig.on('beforeBuild', generateWebPImages);
  
  // Transform to replace PNG/JPG references with WebP in HTML output
  eleventyConfig.addTransform("webpTransform", function(content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      // Replace image sources with WebP versions using picture elements for better browser support
      // Only transform img tags that are NOT already inside picture elements
      return content.replace(
        /<img([^>]*)\ssrc="([^"]*\.(png|jpg|jpeg))"([^>]*)>/gi,
        (match, beforeSrc, imgSrc, extension, afterSrc, offset, string) => {
          // Check if this img tag is already inside a picture element
          const beforeImg = string.substring(0, offset);
          const openPictureMatch = beforeImg.lastIndexOf('<picture');
          const closePictureMatch = beforeImg.lastIndexOf('</picture>');
          
          // If there's an open picture tag after the last closed picture tag, skip transformation
          if (openPictureMatch > closePictureMatch) {
            return match; // Return unchanged
          }
          
          const webpSrc = imgSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
          
          // Extract alt attribute for accessibility
          const altMatch = match.match(/alt="([^"]*)"/i);
          const altText = altMatch ? altMatch[1] : '';
          
          // Extract other attributes (class, width, height, etc.)
          const attributes = (beforeSrc + afterSrc).trim();
          
          return `<picture>
      <source srcset="${webpSrc}" type="image/webp">
      <source srcset="${imgSrc}" type="image/${extension.toLowerCase() === 'jpg' ? 'jpeg' : extension.toLowerCase()}">
      <img src="${imgSrc}"${attributes ? ' ' + attributes : ''}${altText && !attributes.includes('alt=') ? ' alt="' + altText + '"' : ''}>
    </picture>`;
        }
      );
    }
    return content;
  });

  // Compile SCSS to CSS
  eleventyConfig.addTemplateFormats("scss");
  
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    
    compile: async function(inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      
      // Skip files starting with underscore (partials)
      if(parsed.name.startsWith("_")) {
        return;
      }
      
      return async () => {
        let result = sass.compileString(inputContent, {
          loadPaths: [parsed.dir || ".", "src/scss"],
          sourceMap: false, // Set to true for development if needed
          style: "compressed" // Minified for production
        });
        
        return result.css;
      };
    }
  });
  
  // Copy static assets directly to output
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.png");
  eleventyConfig.addPassthroughCopy("src/css/fonts.css"); // Keep fonts.css as is for now
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");
  eleventyConfig.addPassthroughCopy("src/_redirects"); // Netlify-style redirects
  
  // Watch SCSS and JS for changes (triggers rebuild)
  eleventyConfig.addWatchTarget("src/scss/");
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");
  
  // Add a filter to mark the current page as active in navigation
  eleventyConfig.addFilter("isActive", function(url, page) {
    return page.url === url ? "active" : "";
  });
  
  // Add filter to truncate text
  eleventyConfig.addFilter("truncate", function(str, length = 50) {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.substring(0, length) + "...";
  });
  
  // Add collection for knowledge base
  eleventyConfig.addCollection("knowledgeBase", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/knowledge-base/**/*.md")
      .sort((a, b) => {
        // Sort by date (newest first) or featured status
        if (a.data.featured && !b.data.featured) return -1;
        if (!a.data.featured && b.data.featured) return 1;
        return (b.date || b.data.date) - (a.date || a.data.date);
      });
  });
  
  // Add collection for featured knowledge base articles
  eleventyConfig.addCollection("featuredKnowledgeBase", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/knowledge-base/**/*.md")
      .filter(item => item.data.featured)
      .sort((a, b) => (b.date || b.data.date) - (a.date || a.data.date));
  });
  
  // Add collection for footer knowledge base articles
  eleventyConfig.addCollection("footerKnowledgeBase", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/knowledge-base/**/*.md")
      .filter(item => item.data.showInFooter !== false) // Default to true if not specified
      .sort((a, b) => {
        // Sort by footer priority, then featured status, then date
        if (a.data.footerPriority && b.data.footerPriority) {
          return a.data.footerPriority - b.data.footerPriority;
        }
        if (a.data.footerPriority && !b.data.footerPriority) return -1;
        if (!a.data.footerPriority && b.data.footerPriority) return 1;
        if (a.data.featured && !b.data.featured) return -1;
        if (!a.data.featured && b.data.featured) return 1;
        return (b.date || b.data.date) - (a.date || a.data.date);
      });
  });
  
  // Add collection for FAQs
  eleventyConfig.addCollection("faqs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/faqs/**/*.md");
  });
  
  // Ignore FAQ markdown files from generating standalone pages
  // They're meant to be included as partials, not standalone pages
  eleventyConfig.ignores.add("src/content/faqs/*.md");
  eleventyConfig.ignores.add("src/content/faqs/**/*.md");
  
  // Configure markdown library (for future knowledge base)
  let markdownIt = require("markdown-it");
  let markdownLib = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });
  
  // Override link renderer to open external links in new tabs and add icon
  const defaultRender = markdownLib.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  const defaultLinkClose = markdownLib.renderer.rules.link_close || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  // Track whether current link is external
  let isCurrentLinkExternal = false;
  
  markdownLib.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // Get the href attribute
    const hrefIndex = tokens[idx].attrIndex('href');
    let href = '';
    if (hrefIndex >= 0) {
      href = tokens[idx].attrs[hrefIndex][1];
    }
    
    // Check if it's an internal knowledge base link or anchor link
    const isInternalKBLink = href.startsWith('/content/knowledge-base/') || href.startsWith('../');
    const isAnchorLink = href.startsWith('#');
    const isInternalLink = href.startsWith('/') && !href.startsWith('//'); // Local links that aren't protocol-relative
    
    // Track if this link is external for the close renderer
    isCurrentLinkExternal = !isInternalKBLink && !isAnchorLink && !isInternalLink;
    
    // Only add target="_blank" to external links
    if (isCurrentLinkExternal) {
      // Add target="_blank" and rel="noopener noreferrer" to external links
      const aIndex = tokens[idx].attrIndex('target');
      if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']);
      } else {
        tokens[idx].attrs[aIndex][1] = '_blank';
      }
      
      const relIndex = tokens[idx].attrIndex('rel');
      if (relIndex < 0) {
        tokens[idx].attrPush(['rel', 'noopener noreferrer']);
      } else {
        tokens[idx].attrs[relIndex][1] = 'noopener noreferrer';
      }
    }
    
    return defaultRender(tokens, idx, options, env, self);
  };
  
  // Add external link icon before closing the link (inside the link)
  markdownLib.renderer.rules.link_close = function (tokens, idx, options, env, self) {
    if (isCurrentLinkExternal) {
      // Add an SVG icon for external links inside the link
      // Using a simple box with arrow icon
      const svgIcon = `<svg class="external-link-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; margin-left: 4px; vertical-align: baseline;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
      return svgIcon + defaultLinkClose(tokens, idx, options, env, self);
    }
    return defaultLinkClose(tokens, idx, options, env, self);
  };
  
  eleventyConfig.setLibrary("md", markdownLib);
  
  // Set up browser sync for better live reload experience
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = `
          <!DOCTYPE html>
          <html lang="de">
          <head>
            <meta charset="UTF-8">
            <title>404 - Seite nicht gefunden</title>
            <style>
              body { font-family: system-ui; text-align: center; padding: 50px; }
              h1 { color: #FFD700; }
            </style>
          </head>
          <body>
            <h1>404</h1>
            <p>Seite nicht gefunden</p>
            <a href="/">Zurück zur Startseite</a>
          </body>
          </html>
        `;
        
        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      }
    },
    ui: false,
    ghostMode: false
  });
  
  return {
    // Use Nunjucks for templating
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    
    // Directory structure
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };
};