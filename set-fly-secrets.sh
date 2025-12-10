#!/bin/bash
# Script to set Fly.io secrets for School Backend
# Run this after filling in your actual API keys

echo "Setting Fly.io secrets..."
echo ""

# Essential secrets (REQUIRED)
flyctl secrets set GROQ_API_KEY="your-groq-key-here"
flyctl secrets set OPENAI_API_KEY="your-openai-key-here"
flyctl secrets set RESEND_API_KEY="your-resend-key-here"
flyctl secrets set SUPABASE_URL="https://jmjezmfhygvazfunuujt.supabase.co"
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
flyctl secrets set FRONTEND_URL="https://school.6x7.gr"
flyctl secrets set PORT="3000"

# Stripe (if you have Stripe set up)
flyctl secrets set STRIPE_SECRET_KEY="sk_..."
flyctl secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
flyctl secrets set STRIPE_MONTHLY_PRICE_ID="price_..."
flyctl secrets set STRIPE_YEARLY_PRICE_ID="price_..."

echo ""
echo "✅ Secrets set! Now run: flyctl deploy"

# Script to set Fly.io secrets for School Backend
# Run this after filling in your actual API keys

echo "Setting Fly.io secrets..."
echo ""

# Essential secrets (REQUIRED)
flyctl secrets set GROQ_API_KEY="your-groq-key-here"
flyctl secrets set OPENAI_API_KEY="your-openai-key-here"
flyctl secrets set RESEND_API_KEY="your-resend-key-here"
flyctl secrets set SUPABASE_URL="https://jmjezmfhygvazfunuujt.supabase.co"
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
flyctl secrets set FRONTEND_URL="https://school.6x7.gr"
flyctl secrets set PORT="3000"

# Stripe (if you have Stripe set up)
flyctl secrets set STRIPE_SECRET_KEY="sk_..."
flyctl secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
flyctl secrets set STRIPE_MONTHLY_PRICE_ID="price_..."
flyctl secrets set STRIPE_YEARLY_PRICE_ID="price_..."

echo ""
echo "✅ Secrets set! Now run: flyctl deploy"

