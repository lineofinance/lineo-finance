# SES Setup and Sandbox Exit Guide

## Current Status: SES Sandbox Mode

Your AWS account is currently in SES Sandbox mode, which has these limitations:
- Can only send to **verified** email addresses
- Maximum 200 emails/day (1 email/second)
- Cannot send to arbitrary email addresses

## Email Verification Required

### Emails that need verification:
1. **support@lineo.finance** - Primary recipient for all forms
2. **noreply@lineo.finance** - Sender address for notifications

### How to verify emails:

1. **Deploy the Terraform configuration:**
```bash
cd terraform
terraform apply
```

2. **Check verification emails:**
   - AWS will send verification emails to:
     - support@lineo.finance
     - noreply@lineo.finance
   - Click the verification links within 24 hours

3. **Verify status:**
```bash
aws ses list-verified-email-addresses --region eu-central-1
```

## Testing in Sandbox Mode

While in sandbox, you can test with these already verified emails:
- sebastian.stuecker@lineo.finance
- catrin.stuecker@lineo.finance

To temporarily test with these, update `terraform.tfvars`:
```hcl
contact_email_recipients = ["sebastian.stuecker@lineo.finance"]
career_email_recipients  = ["catrin.stuecker@lineo.finance"]
```

## Exiting SES Sandbox (Production)

To send emails to any address (like website visitors), you must exit sandbox:

### Prerequisites:
1. ✅ Domain verified (lineo.finance - already done)
2. ✅ DKIM configured (already done)
3. ✅ SPF record configured (already done)
4. ⏳ Email sending templates created (done via Terraform)
5. ⏳ Bounce/complaint handling configured (done via Terraform)

### Request Production Access:

1. **Go to AWS Console** → SES → Account dashboard
2. Click **"Request production access"**
3. Fill the form:
   - **Mail Type**: Transactional
   - **Website URL**: https://www.lineo.finance
   - **Use Case**: 
     ```
     Automated form submissions from our company website. 
     Contact forms and job application forms that send 
     notifications to our support team.
     ```
   - **Additional Contacts**: No (only sending to your own verified addresses)
   - **Compliance**: Yes to all compliance questions
   - **Expected Volume**: 100-500 emails/month

4. **Review typically takes 24-48 hours**

### What happens after approval:
- Sending quota increases to 50,000 emails/day
- Can send to any email address
- Rate limit increases to 14 emails/second
- No changes needed to your code

## Important Notes

### Email Flow:
```
Website Visitor → Fills Form → Lambda Function → SES → support@lineo.finance
                                                     ↓
                                              (Must be verified)
```

### Domain vs Email Verification:
- **Domain verification** (lineo.finance): Allows you to send FROM any address @lineo.finance
- **Email verification** (support@lineo.finance): Required to send TO this address in sandbox
- After exiting sandbox: Only FROM addresses need verification

### Current Issues to Fix:

In the main infrastructure (`../../finatus/terraform/infra/ses.tf`):
- Line 6: Wrong zone_id reference (uses finatus_de instead of lineo_finance)
- This should be fixed to properly verify the domain

## Testing Checklist

Before going live:

- [ ] Verify support@lineo.finance email
- [ ] Verify noreply@lineo.finance email  
- [ ] Test contact form with verified email
- [ ] Test career form with PDF upload
- [ ] Verify emails are received
- [ ] Request SES production access
- [ ] Wait for approval (24-48 hours)
- [ ] Test with real email addresses after approval

## Troubleshooting

### Email not received:
1. Check if email is verified: `aws ses list-verified-email-addresses`
2. Check CloudWatch logs for Lambda errors
3. Check SES sending statistics in AWS Console
4. Ensure you're not hitting sandbox limits

### Verification email not received:
1. Check spam folder
2. Ensure support@lineo.finance mailbox exists and is accessible
3. Request new verification email via AWS Console

### After production approval:
- Monitor bounce/complaint rates (must stay under 5% bounce, 0.1% complaint)
- Set up CloudWatch alarms for high bounce rates
- Consider implementing email validation in forms