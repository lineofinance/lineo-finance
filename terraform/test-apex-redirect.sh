#!/bin/bash

# Test apex domain redirect functionality
# This script validates that lineo.finance properly redirects to www.lineo.finance

set -e

APEX_DOMAIN="lineo.finance"
WWW_DOMAIN="www.lineo.finance"

echo "🧪 Testing apex domain redirect functionality..."
echo ""

# Test HTTP redirect
echo "📡 Testing HTTP redirect: http://$APEX_DOMAIN"
HTTP_RESULT=$(curl -sI "http://$APEX_DOMAIN" | head -n 10)
echo "$HTTP_RESULT"

# Check for 301 redirect
if echo "$HTTP_RESULT" | grep -q "301"; then
    echo "✅ HTTP 301 redirect detected"
else
    echo "❌ No HTTP 301 redirect found"
fi

echo ""

# Test HTTPS redirect
echo "🔒 Testing HTTPS redirect: https://$APEX_DOMAIN"
HTTPS_RESULT=$(curl -sI "https://$APEX_DOMAIN" | head -n 10)
echo "$HTTPS_RESULT"

# Check for 301 redirect to www
if echo "$HTTPS_RESULT" | grep -q "301" && echo "$HTTPS_RESULT" | grep -q "$WWW_DOMAIN"; then
    echo "✅ HTTPS 301 redirect to www domain detected"
else
    echo "❌ No HTTPS 301 redirect to www domain found"
fi

echo ""

# Test final destination
echo "🎯 Testing final destination: https://$WWW_DOMAIN"
WWW_RESULT=$(curl -sI "https://$WWW_DOMAIN" | head -n 5)
echo "$WWW_RESULT"

if echo "$WWW_RESULT" | grep -q "200"; then
    echo "✅ WWW domain returns 200 OK"
else
    echo "❌ WWW domain does not return 200 OK"
fi

echo ""

# DNS propagation check
echo "🌐 Checking DNS propagation for apex domain..."
DIG_RESULT=$(dig +short A "$APEX_DOMAIN")
if [ -n "$DIG_RESULT" ]; then
    echo "✅ DNS A record found for $APEX_DOMAIN: $DIG_RESULT"
else
    echo "❌ No DNS A record found for $APEX_DOMAIN (may still be propagating)"
fi

echo ""
echo "🏁 Redirect test completed!"
echo ""
echo "💡 If tests fail:"
echo "1. Wait 5-15 minutes for DNS propagation"
echo "2. Check CloudFront distribution status in AWS Console"
echo "3. Verify certificate includes both domains"