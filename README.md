# Lineo Finance Website

Eine moderne, statische Website für lineo.finance, entwickelt mit 11ty (Eleventy) und SCSS.

## 🚀 Schnellstart

### Entwicklungsserver starten:
```bash
# Ins Projektverzeichnis wechseln
cd lineo-finance

# Entwicklungsserver mit Live-Reload starten
npm run serve

# Für Produktion bauen
npm run build

# Build-Ordner bereinigen
npm run clean
```

Die Website ist dann erreichbar unter: http://localhost:8080

## 📁 Projektstruktur

```
src/
├── _includes/          # Wiederverwendbare Templates
│   ├── base.njk       # Haupt-Layout-Template
│   ├── header.html    # Navigation Header
│   ├── footer.html    # Website Footer
│   └── sections/      # Seiten-Komponenten
├── _data/             # Globale Datendateien
├── pages/             # Website-Seiten
│   └── jobs/          # Stellenausschreibungen
├── scss/              # SCSS Quelldateien
│   ├── main.scss      # Haupteinstiegspunkt
│   ├── abstracts/     # Variablen, Mixins
│   ├── base/          # Reset, Typografie, Layout
│   ├── components/    # Wiederverwendbare Komponenten
│   ├── pages/         # Seitenspezifische Styles
│   └── utilities/     # Utility-Klassen
├── js/                # JavaScript-Dateien
├── assets/            # Bilder, Icons, Schriften
└── index.html         # Startseite
```

## ✅ Implementierte Funktionen

### Phase 1: Grundgerüst ✅
- [x] 11ty Static Site Generator Setup
- [x] SCSS-Preprocessing mit Kompression
- [x] Nunjucks-Templating-System
- [x] Modulare Komponentenstruktur

### Phase 2: Komponenten ✅
- [x] Responsiver Header mit Mobile-Menü
- [x] Mehrspalten-Footer
- [x] Karten-Komponenten mit Hover-Effekten
- [x] Formular-Styling mit Validierung
- [x] Responsives Grid-System

### Phase 3: Seiten ✅
- [x] Startseite mit Hero, Features, Prozess, FAQ-Bereichen
- [x] Leistungen-Seite mit Vorteilen und Automatisierungsprozess
- [x] Team & Partner-Seite mit Partnernetzwerk
- [x] Karriere-Seite mit Stellenausschreibungen und Kultur
- [x] Kontakt-Seite mit Formular und Kontaktinformationen
- [x] Rechtliche Seiten (Impressum, Datenschutz)

## 🎨 Design-Features

- **Modernes Design**: Sauberes, professionelles Layout mit gelber (#FFD700) Akzentfarbe
- **Vollständig Responsiv**: Mobile-First-Ansatz mit Breakpoints
- **Sanfte Animationen**: Hover-Effekte, Übergänge und Scroll-Animationen
- **Barrierefreiheit**: Semantisches HTML, ARIA-Labels, Tastaturnavigation
- **Performance**: Lazy Loading, optimiertes CSS, Vanilla JavaScript (keine Abhängigkeiten)

## 🔧 Verwendete Technologien

- **11ty (Eleventy)**: Static Site Generator mit Nunjucks-Templating
- **SCSS**: Modulare Stylesheets kompiliert zu CSS
- **Vanilla JavaScript**: Keine Framework-Abhängigkeiten
- **Barlow Schriftart**: Selbst gehostete Schriftdateien

## 📱 Browser-Unterstützung

- Chrome (neueste Version)
- Firefox (neueste Version)
- Safari (neueste Version)
- Edge (neueste Version)
- Mobile Browser

## 🚀 Deployment

Die Website kann auf jeden Webserver oder statischen Hosting-Service deployed werden:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Traditionelles Webhosting

Einfach den Inhalt des `dist/` Ordners nach dem Build hochladen.

## 📚 Wissensdatenbank erstellen

### Anleitung zum Erstellen von Knowledge Base Artikeln

Die Wissensdatenbank nutzt Markdown-Dateien im `src/knowledge-base/` Verzeichnis. Jeder Artikel wird automatisch in die Knowledge Base Collection aufgenommen und auf der Website dargestellt.

#### Artikelstruktur

Erstellen Sie eine neue Markdown-Datei in `src/knowledge-base/`:

```markdown
---
title: "Titel des Artikels"
description: "Kurze Beschreibung für SEO und Übersichten"
category: "Kategorie"
tags: ["Tag1", "Tag2", "Tag3"]
date: 2024-01-15
author: "Autor Name"
featured: false
---

## Einleitung

Ihr Artikelinhalt beginnt hier...

### Unterüberschrift

Weitere Inhalte...
```

#### Frontmatter-Felder

- **title** (erforderlich): Der Titel des Artikels
- **description** (erforderlich): Meta-Beschreibung für SEO
- **category** (erforderlich): Hauptkategorie (z.B. "Grundlagen", "Anleitungen", "FAQ")
- **tags** (optional): Array von Schlagwörtern für bessere Auffindbarkeit
- **date** (erforderlich): Veröffentlichungsdatum im Format YYYY-MM-DD
- **author** (optional): Name des Autors
- **featured** (optional): true/false - Hervorgehobene Artikel erscheinen oben

#### Kategorien

Standardkategorien für die Wissensdatenbank:
- **Grundlagen**: Einführende Artikel über Wertpapierverbuchung
- **Anleitungen**: Schritt-für-Schritt-Tutorials
- **FAQ**: Häufig gestellte Fragen
- **Integration**: Technische Integrationsanleitungen
- **Compliance**: Rechtliche und regulatorische Themen

#### Markdown-Funktionen

Unterstützte Markdown-Elemente:
- Überschriften (##, ###, ####)
- Listen (geordnet und ungeordnet)
- Links und Bilder
- Code-Blöcke mit Syntax-Highlighting
- Tabellen
- Blockzitate
- Fettdruck und Kursivschrift

#### Bilder einbinden

Bilder für Knowledge Base Artikel in `src/assets/images/knowledge-base/` ablegen:

```markdown
![Alt-Text](/assets/images/knowledge-base/bild-name.jpg)
```

#### Build-Prozess

Nach dem Hinzufügen neuer Artikel:
1. `npm run build` ausführen
2. Artikel erscheinen automatisch in der Knowledge Base Übersicht
3. Einzelne Artikelseiten werden generiert

## 📝 Nächste Schritte

Zur weiteren Verbesserung der Website:

1. **Performance-Optimierung**
   - Bilder optimieren (WebP-Format)
   - CSS und JavaScript minimieren
   - Service Worker für Offline-Funktionalität implementieren

2. **Content-Management**
   - Weitere Broker-Logos hinzufügen
   - Team-Informationen aktualisieren
   - Weitere Stellenausschreibungen hinzufügen
   - Knowledge Base Artikel erweitern

3. **Features**
   - Newsletter-Anmeldung Funktionalität
   - Kontaktformular Backend-Integration
   - Analytics-Integration
   - Cookie-Consent-Banner

4. **SEO**
   - XML-Sitemap hinzufügen
   - Strukturierte Daten implementieren
   - Meta-Tags optimieren

## 📄 Lizenz

© 2024 lineo finance GmbH. Alle Rechte vorbehalten.