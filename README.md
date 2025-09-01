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

## 📚 Wissensdatenbank - Vollständige Anleitung für Knowledge Base Artikel

### Artikel erstellen mit VS Code und Git

Diese Anleitung erklärt Schritt für Schritt, wie Sie neue Artikel für die Wissensdatenbank erstellen, formatieren, Bilder einbinden, die Website lokal testen und Änderungen veröffentlichen.

---

## Teil 1: Einen neuen Artikel erstellen

### 📝 Schritt 1: Neue Datei anlegen

1. **Öffnen Sie VS Code**
2. Navigieren Sie zum Ordner `src/content/knowledge-base/`
3. Erstellen Sie eine neue Datei mit der Endung `.md` (zum Beispiel: `mein-artikel.md`)
4. **Wichtig**: Verwenden Sie nur Kleinbuchstaben und Bindestriche im Dateinamen (keine Leerzeichen oder Umlaute)

**Beispiele für Dateinamen:**
- `grundlagen-was-ist-wertpapierverbuchung.md`
- `anleitung-erste-schritte.md`
- `faq-haeufige-fragen.md`

### 📋 Schritt 2: Artikel-Kopfdaten (Frontmatter)

Jeder Artikel muss mit diesen Kopfdaten beginnen:

```yaml
---
layout: kb-article.njk
title: "Titel des Artikels"
description: "Kurze Beschreibung für die Übersichtsseite"
tags: knowledgeBase
date: 2024-01-30
---
```

**Erklärung der Felder:**
- `layout`: Immer `kb-article.njk` verwenden (nicht ändern)
- `title`: Der Titel, der auf der Seite angezeigt wird
- `description`: Eine kurze Zusammenfassung (1-2 Sätze)
- `tags`: Immer `knowledgeBase` (nicht ändern)
- `date`: Datum im Format YYYY-MM-DD

### ✍️ Schritt 3: Artikel-Inhalt schreiben

Nach den Kopfdaten beginnt der eigentliche Artikel. Verwenden Sie Markdown-Formatierung:

#### **Überschriften erstellen**

```markdown
# Hauptüberschrift

## Erste Unterüberschrift

### Noch kleinere Überschrift

#### Detail-Überschrift
```

#### **Normaler Text**

```markdown
Das ist der erste Absatz. Er kann so lang sein wie Sie möchten.

Das ist der zweite Absatz. Durch die Leerzeile wird er getrennt.
```

#### **Text hervorheben**

```markdown
**Dieser Text wird fett**

*Dieser Text wird kursiv*

**Wichtig:** Kombinieren Sie fett für wichtige Hinweise
```

#### **Listen erstellen**

**Aufzählungsliste:**
```markdown
- Erster Punkt
- Zweiter Punkt
- Dritter Punkt
```

**Nummerierte Liste:**
```markdown
1. Erster Schritt
2. Zweiter Schritt
3. Dritter Schritt
```

#### **Links einfügen**

```markdown
[Klicken Sie hier](/kontakt) um zur Kontaktseite zu gelangen

[Mehr erfahren](https://www.lineo.finance) auf unserer Website
```

#### **Wichtige Hinweise hervorheben**

```markdown
> **Hinweis:** Dieser Text erscheint in einer hervorgehobenen Box

> **Tipp:** Nutzen Sie diese Funktion für hilfreiche Tipps

> **Wichtig:** Für besonders wichtige Informationen
```

---

## Teil 2: Bilder einbinden

### 🖼️ Vorbereitung der Bilder

1. **Speicherort**: Alle Bilder kommen in den Ordner `src/assets/images/`
2. **Dateinamen**: Verwenden Sie aussagekräftige Namen (z.B. `workflow-diagram.png` statt `bild1.png`)
3. **Formate**: 
   - JPG für Fotos
   - PNG für Screenshots und Grafiken
   - SVG für Logos und Icons

### Bildgrößen vorbereiten

Für optimale Darstellung auf allen Geräten:

**Desktop (große Bildschirme):**
- Breite: 1200px für volle Breite
- Breite: 800px für Artikel-Bilder

**Tablet:**
- Breite: 768px

**Mobil:**
- Breite: 375px

**Tipp**: Nutzen Sie Online-Tools wie TinyPNG.com zum Komprimieren der Bilder.

### Einfaches Bild einfügen

```markdown
![Beschreibung des Bildes](/assets/images/ihr-bild.png)
```

**Beispiel:**
```markdown
![Workflow Diagramm](/assets/images/workflow-process.png)
```

### Bild mit Bildunterschrift

