---
layout: kb-article.njk
title: Anbindung Interactive Brokers und alle darauf basierenden Broker
menuTitle: Anbindung Interactive Brokers
description: Beschreibung für SEO und Übersichten
tags: knowledgeBase
date: 2025-09-01
showInFooter: true
footerPriority: 1
featured: true
---

Gehen Sie auf die [Anmeldung IB-Kontoverwaltung](https://www.interactivebrokers.ie/sso/Login?RL=1) und melden Sie sich auf Ihrem Konto an:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/01-anmeldung-ib.png)

Zum Erstellen des Flex-Queries, im linken Menü über das “Berichtswesen” auf “Flex-Queries” klicken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/02-menue-berichtswesen.png)

Auf das Plus gehen

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/03-neues-flex-query.png)

und einen Query-Namen Ihrer Wahl vergeben, beispielsweise "Buchhaltung Lineo Finance"   :

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/04-query-name.png)

Anschließend müssen <span class="highlight">ALLE</span> Felder (ca. 50 Felder) in der Kategorie “Abschnitte” einzeln angeklickt werden, und darin wieder alle Felder aktiviert werden (hier sind beispielhaft nur die ersten beiden markiert):

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/05-felder-abschnitte.png)

Dies gilt sowohl für <span class="highlight">ALLE</span> Felder, in denen ein Häkchen gesetzt werden muss,

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/06-inhalt-abschnitte.png)

als auch für <span class="highlight">ALLE</span> Auswahlfelder, die in manchen Abschnitten oberhalb der Häkchen erscheinen:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/07-auswahlfelder-abschnitte.png)

Aber <span class="highlight">Achtung</span>: Hier gibt es drei Ausnahmen, bei denen nicht alle Felder angeklickt werden können:

1. In der Kapitalflussrechnung bekommt das Feld “Orderübersicht” keinen Haken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/08-kapitalflussrechnung-abschnitt.png)

2. Bei den Transaktionsgebühren bekommt das Feld “Order” keinen Haken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/09-transaktionsgebuehren-abschnitt.png)

3. Bei der Veränderung des NAV bekommt das Feld “Realisiert & Unrealisiert” keinen Haken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/10-veraenderung-des-nav-abschnitt.png)

Nun wird die Zustellungskonfiguration folgendermaßen befüllt (Achtung: Es ist möglich, dass bei Ihnen das Multikonto-Format nicht erscheint):

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/11-zustellungskonfiguration.png)

Falls Sie mehrere Konten bzw. Unterkonten haben, klicken Sie auf Konto/Konten bearbeiten/hinzufügen:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/12-zustellungskonfiguration-konten.png)

Es öffnet sich folgendes Fenster - dort bitte alle Konten auswählen:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/13-konten-auswaehlen.png)

Jetzt bearbeiten Sie die allgemeine Konfiguration entsprechend (Achtung: Das Zeitformat mit Doppelpunkten auswählen):

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/14-allgemeine-konfiguration.png)

Anschließend unten rechts auf weiter:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/15-weiter.png)

Nun können Sie Ihre Daten nochmal kontrollieren und klicken abschließend unten rechts auf erstellen:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/16-erstellen.png)

Die Kontoumsatz-Flex-Query wurde gespeichert. Bitte mit dem grünen OK bestätigen:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/17-flex-query-speichern.png)

Sie gelangen auf folgende Seite:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/18-kontoumsatz-flex-query.png)

Dort klicken sie auf das blaue “i”. Hier wird die Query-ID angezeigt:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/19-flex-query.png)

Diese wird später im Benutzerkonto bei Lineo Finance eingegeben.

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/20-query-id.png)

Ebenso benötigen wir für das Benutzerkonto in Lineo Finance einen Token. Dieser wird folgendermaßen erstellt:

Wir befinden uns immer noch im Berichtswesen auf der Seite Flex-Queries. Dort gibt es den Punkt Flex-Web-Service-Konfiguration:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/21-flex-web-service-konfiguration.png)

Bitte klicken Sie auf das Zahnrädchen. Es öffnet sich folgendes Fester:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/22-flex-web-service-status.png)

Bitte stellen Sie sicher, dass ein Häkchen beim Flex-Web-Service-Status ist. Danach klicken Sie auf “Neuen Token generieren”. Dann öffnet sich ein weiteres Fenster. Hier stellen Sie bitte das Ablaufdatum auf 1 Year ein, klicken auf “Neuen Token generieren”:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/23-token-generieren.png)

Ein neuer Aktiver Token wird angegeben, welchen wir später im Benutzerkonto der Lineo Finance benötigen. Anschließend bitte “Save” anklicken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/24-aktiver-token.png)

Achtung: Auch trotz Anklicken von "Speichern" wird dieses Fenster nicht verlassen.

Nun müssen die Query-ID und der Token im [Lineo Finance Kundenkonto](https://app.lineo.finance) hinterlegt werden. Dazu melden Sie sich bitte in Ihrem Kundenkonto an:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/25-anmeldung-kundenkonto.png)

Anschließend wählen Sie Ihre Gesellschaft aus

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/26-gesellschaft-auswaehlen.png)

und gehen auf “Neuen Zugang erstellen”.

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/27-neuen-zugang-erstellen.png)

Bitte wählen Sie Interactive Brokers aus und tragen den oben erstellten Token sowie die Query-Id ein. Anschließend klicken Sie auf “Erstellen”. 

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/28-daten-neuer-zugang.png)

Schon erscheint Ihr neu angelegter Zugang in der Liste. An dieser Stelle sind Sie fertig. Sollte es Probleme geben, werden wir uns bei Ihnen melden.

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/29-neuer-zugang-erstellt.png)

Vielen Dank!

Ihr Lineo-Team





