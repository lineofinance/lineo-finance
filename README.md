# Lineo Finance Website

A modern, static recreation of the lineo.finance website, built with vanilla HTML, CSS, and JavaScript.

## 🚀 Quick Start

### View the website locally:
```bash
# Navigate to the project directory
cd lineo-finance

# Start a simple HTTP server (Python 3)
python3 -m http.server 8080

# Or using Node.js
npx serve .
```

Then open your browser and visit: http://localhost:8080

## 📁 Project Structure

```
lineo-finance/
├── index.html              # Homepage
├── pages/                  # All other pages
│   ├── leistungen.html    # Services page
│   ├── team-partner.html  # Team & Partners
│   ├── karriere.html      # Careers
│   ├── kontakt.html       # Contact
│   ├── impressum.html     # Legal notice
│   ├── datenschutz.html   # Privacy policy
│   └── jobs/              # Job listings
├── css/                    # Stylesheets
│   ├── main.css           # Base styles
│   ├── components/        # Component styles
│   │   ├── header.css
│   │   ├── footer.css
│   │   ├── cards.css
│   │   └── forms.css
│   └── pages/             # Page-specific styles
│       ├── home.css
│       ├── services.css
│       └── careers.css
├── js/                     # JavaScript
│   └── main.js            # Core functionality
├── assets/                 # Images and icons
│   ├── images/            # Photos and logos
│   └── icons/             # SVG icons
└── favicon.png            # Site favicon
```

## ✅ Features Implemented

### Phase 1: Foundation ✅
- [x] Project structure with organized directories
- [x] HTML templates for all pages
- [x] Base CSS with variables and typography
- [x] Core JavaScript functionality

### Phase 2: Components ✅
- [x] Responsive header with mobile menu
- [x] Multi-column footer
- [x] Card components with hover effects
- [x] Form styling with validation
- [x] Responsive grid system

### Phase 3: Pages ✅
- [x] Homepage with hero, features, process, FAQ sections
- [x] Services page with benefits and automation process
- [x] Team & Partner page with partner network
- [x] Careers page with job listings and culture
- [x] Contact page with form and contact info
- [x] Legal pages (Impressum, Datenschutz)

## 🎨 Design Features

- **Modern Design**: Clean, professional layout with yellow (#FFD700) accent color
- **Fully Responsive**: Mobile-first approach with breakpoints
- **Smooth Animations**: Hover effects, transitions, and scroll animations
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Performance**: Lazy loading, optimized CSS, vanilla JavaScript (no dependencies)

## 🔧 Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript**: No framework dependencies
- **Original Assets**: Logo and images from WordPress site

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🚀 Deployment

The site is static and can be deployed to any web server or static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Traditional web hosting

Simply upload all files and folders to your hosting service.

## 📝 Next Steps

To further enhance the website:

1. **Performance Optimization**
   - Optimize images (WebP format)
   - Minify CSS and JavaScript
   - Implement service worker for offline capability

2. **Content Management**
   - Add more broker logos
   - Update team information
   - Add more job listings

3. **Features**
   - Newsletter signup functionality
   - Contact form backend integration
   - Analytics integration
   - Cookie consent banner

4. **SEO**
   - Add XML sitemap
   - Implement structured data
   - Meta tags optimization

## 📄 License

© 2024 lineo finance GmbH. All rights reserved.