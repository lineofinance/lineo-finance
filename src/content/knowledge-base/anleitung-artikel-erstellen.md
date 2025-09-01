---
layout: kb-article.njk
title: Anleitung - Knowledge Base Artikel erstellen
description: Komplette Anleitung zum Erstellen von Artikeln, Einbinden von Bildern und Starten des Entwicklungsservers
tags: knowledgeBase
date: 2024-01-25
---

# Anleitung - Knowledge Base Artikel erstellen

Diese Anleitung erklärt Ihnen Schritt für Schritt, wie Sie neue Artikel für die Wissensdatenbank erstellen, formatieren, Bilder einbinden und die Website lokal testen können.

## Teil 1: Einen neuen Artikel erstellen

### Schritt 1: Neue Datei anlegen

1. Öffnen Sie VS Code
2. Navigieren Sie zum Ordner `src/knowledge-base/`
3. Erstellen Sie eine neue Datei mit der Endung `.md` (zum Beispiel: `mein-artikel.md`)
4. **Wichtig**: Verwenden Sie nur Kleinbuchstaben und Bindestriche im Dateinamen (keine Leerzeichen oder Umlaute)

### Schritt 2: Artikel-Kopfdaten (Frontmatter)

Jeder Artikel muss mit diesen Kopfdaten beginnen:

```yaml
---
layout: base.njk
title: Titel des Artikels
description: Kurze Beschreibung für die Übersichtsseite
tags: knowledgeBase
date: 2024-01-30
---
```

**Erklärung der Felder:**
- `layout`: Immer `base.njk` verwenden (nicht ändern)
- `title`: Der Titel, der auf der Seite angezeigt wird
- `description`: Eine kurze Zusammenfassung (1-2 Sätze)
- `tags`: Immer `knowledgeBase` (nicht ändern)
- `date`: Datum im Format YYYY-MM-DD

### Schritt 3: Artikel-Inhalt schreiben

Nach den Kopfdaten beginnt der eigentliche Artikel. Verwenden Sie Markdown-Formatierung:

```markdown
# Hauptüberschrift

Einleitungstext zum Thema...

## Erste Unterüberschrift

Normaler Text mit **fett** und *kursiv* Formatierung.

### Noch kleinere Überschrift

- Aufzählungspunkt 1
- Aufzählungspunkt 2
- Aufzählungspunkt 3

1. Nummerierte Liste
2. Zweiter Punkt
3. Dritter Punkt
```

## Teil 2: Bilder einbinden

### Vorbereitung der Bilder

1. **Speicherort**: Alle Bilder kommen in den Ordner `src/assets/images/`
2. **Dateinamen**: Verwenden Sie aussagekräftige Namen (z.B. `workflow-diagram.png` statt `bild1.png`)
3. **Formate**: 
   - JPG für Fotos
   - PNG für Screenshots und Grafiken
   - SVG für Logos und Icons

### Bildgrößen vorbereiten

Für optimale Darstellung auf allen Geräten sollten Sie verschiedene Bildgrößen bereitstellen:

**Desktop (große Bildschirme):**
- Breite: 1200px für volle Breite
- Breite: 800px für Artikel-Bilder

**Tablet:**
- Breite: 768px

**Mobil:**
- Breite: 375px

**Tipp**: Nutzen Sie Online-Tools wie TinyPNG.com zum Komprimieren der Bilder.

### Einfaches Bild einfügen

Die einfachste Methode:

```markdown
![Beschreibung des Bildes](/assets/images/ihr-bild.png)
```

**Beispiel:**
```markdown
![Workflow Diagramm](/assets/images/workflow-process.png)
```

### Bild mit Bildunterschrift

Für Bilder mit Beschriftung verwenden Sie HTML:

```html
<figure>
  <img src="/assets/images/ihr-bild.png" alt="Bildbeschreibung">
  <figcaption>Abbildung 1: Ihre Bildunterschrift</figcaption>
</figure>
```

### Responsive Bilder (verschiedene Größen für verschiedene Bildschirme)

Für optimale Performance auf allen Geräten:

```html
<picture>
  <source media="(max-width: 768px)" srcset="/assets/images/bild-mobil.png">
  <source media="(max-width: 1024px)" srcset="/assets/images/bild-tablet.png">
  <img src="/assets/images/bild-desktop.png" alt="Beschreibung">
</picture>
```

**So funktioniert's:**
- Smartphones (bis 768px) laden `bild-mobil.png`
- Tablets (bis 1024px) laden `bild-tablet.png`
- Desktop-Computer laden `bild-desktop.png`

### Bilder nebeneinander anzeigen

Für zwei Bilder nebeneinander:

```html
<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <img src="/assets/images/bild1.png" alt="Erstes Bild" style="width: 48%;">
  <img src="/assets/images/bild2.png" alt="Zweites Bild" style="width: 48%;">
</div>
```

## Teil 3: Website lokal testen

### Entwicklungsserver starten

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

## Teil 5: Git - Änderungen speichern und veröffentlichen

### Was ist Git?
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
Zeigt alle geänderten Dateien an.

#### 2. Dateien hinzufügen
```bash
# Alle Änderungen hinzufügen
git add .

# Oder einzelne Datei
git add src/knowledge-base/mein-artikel.md
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

### Versionierung und Deployment (Fortgeschritten)

#### Semantic Versioning
Das Projekt verwendet semantische Versionsnummern (z.B. v1.2.3):
- **Major (1.x.x)**: Große Änderungen
- **Minor (x.2.x)**: Neue Features
- **Patch (x.x.3)**: Kleine Fixes

#### Tag erstellen für Deployment
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

### Zusammenarbeit im Team

#### Aktuelle Änderungen holen
Bevor Sie arbeiten, immer die neuesten Änderungen holen:

**VS Code:**
- Unten links auf Sync-Pfeile klicken
- Oder: Drei Punkte (...) → Pull

**Terminal:**
```bash
git pull
```

#### Bei Konflikten
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

## Teil 4: Praktisches Beispiel

Hier ein komplettes Beispiel für einen Artikel:

```markdown
---
layout: base.njk
title: Die Vorteile der Digitalisierung
description: Wie digitale Prozesse Ihre Arbeit erleichtern
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

## Wichtige Tipps

### Dos ✅
- **Aussagekräftige Dateinamen** verwenden
- **Alt-Texte** für alle Bilder angeben (Barrierefreiheit)
- **Bilder komprimieren** vor dem Upload
- **Regelmäßig speichern** in VS Code (Strg+S / Cmd+S)
- **Live-Server** nutzen zum Testen

### Don'ts ❌
- Keine Leerzeichen in Dateinamen
- Keine Umlaute in Dateinamen (ä, ö, ü)
- Keine zu großen Bilder (max. 500KB pro Bild empfohlen)
- Nicht vergessen, den Artikel zu den Kopfdaten hinzuzufügen

## Hilfe und Support

Bei Fragen oder Problemen:
1. Prüfen Sie, ob alle Dateipfade korrekt sind
2. Stellen Sie sicher, dass der Server läuft (`npm run serve`)
3. Schauen Sie in die Browser-Konsole für Fehlermeldungen (F12)

---

*Diese Anleitung wird regelmäßig aktualisiert. Letzte Änderung: Januar 2024*