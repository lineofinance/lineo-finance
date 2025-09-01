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

### Vollständige Anleitung zum Erstellen von Knowledge Base Artikeln

Die Wissensdatenbank ist ein zentraler Bestandteil der Lineo Finance Website und bietet strukturierte Informationen zur automatisierten Wertpapierverbuchung. Das System nutzt Markdown-Dateien mit 11ty Collections für automatische Generierung und Organisation.

#### 1. Artikelstruktur und Dateiorganisation

Erstellen Sie neue Artikel im `src/knowledge-base/` Verzeichnis. Die Dateinamen sollten dem Schema `kategorie-titel-des-artikels.md` folgen:

```
src/knowledge-base/
├── grundlagen-automatisierte-verbuchung.md
├── anleitung-api-integration.md
├── faq-haeufige-fragen.md
└── compliance-mifid-anforderungen.md
```

#### 2. Vollständiges Artikel-Template

```markdown
---
title: "Automatisierte Wertpapierverbuchung: Ein Leitfaden"
description: "Umfassender Leitfaden zur automatisierten Wertpapierverbuchung mit Lineo Finance. Erfahren Sie, wie Sie Ihre Prozesse optimieren."
category: "Grundlagen"
tags: ["Automatisierung", "Wertpapiere", "Buchhaltung", "Effizienz"]
date: 2024-01-15
author: "Dr. Michael Schmidt"
featured: true
readingTime: "8 Min"
difficulty: "Einsteiger"
relatedArticles: ["api-integration", "broker-anbindung", "steuerreporting"]
---

## Einleitung

Die automatisierte Wertpapierverbuchung revolutioniert die Art und Weise, wie Steuerberater und Unternehmen mit Wertpapiertransaktionen umgehen. In diesem Artikel erfahren Sie...

## Inhaltsverzeichnis
- [Grundlagen verstehen](#grundlagen)
- [Vorteile der Automatisierung](#vorteile)
- [Implementierung](#implementierung)
- [Best Practices](#best-practices)

## Grundlagen verstehen {#grundlagen}

Die Wertpapierverbuchung umfasst...

### Kernkonzepte

**Transaktionstypen:**
- Käufe und Verkäufe
- Dividenden und Zinsen
- Corporate Actions
- Währungsumrechnungen

### Technische Grundlagen

```javascript
// Beispiel einer Transaktionsverarbeitung
const transaction = {
  type: 'BUY',
  isin: 'DE0008404005',
  quantity: 100,
  price: 89.50,
  currency: 'EUR'
};
```

## Vorteile der Automatisierung {#vorteile}

1. **Zeitersparnis**: Bis zu 90% Reduktion des manuellen Aufwands
2. **Fehlerminimierung**: Automatische Validierung und Plausibilitätsprüfungen
3. **Compliance**: Automatische Einhaltung regulatorischer Anforderungen

> **Hinweis**: Die Automatisierung ersetzt nicht die fachliche Prüfung, sondern unterstützt sie.

## Implementierung {#implementierung}

### Schritt 1: Vorbereitung

Bevor Sie mit der Implementierung beginnen...

### Schritt 2: API-Anbindung

Die Integration erfolgt über unsere REST-API:

```bash
curl -X POST https://api.lineo.finance/transactions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"transaction": {...}}'
```

### Schritt 3: Datenvalidierung

| Feld | Typ | Pflichtfeld | Beschreibung |
|------|-----|-------------|--------------|
| ISIN | String | Ja | Internationale Wertpapierkennnummer |
| Datum | Date | Ja | Transaktionsdatum |
| Menge | Number | Ja | Anzahl der Wertpapiere |
| Kurs | Decimal | Ja | Kurs pro Einheit |

## Best Practices {#best-practices}

### Datenqualität sicherstellen

- Regelmäßige Überprüfung der Importdaten
- Implementierung von Validierungsregeln
- Monitoring von Fehlerquoten

### Performance-Optimierung

- Batch-Verarbeitung für große Datenmengen
- Asynchrone Verarbeitung nutzen
- Caching von Stammdaten

## Zusammenfassung

Die automatisierte Wertpapierverbuchung bietet erhebliche Vorteile...

## Weiterführende Ressourcen

- [API-Dokumentation](/knowledge-base/api-documentation)
- [Broker-Integration Guide](/knowledge-base/broker-integration)
- [Video-Tutorial: Erste Schritte](https://youtube.com/...)

## FAQ zum Artikel

**Frage: Wie lange dauert die Implementierung?**
Antwort: Die Basis-Implementierung dauert typischerweise 2-3 Tage...

**Frage: Welche Broker werden unterstützt?**
Antwort: Wir unterstützen über 30 Broker, darunter...

---

*Letzte Aktualisierung: 15. Januar 2024*
*Haben Sie Fragen? [Kontaktieren Sie unser Support-Team](/kontakt)*
```

