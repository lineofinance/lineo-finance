#!/usr/bin/env node

/**
 * Pre-Launch Validation Script for Lineo Finance
 * Comprehensive checks for production readiness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

class PreLaunchChecker {
  constructor() {
    this.results = {
      passed: [],
      warnings: [],
      errors: []
    };
    this.distPath = path.join(__dirname, 'dist');
  }

  log(type, message) {
    const typeColors = {
      error: colors.red,
      warning: colors.yellow,
      success: colors.green,
      info: colors.blue
    };
    console.log(`${typeColors[type] || ''}${type.toUpperCase()}: ${message}${colors.reset}`);
    
    if (type === 'error') this.results.errors.push(message);
    if (type === 'warning') this.results.warnings.push(message);
    if (type === 'success') this.results.passed.push(message);
  }

  // Check 1: Build Success
  checkBuildSuccess() {
    console.log('\n📦 Checking Build...');
    if (!fs.existsSync(this.distPath)) {
      this.log('error', 'Build directory does not exist. Run npm run build first.');
      return false;
    }
    
    const requiredFiles = [
      'index.html',
      'scss/main.css',
      'js/main.js',
      'js/forms.js',
      'js/swiper-init.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.distPath, file);
      if (!fs.existsSync(filePath)) {
        this.log('error', `Missing required file: ${file}`);
      } else {
        this.log('success', `Found: ${file}`);
      }
    }
    return true;
  }

  // Check 2: HTML Validation
  checkHTMLStructure() {
    console.log('\n🏗️ Checking HTML Structure...');
    const htmlFiles = this.getAllFiles(this.distPath, '.html');
    
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(this.distPath, file);
      
      // Check for essential meta tags
      if (!content.includes('<meta charset=')) {
        this.log('error', `Missing charset meta tag in ${relativePath}`);
      }
      if (!content.includes('<meta name="viewport"')) {
        this.log('error', `Missing viewport meta tag in ${relativePath}`);
      }
      if (!content.includes('<title>')) {
        this.log('error', `Missing title tag in ${relativePath}`);
      }
      if (!content.includes('<meta name="description"')) {
        this.log('warning', `Missing description meta tag in ${relativePath}`);
      }
      
      // Check for lang attribute
      if (!content.includes('lang="de"') && !content.includes('lang="en"')) {
        this.log('warning', `Missing lang attribute in ${relativePath}`);
      }
      
      // Check for favicon
      if (relativePath === 'index.html' && !content.includes('favicon')) {
        this.log('warning', 'Missing favicon reference in index.html');
      }
    });
    
    this.log('success', `Checked ${htmlFiles.length} HTML files`);
  }

  // Check 3: CSS File Size and Optimization
  checkCSSOptimization() {
    console.log('\n🎨 Checking CSS Optimization...');
    const cssPath = path.join(this.distPath, 'scss', 'main.css');
    
    if (fs.existsSync(cssPath)) {
      const stats = fs.statSync(cssPath);
      const sizeInKB = stats.size / 1024;
      
      if (sizeInKB > 100) {
        this.log('warning', `CSS file size is ${sizeInKB.toFixed(2)}KB (consider optimization if >100KB)`);
      } else {
        this.log('success', `CSS file size: ${sizeInKB.toFixed(2)}KB (optimized)`);
      }
      
      const content = fs.readFileSync(cssPath, 'utf-8');
      
      // Check if minified
      const isMinified = !content.includes('\n  ') && content.length > 1000;
      if (!isMinified) {
        this.log('warning', 'CSS does not appear to be minified');
      } else {
        this.log('success', 'CSS is minified');
      }
      
      // Check for source maps in production
      if (content.includes('sourceMappingURL')) {
        this.log('warning', 'CSS contains source map reference (should be removed for production)');
      }
    }
  }

  // Check 4: JavaScript Validation
  checkJavaScript() {
    console.log('\n📜 Checking JavaScript...');
    const jsFiles = this.getAllFiles(path.join(this.distPath, 'js'), '.js');
    
    jsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const fileName = path.basename(file);
      
      // Check for console.log statements
      if (content.includes('console.log')) {
        this.log('warning', `Found console.log in ${fileName} (remove for production)`);
      }
      
      // Check for debugger statements
      if (content.includes('debugger')) {
        this.log('error', `Found debugger statement in ${fileName}`);
      }
      
      // Check file size
      const stats = fs.statSync(file);
      const sizeInKB = stats.size / 1024;
      if (sizeInKB > 50) {
        this.log('warning', `${fileName} is ${sizeInKB.toFixed(2)}KB (consider splitting if >50KB)`);
      } else {
        this.log('success', `${fileName}: ${sizeInKB.toFixed(2)}KB`);
      }
    });
  }

  // Check 5: Images Optimization
  checkImages() {
    console.log('\n🖼️ Checking Images...');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const imagePath = path.join(this.distPath, 'assets', 'images');
    
    if (!fs.existsSync(imagePath)) {
      this.log('warning', 'No images directory found');
      return;
    }
    
    const images = this.getAllFiles(imagePath, imageExtensions);
    let totalSize = 0;
    let largeImages = [];
    
    images.forEach(file => {
      const stats = fs.statSync(file);
      const sizeInKB = stats.size / 1024;
      totalSize += sizeInKB;
      
      if (sizeInKB > 200) {
        largeImages.push({
          name: path.basename(file),
          size: sizeInKB
        });
      }
    });
    
    this.log('info', `Total images: ${images.length}`);
    this.log('info', `Total size: ${(totalSize / 1024).toFixed(2)}MB`);
    
    if (largeImages.length > 0) {
      largeImages.forEach(img => {
        this.log('warning', `Large image: ${img.name} (${img.size.toFixed(2)}KB) - consider optimization`);
      });
    } else {
      this.log('success', 'All images are reasonably sized (<200KB each)');
    }
  }

  // Check 6: Accessibility Basics
  checkAccessibility() {
    console.log('\n♿ Checking Accessibility...');
    const htmlFiles = this.getAllFiles(this.distPath, '.html');
    
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(this.distPath, file);
      
      // Check for alt tags on images
      const imgMatches = content.match(/<img[^>]*>/g) || [];
      const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt='));
      if (imgsWithoutAlt.length > 0) {
        this.log('error', `${relativePath}: ${imgsWithoutAlt.length} image(s) missing alt text`);
      }
      
      // Check for form labels
      const inputMatches = content.match(/<input[^>]*>/g) || [];
      const inputsNeedingLabels = inputMatches.filter(input => 
        !input.includes('type="hidden"') && 
        !input.includes('type="submit"') &&
        !input.includes('type="button"')
      );
      
      const labelCount = (content.match(/<label/g) || []).length;
      if (inputsNeedingLabels.length > labelCount) {
        this.log('warning', `${relativePath}: Some form inputs may be missing labels`);
      }
      
      // Check for ARIA landmarks
      if (relativePath === 'index.html') {
        if (!content.includes('role="main"') && !content.includes('<main')) {
          this.log('warning', 'Missing main landmark in index.html');
        }
        if (!content.includes('role="navigation"') && !content.includes('<nav')) {
          this.log('warning', 'Missing navigation landmark in index.html');
        }
      }
    });
    
    this.log('success', 'Basic accessibility checks completed');
  }

  // Check 7: SEO Basics
  checkSEO() {
    console.log('\n🔍 Checking SEO...');
    const indexPath = path.join(this.distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8');
      
      // Check Open Graph tags
      if (!content.includes('property="og:title"')) {
        this.log('warning', 'Missing Open Graph title tag');
      }
      if (!content.includes('property="og:description"')) {
        this.log('warning', 'Missing Open Graph description tag');
      }
      if (!content.includes('property="og:image"')) {
        this.log('warning', 'Missing Open Graph image tag');
      }
      
      // Check structured data
      if (!content.includes('application/ld+json')) {
        this.log('warning', 'Missing structured data (JSON-LD)');
      }
      
      // Check canonical URL
      if (!content.includes('rel="canonical"')) {
        this.log('warning', 'Missing canonical URL');
      }
      
      // Check robots.txt existence
      if (!fs.existsSync(path.join(this.distPath, 'robots.txt'))) {
        this.log('warning', 'Missing robots.txt file');
      }
      
      // Check sitemap
      if (!fs.existsSync(path.join(this.distPath, 'sitemap.xml'))) {
        this.log('warning', 'Missing sitemap.xml file');
      }
    }
    
    this.log('success', 'SEO checks completed');
  }

  // Check 8: Legal Compliance (German requirements)
  checkLegalCompliance() {
    console.log('\n⚖️ Checking Legal Compliance...');
    
    const requiredPages = [
      { path: 'pages/impressum/index.html', name: 'Impressum' },
      { path: 'pages/datenschutz/index.html', name: 'Datenschutz' },
      { path: 'pages/barrierefreiheitserklaerung/index.html', name: 'Barrierefreiheitserklärung' }
    ];
    
    requiredPages.forEach(page => {
      const fullPath = path.join(this.distPath, page.path);
      if (!fs.existsSync(fullPath)) {
        this.log('error', `Missing required legal page: ${page.name}`);
      } else {
        this.log('success', `Found legal page: ${page.name}`);
      }
    });
    
    // Check if legal pages are linked in footer
    const indexPath = path.join(this.distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8');
      
      if (!content.includes('impressum')) {
        this.log('error', 'Impressum not linked in homepage');
      }
      if (!content.includes('datenschutz')) {
        this.log('error', 'Datenschutz not linked in homepage');
      }
    }
  }

  // Check 9: Performance Metrics
  checkPerformanceMetrics() {
    console.log('\n⚡ Checking Performance Metrics...');
    
    // Calculate total page weight
    const htmlFiles = this.getAllFiles(this.distPath, '.html');
    const indexFile = htmlFiles.find(f => f.endsWith('index.html'));
    
    if (indexFile) {
      const stats = fs.statSync(indexFile);
      const htmlSize = stats.size / 1024;
      
      const cssSize = this.getFileSize(path.join(this.distPath, 'scss', 'main.css'));
      const jsSize = this.getTotalDirectorySize(path.join(this.distPath, 'js'));
      
      const totalSize = htmlSize + cssSize + jsSize;
      
      this.log('info', `HTML size: ${htmlSize.toFixed(2)}KB`);
      this.log('info', `CSS size: ${cssSize.toFixed(2)}KB`);
      this.log('info', `JS size: ${jsSize.toFixed(2)}KB`);
      this.log('info', `Total initial load: ${totalSize.toFixed(2)}KB`);
      
      if (totalSize > 500) {
        this.log('warning', `Total page weight exceeds 500KB (${totalSize.toFixed(2)}KB)`);
      } else {
        this.log('success', 'Page weight is optimized (<500KB)');
      }
    }
  }

  // Helper methods
  getAllFiles(dirPath, extensions) {
    if (!fs.existsSync(dirPath)) return [];
    
    const files = [];
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, extensions));
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath).toLowerCase();
        if (typeof extensions === 'string') {
          if (ext === extensions) files.push(fullPath);
        } else if (Array.isArray(extensions)) {
          if (extensions.includes(ext)) files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  getFileSize(filePath) {
    if (!fs.existsSync(filePath)) return 0;
    return fs.statSync(filePath).size / 1024;
  }

  getTotalDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile()) {
        totalSize += stat.size / 1024;
      }
    }
    
    return totalSize;
  }

  // Generate report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRE-LAUNCH VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n${colors.green}✅ Passed: ${this.results.passed.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠️ Warnings: ${this.results.warnings.length}${colors.reset}`);
    console.log(`${colors.red}❌ Errors: ${this.results.errors.length}${colors.reset}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ CRITICAL ISSUES (Must Fix):');
      this.results.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS (Should Review):');
      this.results.warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.results.errors.length === 0) {
      console.log(`${colors.green}✨ Site is ready for launch!${colors.reset}`);
      console.log('\nNext steps:');
      console.log('1. Run lighthouse audit: npx lighthouse https://your-domain.com');
      console.log('2. Test with real users');
      console.log('3. Set up monitoring (e.g., Google Analytics)');
      console.log('4. Configure CDN and caching headers');
      console.log('5. Set up error tracking (e.g., Sentry)');
    } else {
      console.log(`${colors.red}❌ Please fix critical issues before launching.${colors.reset}`);
    }
    
    // Save report to file
    const reportPath = path.join(__dirname, 'pre-launch-report.txt');
    const reportContent = this.generateTextReport();
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }

  generateTextReport() {
    let report = 'LINEO FINANCE - PRE-LAUNCH VALIDATION REPORT\n';
    report += '=' .repeat(60) + '\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += 'SUMMARY\n';
    report += '-'.repeat(30) + '\n';
    report += `Passed: ${this.results.passed.length}\n`;
    report += `Warnings: ${this.results.warnings.length}\n`;
    report += `Errors: ${this.results.errors.length}\n\n`;
    
    if (this.results.errors.length > 0) {
      report += 'CRITICAL ISSUES\n';
      report += '-'.repeat(30) + '\n';
      this.results.errors.forEach((err, i) => {
        report += `${i + 1}. ${err}\n`;
      });
      report += '\n';
    }
    
    if (this.results.warnings.length > 0) {
      report += 'WARNINGS\n';
      report += '-'.repeat(30) + '\n';
      this.results.warnings.forEach((warn, i) => {
        report += `${i + 1}. ${warn}\n`;
      });
      report += '\n';
    }
    
    if (this.results.passed.length > 0) {
      report += 'PASSED CHECKS\n';
      report += '-'.repeat(30) + '\n';
      this.results.passed.forEach((pass, i) => {
        report += `${i + 1}. ${pass}\n`;
      });
    }
    
    return report;
  }

  // Main execution
  async run() {
    console.log('🚀 Starting Lineo Finance Pre-Launch Validation...\n');
    
    this.checkBuildSuccess();
    this.checkHTMLStructure();
    this.checkCSSOptimization();
    this.checkJavaScript();
    this.checkImages();
    this.checkAccessibility();
    this.checkSEO();
    this.checkLegalCompliance();
    this.checkPerformanceMetrics();
    
    this.generateReport();
  }
}

// Execute the checker
const checker = new PreLaunchChecker();
checker.run().catch(console.error);