```html
<figure>
  <img src="/assets/images/ihr-bild.png" alt="Bildbeschreibung">
  <figcaption>Abbildung 1: Ihre Bildunterschrift</figcaption>
</figure>
```

### Responsive Bilder (verschiedene Größen für verschiedene Bildschirme)

```html
<picture>
  <source media="(max-width: 768px)" srcset="/assets/images/bild-mobil.png">
  <source media="(max-width: 1024px)" srcset="/assets/images/bild-tablet.png">
  <img src="/assets/images/bild-desktop.png" alt="Beschreibung">
</picture>
```

---

## Teil 3: Website lokal testen

### 🚀 Entwicklungsserver starten

1. **Terminal in VS Code öffnen:**
   - Menü: Terminal → Neues Terminal
   - Oder Tastenkombination: `Strg + Shift + ö` (Windows) bzw. `Cmd + Shift + ö` (Mac)

2. **Zum Projektordner navigieren:**
   ```bash
   cd lineo-finance
   ```

3. **Entwicklungsserver starten:**
   ```bash
   npm run serve
   ```

4. **Website öffnen:**
   - Der Server startet automatisch
   - Die Website öffnet sich im Browser unter `http://localhost:8080`
   - Änderungen werden automatisch aktualisiert (Live-Reload)

### Server stoppen

Um den Server zu beenden:
- Im Terminal: `Strg + C` (Windows) oder `Cmd + C` (Mac) drücken

---

## Teil 4: Git - Änderungen speichern und veröffentlichen

### 💾 Was ist Git?

Git ist ein Versionskontrollsystem, das alle Änderungen an Ihren Dateien speichert. So können Sie jederzeit zu einer früheren Version zurückkehren und Ihre Kollegen sehen, was geändert wurde.

### Option A: Git mit VS Code (Einfacher)

#### 1. Änderungen anzeigen
- Links in VS Code auf das **Quellcodeverwaltung-Symbol** klicken (3. Icon, sieht aus wie Verzweigungen)
- Sie sehen alle geänderten Dateien mit einem "M" (Modified) oder "U" (Untracked)

#### 2. Änderungen speichern (Commit)
1. **Nachricht eingeben**: Oben im Feld eine kurze Beschreibung eingeben, was Sie geändert haben
   - Beispiel: "Neuen Artikel über Steueroptimierung hinzugefügt"
   - Beispiel: "Bilder für Workflow-Artikel aktualisiert"
2. **Häkchen klicken**: Auf das Häkchen-Symbol (✓) oben klicken
3. Alle Änderungen sind jetzt lokal gespeichert

#### 3. Änderungen hochladen (Push)
- Auf die **drei Punkte** (...) klicken → **Push** auswählen
- Oder: Unten links auf die Sync-Pfeile klicken
- Ihre Änderungen werden zum Server hochgeladen

### Option B: Git mit Terminal

#### 1. Status prüfen
```bash
git status
```

#### 2. Dateien hinzufügen
```bash
# Alle Änderungen hinzufügen
git add .

# Oder einzelne Datei
git add src/content/knowledge-base/mein-artikel.md
```

#### 3. Commit erstellen
```bash
git commit -m "Beschreibung der Änderungen"
```

**Beispiele für gute Commit-Nachrichten:**
- `git commit -m "feat: Neuen Knowledge Base Artikel über Automatisierung hinzugefügt"`
- `git commit -m "fix: Tippfehler in Steueroptimierung-Artikel korrigiert"`
- `git commit -m "docs: Anleitung für Bildgrößen erweitert"`

#### 4. Änderungen hochladen
```bash
git push
```

---

## Teil 5: Versionierung und Deployment

### 🏷️ Semantic Versioning

Das Projekt verwendet semantische Versionsnummern (z.B. v1.2.3):
- **Major (1.x.x)**: Große Änderungen
- **Minor (x.2.x)**: Neue Features
- **Patch (x.x.3)**: Kleine Fixes

### Tag erstellen für Deployment

**Wichtig**: Tags lösen automatisch das Deployment aus!

```bash
# Patch-Version (kleine Änderung) - z.B. von v1.0.0 zu v1.0.1
git tag v1.0.1
git push --tags

# Minor-Version (neues Feature) - z.B. von v1.0.1 zu v1.1.0
git tag v1.1.0
git push --tags

# Major-Version (große Änderung) - z.B. von v1.1.0 zu v2.0.0
git tag v2.0.0
git push --tags
```