#### 3. Erweiterte Frontmatter-Felder

**Pflichtfelder:**
- `title`: Artikel-Titel (max. 60 Zeichen für SEO)
- `description`: Meta-Beschreibung (150-160 Zeichen)
- `category`: Hauptkategorie des Artikels
- `date`: Veröffentlichungsdatum (YYYY-MM-DD)

**Optionale Felder:**
- `tags`: Array von Schlagwörtern für Suche und Filterung
- `author`: Autor des Artikels
- `featured`: Boolean - erscheint in "Beliebte Artikel"
- `readingTime`: Geschätzte Lesezeit
- `difficulty`: "Einsteiger", "Fortgeschritten", "Experte"
- `relatedArticles`: Array von Dateinamen verwandter Artikel
- `lastUpdated`: Datum der letzten Aktualisierung
- `version`: Versionsnummer für technische Dokumentation
- `language`: Sprache (Standard: "de")

#### 4. Kategoriesystem

**Hauptkategorien:**

- **Grundlagen**: Einführende Konzepte und Übersichten
  - Dateinamen-Präfix: `grundlagen-`
  - Zielgruppe: Neue Nutzer und Interessenten
  
- **Anleitungen**: Schritt-für-Schritt Tutorials
  - Dateinamen-Präfix: `anleitung-`
  - Zielgruppe: Nutzer in der Implementierung
  
- **FAQ**: Häufig gestellte Fragen
  - Dateinamen-Präfix: `faq-`
  - Zielgruppe: Alle Nutzer
  
- **Integration**: Technische Dokumentation
  - Dateinamen-Präfix: `integration-`
  - Zielgruppe: Entwickler und IT-Administratoren
  
- **Compliance**: Rechtliche und regulatorische Themen
  - Dateinamen-Präfix: `compliance-`
  - Zielgruppe: Compliance-Beauftragte und Steuerberater

- **Use Cases**: Praktische Anwendungsfälle
  - Dateinamen-Präfix: `usecase-`
  - Zielgruppe: Entscheidungsträger

#### 5. Markdown-Funktionen und Styling

**Überschriften-Hierarchie:**
```markdown
# Wird nicht verwendet (Titel kommt aus Frontmatter)
## Hauptüberschrift
### Unterüberschrift
#### Detail-Überschrift
```

**Spezielle Blöcke:**

```markdown
> **Hinweis**: Wichtige Information in Info-Box

> **Warnung**: Kritischer Hinweis in Warnungs-Box

> **Tipp**: Hilfreicher Tipp in Tipp-Box
```

**Code-Blöcke mit Syntax-Highlighting:**
```markdown
```javascript
// JavaScript Code
const example = "code";
```

```python
# Python Code
example = "code"
```

```sql
-- SQL Query
SELECT * FROM transactions;
```
```

**Tabellen:**
```markdown
| Spalte 1 | Spalte 2 | Spalte 3 |
|----------|----------|----------|
| Daten 1  | Daten 2  | Daten 3  |
```

**Interne Verlinkungen:**
```markdown
[Link zu anderem Artikel](/knowledge-base/artikel-name)
[Link zu Seite](/leistungen)
```

**Anker-Links:**
```markdown
[Zum Abschnitt](#abschnitt-id)

## Abschnitt Titel {#abschnitt-id}
```

