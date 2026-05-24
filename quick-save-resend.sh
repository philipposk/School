#!/bin/bash
# Quick script to save Resend API key to Fly.io

echo "🔑 Resend API Key Setup"
echo ""
echo "Paste your Resend API key (starts with re_):"
read -r RESEND_KEY

if [[ -z "$RESEND_KEY" ]]; then
    echo "❌ No key provided"
    exit 1
fi

if [[ ! "$RESEND_KEY" =~ ^re_ ]]; then
    echo "⚠️  Warning: Resend keys usually start with 're_'"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🚀 Setting Resend API key in Fly.io..."
flyctl secrets set RESEND_API_KEY="$RESEND_KEY" -a school-backend

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Key saved successfully!"
    echo ""
    echo "🧪 Testing email endpoint..."
    curl -s -X POST https://school-backend.fly.dev/api/notifications/email \
      -H "Content-Type: application/json" \
      -d '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}' | head -5
    
    echo ""
    echo "✅ Done! Your Resend key is now configured."
else
    echo "❌ Failed to set key. Make sure flyctl is installed and you're logged in."
fi

