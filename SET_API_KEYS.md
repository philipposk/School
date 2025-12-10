# 🔑 Set Your API Keys for Fly.io

Run these commands one by one, replacing the values with your actual API keys:

## Essential API Keys

```bash
# Groq API Key
flyctl secrets set GROQ_API_KEY="your-actual-groq-key"

# OpenAI API Key  
flyctl secrets set OPENAI_API_KEY="your-actual-openai-key"

# Resend Email API Key
flyctl secrets set RESEND_API_KEY="your-actual-resend-key"

# Supabase Service Role Key
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"
```

## Stripe Keys (if you have Stripe set up)

```bash
# Stripe Secret Key
flyctl secrets set STRIPE_SECRET_KEY="sk_live_..."

# Stripe Webhook Secret
flyctl secrets set STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs
flyctl secrets set STRIPE_MONTHLY_PRICE_ID="price_..."
flyctl secrets set STRIPE_YEARLY_PRICE_ID="price_..."
```

## After Setting Keys

Once all keys are set, deploy:
```bash
flyctl deploy
```


Run these commands one by one, replacing the values with your actual API keys:

## Essential API Keys

```bash
# Groq API Key
flyctl secrets set GROQ_API_KEY="your-actual-groq-key"

# OpenAI API Key  
flyctl secrets set OPENAI_API_KEY="your-actual-openai-key"

# Resend Email API Key
flyctl secrets set RESEND_API_KEY="your-actual-resend-key"

# Supabase Service Role Key
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"
```

## Stripe Keys (if you have Stripe set up)

```bash
# Stripe Secret Key
flyctl secrets set STRIPE_SECRET_KEY="sk_live_..."

# Stripe Webhook Secret
flyctl secrets set STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs
flyctl secrets set STRIPE_MONTHLY_PRICE_ID="price_..."
flyctl secrets set STRIPE_YEARLY_PRICE_ID="price_..."
```

## After Setting Keys

Once all keys are set, deploy:
```bash
flyctl deploy
```