#### 6. Bilder und Medien

**Bilder organisieren:**
```
src/assets/images/knowledge-base/
├── grundlagen/
│   ├── prozess-diagramm.png
│   └── dashboard-screenshot.jpg
├── anleitungen/
│   ├── schritt-1.png
│   └── schritt-2.png
└── shared/
    └── logo-partner.svg
```

**Bilder einbinden:**
```markdown
![Alt-Text für Barrierefreiheit](/assets/images/knowledge-base/grundlagen/prozess-diagramm.png)

<!-- Mit Bildunterschrift -->
![Dashboard Ansicht](/assets/images/knowledge-base/dashboard.jpg)
*Abbildung 1: Das Lineo Finance Dashboard*

<!-- Responsive Bilder -->
<picture>
  <source media="(max-width: 768px)" srcset="/assets/images/kb/mobile.jpg">
  <img src="/assets/images/kb/desktop.jpg" alt="Beschreibung">
</picture>
```

**Videos einbetten:**
```markdown
<!-- YouTube Video -->
<iframe width="560" height="315" 
  src="https://www.youtube.com/embed/VIDEO_ID" 
  frameborder="0" allowfullscreen>
</iframe>

<!-- Lokales Video -->
<video controls width="100%">
  <source src="/assets/videos/tutorial.mp4" type="video/mp4">
  Ihr Browser unterstützt keine Videos.
</video>
```

#### 7. SEO-Optimierung

**Best Practices:**
- Titel: 50-60 Zeichen, Hauptkeyword am Anfang
- Description: 150-160 Zeichen, Call-to-Action einbauen
- URL-Slug: Kurz und beschreibend (automatisch aus Dateiname)
- Überschriften: Keywords natürlich einbauen
- Interne Verlinkung: 2-3 Links zu verwandten Artikeln
- Alt-Texte: Beschreibende Texte für alle Bilder

**Strukturierte Daten (automatisch generiert):**
- Article Schema
- Breadcrumb Schema
- FAQ Schema (bei FAQ-Artikeln)

#### 8. Build-Prozess und Veröffentlichung

**Artikel hinzufügen:**
1. Markdown-Datei in `src/knowledge-base/` erstellen
2. Frontmatter vollständig ausfüllen
3. Inhalt strukturiert verfassen
4. Bilder in korrektes Verzeichnis ablegen

**Build und Test:**
```bash
# Entwicklungsserver starten
npm run serve

# Preview unter http://localhost:8080/knowledge-base/

# Für Produktion bauen
npm run build

# Output prüfen in dist/knowledge-base/
```

**Automatische Features:**
- Inhaltsverzeichnis-Generierung
- Lesezeit-Berechnung
- Verwandte Artikel
- Kategorie-Seiten
- Tag-Cloud
- RSS-Feed
- Sitemap-Integration

#### 9. Qualitätssicherung

**Checkliste vor Veröffentlichung:**
- [ ] Rechtschreibung und Grammatik geprüft
- [ ] Alle Links funktionieren
- [ ] Bilder optimiert (< 200KB pro Bild)
- [ ] Mobile Ansicht getestet
- [ ] SEO-Felder ausgefüllt
- [ ] Fachliche Richtigkeit validiert
- [ ] Compliance-Anforderungen geprüft

**Review-Prozess:**
1. Autor erstellt Entwurf
2. Fachliche Prüfung durch Experten
3. Redaktionelle Überarbeitung
4. Compliance-Check
5. Finale Freigabe
6. Veröffentlichung

#### 10. Wartung und Aktualisierung

**Regelmäßige Überprüfung:**
- Quartalweise Review aller Artikel
- Aktualisierung bei Gesetzesänderungen
- Broken Link Check monatlich
- Performance-Monitoring

**Versionierung:**
```yaml
---
version: "2.1"
lastUpdated: 2024-02-15
changeLog:
  - "2.1: API-Endpunkte aktualisiert"
  - "2.0: Komplette Überarbeitung"
  - "1.0: Erstveröffentlichung"
---
```

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