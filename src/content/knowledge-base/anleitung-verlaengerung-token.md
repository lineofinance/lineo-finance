---
layout: kb-article.njk
title: Verlängerung des Tokens Interactive Brokers
menuTitle: Verlängerung Token Interactive Brokers
tags: knowledgeBase
date: 2025-09-01
showInFooter: true
footerPriority: 1
featured: true
---

# <center>Verlängerung des Tokens bei Interactive Brokers</center>

## 1. Verlängern/Ändern des Tokens

Gehen Sie auf die [Anmeldung IB-Kontoverwaltung](https://www.interactivebrokers.ie/sso/Login?RL=1) und melden Sie sich auf Ihrem Konto an:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/01-anmeldung-ib.png)

Zum Verlängern des Tokens im linken Menü unter “Berichte” auf “Flex-Queries” klicken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/02-menue-berichtswesen.png)

 Nun auf der rechten Seite bei der Flex-Web-Service-Konfiguration auf das Zahnrädchen klicken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/21-flex-web-service-konfiguration.png)

Es öffnet sich folgendes Fenster:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/22-flex-web-service-status.png)

Bitte stellen Sie sicher, dass ein Häkchen beim Flex-Web-Service-Status ist. Danach klicken Sie auf “Neuen Prüfcode generieren”. Dann öffnet sich ein weiteres Fenster. Hier stellen Sie bitte das Ablaufdatum auf 1 Year ein, klicken auf “Neuen Prüfcode generieren”:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/23-token-generieren.png)

Ein neuer Aktiver Token wird angegeben, welchen wir später im Benutzerkonto der Lineo Finance benötigen. Anschließend bitte “Save” anklicken:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/24-aktiver-token.png)

Achtung: Auch trotz Anklicken von "Save" wird dieses Fenster nicht automatisch verlassen.

## 2. Ändern des Tokens im Lineo Finance Kundenkonto

Nun muss der neu erstellte Token im [Lineo Finance Kundenkonto](https://app.lineo.finance) hinterlegt werden. Dazu melden Sie sich bitte in Ihrem Kundenkonto an:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/25-anmeldung-kundenkonto.png)

Anschließend wählen Sie Ihre Gesellschaft aus

![Anmeldung Interactive Brokers](/assets/images/anleitungen/anbindung/26-gesellschaft-auswaehlen.png)

und gehen bei dem entprechenden Zugang auf "Token aktualisieren":

![Anmeldung Interactive Brokers](/assets/images/anleitungen/verlaengerung-token/01-token-aktualisieren.png)

Hier geben Sie den zuvor erstellten Token ein und bestätigen mit "Erstellen":

![Anmeldung Interactive Brokers](/assets/images/anleitungen/verlaengerung-token/02-token-eingeben.png)

Schon erscheint Ihr verlängerter Zugang in der Liste als neuer Eintrag und der alte Eintrag wird automatisch gelöscht:

![Anmeldung Interactive Brokers](/assets/images/anleitungen/verlaengerung-token/03-verlaengert.png)

Vielen Dank!

Ihr Lineo-Team
