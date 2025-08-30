# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lineo Finance is a modern static site generator implementation of a financial services website, migrated from WordPress to use 11ty (Eleventy) with SCSS preprocessing. The site targets German-speaking financial services clients (tax consultants, companies, family offices) for automated securities accounting solutions.

## Commands

### Development Server
```bash
# Start 11ty development server with live reload
npm run serve

# Build for production
npm run build

# Clean dist folder
npm run clean
```

### Testing & Validation
```bash
# Run development server and test responsive breakpoints
npm run serve
# Test at: 576px, 768px, 1024px, 1200px

# Build and validate output
npm run build && ls -la dist/
```

## Code Architecture

### Technology Stack
- **11ty (Eleventy)**: Static site generator with Nunjucks templating
- **SCSS**: Modular stylesheets compiled to CSS
- **Vanilla JavaScript**: No framework dependencies
- **Barlow Font**: Self-hosted font files

### Directory Structure
```
src/
├── _includes/          # Reusable templates
│   ├── base.njk       # Main layout template
│   ├── header.html    # Navigation header
│   ├── footer.html    # Site footer
│   └── sections/      # Page section components
├── _data/             # Global data files
├── pages/             # Site pages
│   └── jobs/          # Job listing pages
├── scss/              # SCSS source files
│   ├── main.scss      # Main entry point
│   ├── abstracts/     # Variables, mixins
│   ├── base/          # Reset, typography, layout
│   ├── components/    # Reusable components
│   ├── pages/         # Page-specific styles
│   └── utilities/     # Utility classes
├── js/                # JavaScript files (copied as-is)
├── assets/            # Images, icons, fonts
└── index.html         # Homepage
```

### Build Process
1. **11ty Processing**: Compiles Nunjucks templates to HTML
2. **SCSS Compilation**: Processes SCSS files to compressed CSS
3. **Asset Copying**: Transfers JS, images, fonts to dist/
4. **Output**: Complete static site in `dist/` directory

### Key Architectural Patterns

#### Template Inheritance
All pages extend `base.njk` template with frontmatter:
```yaml
---
layout: base.njk
title: Page Title
description: Meta description
---
```

#### SCSS Organization
- **Variables**: Define all design tokens in `_variables.scss`
- **Mixins**: Reusable patterns in `_mixins.scss`
- **Components**: One file per component in `components/`
- **BEM-like naming**: `.component`, `.component__element`, `.component--modifier`

#### Responsive Design
Mobile-first approach with breakpoints:
```scss
// Small devices (phones)
@media (min-width: 576px) { }
// Medium devices (tablets)
@media (min-width: 768px) { }
// Large devices (desktops)
@media (min-width: 1024px) { }
// Extra large devices
@media (min-width: 1200px) { }
```

#### JavaScript Module Pattern
Each feature initialized on DOMContentLoaded:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initFormValidation();
});
```

### Development Guidelines

#### Adding New Pages
1. Create `.html` file in `src/pages/` with frontmatter
2. Add page-specific SCSS in `src/scss/pages/`
3. Update navigation in `header.html`
4. Test responsive design

#### Modifying Styles
1. Global variables: Edit `src/scss/base/_variables.scss`
2. Component styles: Edit relevant file in `src/scss/components/`
3. Run `npm run serve` to see changes with hot reload

#### SCSS Compilation Notes
- Partials (files starting with `_`) are not compiled directly
- Main entry point is `src/scss/main.scss`
- Output is compressed CSS in production build
- Source maps disabled for production

### Important Context

#### Business Domain
- **Language**: German (primary)
- **Industry**: Financial services, automated securities accounting
- **Compliance**: GDPR-compliant, German legal requirements (Impressum)

#### Design System
- **Primary Color**: `#FFD700` (gold/yellow)
- **Font Stack**: Barlow (Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700)
- **Spacing System**: 8px base unit
- **Container**: Max-width 1200px with responsive padding

#### 11ty Configuration
- **Template Engine**: Nunjucks for HTML files
- **Markdown Support**: Configured for future knowledge base
- **Collections**: Knowledge base collection ready for content
- **BrowserSync**: Custom 404 page, no ghost mode

#### Performance Considerations
- SCSS compiled to compressed CSS
- Images served from `assets/` directory
- Lazy loading implemented in JavaScript
- No external dependencies in production