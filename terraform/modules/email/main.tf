# Reference the existing SES domain identity from main infrastructure
data "aws_ses_domain_identity" "lineo" {
  domain = var.domain_name
}

# Verify support email address (used for both sending and receiving)
resource "aws_ses_email_identity" "support_email" {
  email = "support@${var.domain_name}"
}

# SES Configuration Set for tracking
resource "aws_ses_configuration_set" "forms" {
  name = "${replace(var.domain_name, ".", "-")}-forms"
}

# SES Event Configuration for bounce/complaint tracking
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "${replace(var.domain_name, ".", "-")}-forms-events"
  configuration_set_name = aws_ses_configuration_set.forms.name
  enabled                = true
  matching_types         = ["bounce", "complaint", "delivery", "reject"]

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "MessageTag"
    value_source   = "messageTag"
  }
}

# Email templates for form submissions
resource "aws_ses_template" "contact_form" {
  name    = "${replace(var.domain_name, ".", "-")}-contact-form"
  subject = "Neue Kontaktanfrage über {{name}}"
  html    = <<EOF
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Neue Kontaktanfrage</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
      Neue Kontaktanfrage
    </h2>
    
    <table style="width: 100%; margin-top: 20px;">
      <tr>
        <td style="padding: 10px 0;"><strong>Name:</strong></td>
        <td style="padding: 10px 0;">{{name}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>E-Mail:</strong></td>
        <td style="padding: 10px 0;"><a href="mailto:{{email}}">{{email}}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>Telefon:</strong></td>
        <td style="padding: 10px 0;">{{phone}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>Betreff:</strong></td>
        <td style="padding: 10px 0;">{{subject}}</td>
      </tr>
    </table>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #FFD700;">
      <h3 style="margin-top: 0;">Nachricht:</h3>
      <p style="white-space: pre-wrap;">{{message}}</p>
    </div>
    
    <hr style="margin-top: 30px; border: 0; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #666; text-align: center;">
      Diese E-Mail wurde automatisch über das Kontaktformular auf lineo.finance gesendet.
    </p>
  </div>
</body>
</html>
EOF
  text = <<EOF
Neue Kontaktanfrage

Name: {{name}}
E-Mail: {{email}}
Telefon: {{phone}}
Betreff: {{subject}}

Nachricht:
{{message}}

---
Diese E-Mail wurde automatisch über das Kontaktformular auf lineo.finance gesendet.
EOF
}

resource "aws_ses_template" "career_form" {
  name    = "${replace(var.domain_name, ".", "-")}-career-form"
  subject = "Neue Bewerbung: {{position}} - {{name}}"
  html    = <<EOF
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Neue Bewerbung</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
      Neue Bewerbung eingegangen
    </h2>
    
    <table style="width: 100%; margin-top: 20px;">
      <tr>
        <td style="padding: 10px 0;"><strong>Position:</strong></td>
        <td style="padding: 10px 0;">{{position}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>Name:</strong></td>
        <td style="padding: 10px 0;">{{name}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>E-Mail:</strong></td>
        <td style="padding: 10px 0;"><a href="mailto:{{email}}">{{email}}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>Telefon:</strong></td>
        <td style="padding: 10px 0;">{{phone}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0;"><strong>Verfügbarkeit:</strong></td>
        <td style="padding: 10px 0;">{{availability}}</td>
      </tr>
    </table>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #FFD700;">
      <h3 style="margin-top: 0;">Anschreiben:</h3>
      <p style="white-space: pre-wrap;">{{message}}</p>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-left: 4px solid #2196F3;">
      <h3 style="margin-top: 0;">Lebenslauf:</h3>
      <p>Der Lebenslauf wurde als PDF-Datei hochgeladen und kann hier heruntergeladen werden:</p>
      <p><a href="{{cv_url}}" style="color: #2196F3;">{{cv_filename}}</a></p>
    </div>
    
    <hr style="margin-top: 30px; border: 0; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #666; text-align: center;">
      Diese E-Mail wurde automatisch über das Karriereformular auf lineo.finance gesendet.
    </p>
  </div>
</body>
</html>
EOF
  text = <<EOF
Neue Bewerbung eingegangen

Position: {{position}}
Name: {{name}}
E-Mail: {{email}}
Telefon: {{phone}}
Verfügbarkeit: {{availability}}

Anschreiben:
{{message}}

Lebenslauf:
Der Lebenslauf wurde als PDF-Datei hochgeladen und kann hier heruntergeladen werden:
{{cv_url}}
Dateiname: {{cv_filename}}

---
Diese E-Mail wurde automatisch über das Karriereformular auf lineo.finance gesendet.
EOF
}