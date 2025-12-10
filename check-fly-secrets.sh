#!/bin/bash
# Script to check Fly.io secrets for Resend API key

echo "🔍 Checking Fly.io secrets for RESEND_API_KEY..."
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl not found. Install it from: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# List all secrets
echo "📋 All secrets for school-backend:"
flyctl secrets list -a school-backend 2>/dev/null | grep -i resend || echo "⚠️ RESEND_API_KEY not found in secrets"

echo ""
echo "💡 To set it if missing:"
echo "   flyctl secrets set RESEND_API_KEY=\"your-key-here\" -a school-backend"
echo ""
echo "💡 To view all secrets (values hidden for security):"
echo "   flyctl secrets list -a school-backend"
