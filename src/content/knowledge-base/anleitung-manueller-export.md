---
layout: kb-article.njk
title: Manueller Datenexport Interactive Brokers sowie alle darauf basierenden Broker
menuTitle: Manueller Datenexport Interactive Brokers
tags: knowledgeBase
date: 2025-09-01
showInFooter: true
footerPriority: 1
featured: true
---
# <center>Manueller Datenexport Interactive Brokers sowie alle darauf basierenden Broker</center>

**Den manuellen Datenexport können Sie nur durchführen, wenn Sie bereits eine Flex-Query konfiguriert haben. Falls nicht, erstellen Sie diese bitte gemäß [dieser Anleitung](https://www.lineo.finance/content/knowledge-base/anleitung-anbindung/).**

## 1. Erstellen des manuellen Exports

Gehen Sie auf die [Anmeldung IB-Kontoverwaltung](https://www.interactivebrokers.ie/sso/Login?RL=1) und melden Sie sich auf Ihrem Konto an:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/01-anmeldung-ib.png)

Zum Erstellen des Flex-Queries, im linken Menü unter “Berichte” auf “Flex-Queries” klicken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/02-menue-berichtswesen.png)

Hier auf Konto/Konten auswählen gehen. Falls die Option nicht erscheint, haben Sie nur ein Konto. In diesem Fall können Sie einige Schritte überspringen und direkt [den Export starten](#exportstart).

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/03-flex-queries.png)

Stellen Sie bitte sicher, dass <span class="highlight">ALLE</span> Konten ausgewählt wurden:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/04-konten-auswaehlen.png)

Öffnen Sie nun noch den Filter und vergewissern Sie sich, dass "Übertragen" und "Geschlossen" ausgewählt sind. Klicken Sie anschließend auf "Übernehmen". Es ist möglich, dass das Filtersymbol nicht erscheint, wenn nur ein Konto vorhanden ist.

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/05-ergebnisse-filtern.png)

Übertragene Konten sind jene, die im Jahr 2021 im Zuge des Brexits von IB UK nach IB Irland oder im Jahr 2024 von IB Ungarn nach IB Irland übertragen wurden.

Geschlossene Konten können im Nachhinein seitens IB noch Transaktionen beinhalten, welche für die korrekte Verbuchung ebenfalls berücksichtigt werden müssen.

Bitte wählen Sie alle Konten aus und klicken anschließend auf "Weiter":

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/06-alle-konten-anklicken.png)

Es erscheinen alle Konten in der Leiste:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/07-konten-leiste.png)

<a id="exportstart"></a>Nun können Sie den Export starten, indem Sie auf den Pfeil nach rechts gehen:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/08-export-starten.png)

Im nächsten Fenster geben Sie einen benutzerdefinierten Zeitraum ein. In den Feldern “Von” und “Bis” wählen Sie den Zeitraum aus, der Ihnen vom Lineo Finance Kundensupport mitgeteilt wurde. Dieser entspricht typischerweise einem ganzen Geschäftsjahr. Sollte das Konto erst in dem betreffenden Jahr eröffnet worden sein, nehmen Sie das frühstmögliche auswählbare Datum. Das “Format” sollte automatisch auf XML eingestellt sein. Sollten Sie ein abweichendes Geschäftsjahr haben, müssen Sie beispielsweise “Von 01.07.2023 Bis 30.06.2024 eingeben.”

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/09-zeitraum-format.png)

Der Bericht sollte nun in Ihrem Download-Bereich abgelegt sein.

## 2. Hochladen des manuellen Exports im Lineo Finance Kundenkonto

Nun laden Sie bitte die Datei in Ihrem [Lineo Finance Kundenkonto](https://app.lineo.finance) hoch. Dazu gehen Sie in “Meine Gesellschaften” und klicken auf Ihre Gesellschaft:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/10-meine-gesellschaften.png)

Anschließend wählen Sie Ihre Datei aus dem Download-Bereich aus…

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/11-datei-auswaehlen.png)

… und klicken auf Upload:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/12-upload.png)

## 3. Prüfung der Datei abwarten

Nun wird geprüft, ob die Datei korrekt ist:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/13-datei-pruefen.png)

Sobald die Prüfung abgeschlossen ist (normalerweise in max. 1 Minute), werden der Zeitraum und die entsprechenden Konten angezeigt. Bitte prüfen Sie, ob die angezeigten Informationen korrekt sind. Sollte z.B. ein Konto fehlen oder ein falscher Zeitraum hochgeladen worden sein, können Sie die Datei wieder löschen und ggf. korrigieren bzw. die richtige Datei hochladen:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/14-datei-loeschen.png)

Sollte die Prüfung nicht erfolgreich abgeschlossen worden sein, wird Ihnen eine Fehlermeldung angezeigt werden. Im folgenden Beispiel wurde in der Zustellungskonfiguration ein falsches Format ausgewählt:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/manueller-export/15-pruefung-fehlerhaft.png)

Bitte korrigieren Sie das Format, löschen die fehlerhafte Datei und laden die korrigierte Datei anschließend erneut in Ihrem Kundenkonto hoch.

Sollten sich bei unserer Bearbeitung noch Fragen ergeben, werden wir uns wieder bei Ihnen melden.

Vielen Dank!

Ihr Lineo-Team