**Wann welche Version?**
- **Patch** (v1.0.X): Tippfehler korrigiert, kleine Textänderungen
- **Minor** (v1.X.0): Neuer Artikel, neue Seite, neue Funktion
- **Major** (vX.0.0): Komplettes Redesign, große strukturelle Änderungen

---

## Teil 6: Zusammenarbeit im Team

### 👥 Aktuelle Änderungen holen

Bevor Sie arbeiten, immer die neuesten Änderungen holen:

**VS Code:**
- Unten links auf Sync-Pfeile klicken
- Oder: Drei Punkte (...) → Pull

**Terminal:**
```bash
git pull
```

### Bei Konflikten

Falls zwei Personen dieselbe Datei geändert haben:
1. VS Code zeigt Konflikte an
2. Wählen Sie "Accept Current Change" oder "Accept Incoming Change"
3. Speichern und neu committen

### Häufige Git-Befehle

```bash
# Status anzeigen
git status

# Letzte Commits anzeigen
git log --oneline -5

# Änderungen rückgängig machen (vor Commit)
git checkout -- dateiname.md

# Zum letzten Commit zurück
git reset --hard HEAD

# Branch anzeigen
git branch

# Alle Remote-Änderungen holen
git fetch
```

---

## 📄 Vollständiges Beispiel

Hier ein kompletter Beispiel-Artikel:

```markdown
---
layout: kb-article.njk
title: "Die Vorteile der Digitalisierung"
description: "Wie digitale Prozesse Ihre Arbeit erleichtern"
tags: knowledgeBase
date: 2024-01-30
---

# Die Vorteile der Digitalisierung

Die Digitalisierung revolutioniert die Arbeitsweise in der Finanzbranche.

![Digitalisierung Übersicht](/assets/images/digitalisierung-hero.png)

## Zeitersparnis durch Automatisierung

Durch automatisierte Prozesse sparen Sie täglich wertvolle Zeit:

- **Datenerfassung**: Automatischer Import statt manueller Eingabe
- **Berechnungen**: Fehlerfreie automatische Kalkulationen
- **Reporting**: Berichte auf Knopfdruck

<figure>
  <img src="/assets/images/zeitersparnis-grafik.png" alt="Zeitersparnis Grafik">
  <figcaption>Durchschnittliche Zeitersparnis: 70%</figcaption>
</figure>

## Mobile Verfügbarkeit

<picture>
  <source media="(max-width: 768px)" srcset="/assets/images/app-mobil.png">
  <source media="(max-width: 1024px)" srcset="/assets/images/app-tablet.png">
  <img src="/assets/images/app-desktop.png" alt="App auf verschiedenen Geräten">
</picture>

Greifen Sie von überall auf Ihre Daten zu - ob im Büro, unterwegs oder im Home Office.

---

*Haben Sie Fragen? [Kontaktieren Sie uns](/pages/kontakt/) für weitere Informationen.*
```

---

## 💡 Wichtige Tipps

### Dos ✅
- **Aussagekräftige Dateinamen** verwenden
- **Alt-Texte** für alle Bilder angeben (Barrierefreiheit)
- **Bilder komprimieren** vor dem Upload (max. 500KB pro Bild)
- **Regelmäßig speichern** in VS Code (Strg+S / Cmd+S)
- **Live-Server** nutzen zum Testen
- **Commit-Nachrichten** klar und beschreibend formulieren

### Don'ts ❌
- Keine Leerzeichen in Dateinamen
- Keine Umlaute in Dateinamen (ä, ö, ü)
- Keine zu großen Bilder (max. 500KB pro Bild empfohlen)
- Nicht vergessen, Tags für Deployment zu erstellen
- Keine sensiblen Daten in Screenshots zeigen

### Kategorien richtig wählen:
- **Grundlagen**: Erklärungen von Konzepten ("Was ist...?")
- **Anleitungen**: Schritt-für-Schritt Tutorials ("Wie mache ich...?")
- **FAQ**: Kurze Fragen und Antworten
- **Use Cases**: Praktische Beispiele aus dem Alltag

---

## 🆘 Hilfe und Support

Bei Fragen oder Problemen:
1. Prüfen Sie, ob alle Dateipfade korrekt sind
2. Stellen Sie sicher, dass der Server läuft (`npm run serve`)
3. Schauen Sie in die Browser-Konsole für Fehlermeldungen (F12)
4. Bei Git-Problemen: `git status` zeigt den aktuellen Zustand

Bei Fragen zur Artikel-Erstellung:
- Schauen Sie sich existierende Artikel als Beispiel an
- Fragen Sie das Team
- Nutzen Sie Online Markdown-Editoren zum Üben: [dillinger.io](https://dillinger.io)

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