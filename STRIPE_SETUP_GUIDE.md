# 💳 Stripe Payment Setup Guide

## Using Your Existing Stripe Account

Since you already have a Stripe account from another project, here's how to set it up for School Platform.

---

## Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com
2. Log in to your existing account
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** (starts with `pk_...`) - for frontend
   - **Secret key** (starts with `sk_...`) - for backend (KEEP SECRET!)

---

## Step 2: Create Subscription Products & Prices

### Option A: Using Stripe Dashboard (Easiest)

1. Go to **Products** → **Add product**
2. Create **Monthly Premium**:
   - Name: "Monthly Premium"
   - Pricing: Recurring
   - Price: $9.99 USD
   - Billing period: Monthly
   - Copy the **Price ID** (starts with `price_...`)

3. Create **Yearly Premium**:
   - Name: "Yearly Premium"
   - Pricing: Recurring
   - Price: $99.99 USD
   - Billing period: Yearly
   - Copy the **Price ID** (starts with `price_...`)

### Option B: Using Stripe API

```bash
# Create Monthly Price
curl https://api.stripe.com/v1/prices \
  -u sk_YOUR_SECRET_KEY: \
  -d "product_data[name]=Monthly Premium" \
  -d "unit_amount=999" \
  -d "currency=usd" \
  -d "recurring[interval]=month"

# Create Yearly Price
curl https://api.stripe.com/v1/prices \
  -u sk_YOUR_SECRET_KEY: \
  -d "product_data[name]=Yearly Premium" \
  -d "unit_amount=9999" \
  -d "currency=usd" \
  -d "recurring[interval]=year"
```

---

## Step 3: Set Up Webhook (For Subscription Events)

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-backend.railway.app/api/payments/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing secret** (starts with `whsec_...`)

---

## Step 4: Add Keys to Backend Environment Variables

Add to Railway/Render environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_...your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_...your-webhook-secret
STRIPE_MONTHLY_PRICE_ID=price_...your-monthly-price-id
STRIPE_YEARLY_PRICE_ID=price_...your-yearly-price-id
```

---

## Step 5: Install Stripe Package in Backend

In your backend directory, run:

```bash
npm install stripe
```

Then update `backend-proxy-example.js` to uncomment Stripe initialization:

```javascript
const Stripe = require('stripe');
const stripe = new Stripe(STRIPE_SECRET_KEY);
```

---

## Step 6: Update Frontend Payment Manager

Update `js/payment-system.js` with your actual price IDs:

```javascript
plans: {
    monthly: {
        id: 'monthly',
        name: 'Monthly Premium',
        price: 9.99,
        interval: 'month',
        stripePriceId: 'price_YOUR_MONTHLY_PRICE_ID', // Replace with actual
        features: ['All courses', 'AI tutor', 'Certificates', 'Priority support']
    },
    yearly: {
        id: 'yearly',
        name: 'Yearly Premium',
        price: 99.99,
        interval: 'year',
        stripePriceId: 'price_YOUR_YEARLY_PRICE_ID', // Replace with actual
        features: ['All courses', 'AI tutor', 'Certificates', 'Priority support', 'Save 17%']
    }
}
```

---

## Step 7: Test with Stripe Test Mode

1. Use **Test mode** keys (starts with `sk_test_...` and `pk_test_...`)
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any CVC
5. Any ZIP code

---

## Environment Variables Summary

### Backend (Railway/Render):
```bash
STRIPE_SECRET_KEY=sk_live_...or_sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
```

### Frontend (Optional - if using Stripe.js directly):
```javascript
// In payment-system.js, update price IDs
stripePriceId: 'price_YOUR_ACTUAL_PRICE_ID'
```

---

## Testing Checklist

- [ ] Test monthly subscription checkout
- [ ] Test yearly subscription checkout
- [ ] Verify webhook receives events
- [ ] Test subscription cancellation
- [ ] Test payment success redirect
- [ ] Test payment cancel redirect
- [ ] Verify subscription status updates

---

## Common Issues

### "Stripe module not installed"
- Run: `npm install stripe` in backend directory

### "Invalid API key"
- Check you're using the correct key (test vs live)
- Ensure key starts with `sk_...`

### "Price not found"
- Verify price IDs are correct
- Check prices exist in your Stripe dashboard

### "Webhook signature verification failed"
- Ensure webhook secret is correct
- Check webhook URL is accessible
- Verify webhook endpoint uses `express.raw()` middleware

---

## Production Checklist

- [ ] Switch to **Live mode** keys
- [ ] Update price IDs to live prices
- [ ] Set up webhook endpoint
- [ ] Test with real card (small amount)
- [ ] Set up email notifications for payments
- [ ] Monitor Stripe dashboard for payments

---

## Stripe Dashboard Links

- **Dashboard**: https://dashboard.stripe.com
- **API Keys**: https://dashboard.stripe.com/apikeys
- **Products**: https://dashboard.stripe.com/products
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Payments**: https://dashboard.stripe.com/payments

---

**Your Stripe account is ready! Just add the keys to your backend environment variables.** 🚀

