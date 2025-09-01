const sass = require("sass");
const path = require("path");

module.exports = function(eleventyConfig) {
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
          style: "expanded" // Use "compressed" for production
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
  
  // Configure markdown library (for future knowledge base)
  let markdownIt = require("markdown-it");
  let markdownLib = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });
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