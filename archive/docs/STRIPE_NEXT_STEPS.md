# 🎯 Stripe Setup - What You Need to Do Next

## ⚠️ CRITICAL: You Have Product IDs, But Need Price IDs

You provided:
- Monthly Product ID: `prod_TZwkitF5vtHLjy` ✅
- Yearly Product ID: `prod_TZwlP4UT0spyij` ✅

**BUT:** Stripe checkout needs **Price IDs** (format: `price_xxxxxxxxxxxxx`), not Product IDs!

---

## STEP 1: Create Prices in Stripe Dashboard

### For Monthly Product (`prod_TZwkitF5vtHLjy`):

1. Go to Stripe Dashboard → **Products**
2. Click on "Monthly Premium" (or the product with ID `prod_TZwkitF5vtHLjy`)
3. Click **"Add price"** button (or go to "Pricing" tab)
4. Fill in:
   - **Price:** `9.99`
   - **Billing period:** Select **"Monthly"** (recurring)
   - **Currency:** `USD` (or your currency)
5. Click **"Add price"**
6. **COPY THE PRICE ID** - it will look like: `price_1SRO4dCGeGVZZj1Rxxxxxxxxxx`
   - ⚠️ **This is what you need!**

### For Yearly Product (`prod_TZwlP4UT0spyij`):

1. Go to Stripe Dashboard → **Products**
2. Click on "Yearly Premium" (or the product with ID `prod_TZwlP4UT0spyij`)
3. Click **"Add price"** button
4. Fill in:
   - **Price:** `99.99`
   - **Billing period:** Select **"Yearly"** (recurring)
   - **Currency:** `USD` (or your currency)
5. Click **"Add price"**
6. **COPY THE PRICE ID** - it will look like: `price_1SRO4dCGeGVZZj1Ryyyyyyyyyy`
   - ⚠️ **This is what you need!**

---

## STEP 2: Send Me the Price IDs

Once you have both Price IDs, send them to me in this format:

```
Monthly Price ID: price_xxxxxxxxxxxxx
Yearly Price ID: price_yyyyyyyyyyyy
```

I'll update the code with the correct IDs.

---

## STEP 3: Configure Backend Secrets

### Get Stripe Secret Key:

1. In Stripe Dashboard → **Developers** → **API keys**
2. Make sure you're in **Test mode** (toggle in top right)
3. Copy **Secret key** (starts with `sk_test_`)
4. Set in Fly.io:
   ```bash
   fly secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```

### Set Up Webhook:

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://school-backend.fly.dev/api/payments/webhook`
4. **Description:** "School Platform Payment Webhook"
5. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Click **"Add endpoint"**
7. **Copy the "Signing secret"** (starts with `whsec_`)
8. Set in Fly.io:
   ```bash
   fly secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## STEP 4: Test Payment Flow

### Use Stripe Test Card:

- **Card number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### Test Steps:

1. Go to your site: https://school.6x7.gr
2. Click "Upgrade" or subscription button
3. Should open Stripe Checkout
4. Enter test card details
5. Complete payment
6. Should redirect to: `https://school.6x7.gr?payment=success`
7. Check Stripe Dashboard → **Payments** to see test payment
8. Check Stripe Dashboard → **Webhooks** to see webhook events

---

## STEP 5: Switch to Live Mode (When Ready for Real Payments)

1. In Stripe Dashboard, click **"Switch to live account"** (top right)
2. **Complete account activation** (if not done):
   - Add business information
   - Verify identity
   - Add bank account
3. Get **Live Secret Key:**
   - Go to **Developers** → **API keys**
   - Copy **Live Secret key** (starts with `sk_live_`)
4. Update Fly.io:
   ```bash
   fly secrets set STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```
5. Create **Live Products & Prices** (they're separate from test)
6. Get **Live Price IDs** and update code
7. Create **Live Webhook** with same endpoint URL
8. Get **Live Webhook Secret** and update:
   ```bash
   fly secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## ✅ Quick Checklist

- [ ] Created Monthly price in Stripe
- [ ] Copied Monthly Price ID (`price_xxxxx`)
- [ ] Created Yearly price in Stripe
- [ ] Copied Yearly Price ID (`price_xxxxx`)
- [ ] Sent Price IDs to me (I'll update code)
- [ ] Got Stripe Secret Key
- [ ] Set `STRIPE_SECRET_KEY` in Fly.io
- [ ] Created webhook endpoint
- [ ] Got Webhook Signing Secret
- [ ] Set `STRIPE_WEBHOOK_SECRET` in Fly.io
- [ ] Tested payment with test card
- [ ] Verified webhook receives events
- [ ] Ready for production! 🎉

---

## 🚨 Common Issues & Fixes

**Issue:** "No such price" error
- **Fix:** You're using Product ID instead of Price ID. Get the Price ID from the product's pricing section.

**Issue:** Webhook not receiving events
- **Fix:** 
  - Check webhook URL is correct: `https://school-backend.fly.dev/api/payments/webhook`
  - Check Fly.io logs: `fly logs`
  - Verify webhook secret matches in backend code

**Issue:** Payment succeeds but subscription not activated
- **Fix:** 
  - Check backend webhook handler processes `checkout.session.completed`
  - Check backend logs for errors
  - Verify user email matches in webhook payload

**Issue:** Test mode vs Live mode confusion
- **Fix:** 
  - Always test in test mode first
  - Test mode uses `sk_test_` keys
  - Live mode uses `sk_live_` keys
  - They're completely separate!

---

## 📞 What to Do Right Now

1. **Go to Stripe Dashboard** → Products
2. **Create prices** for both products (Monthly $9.99, Yearly $99.99)
3. **Copy the Price IDs** (they start with `price_`)
4. **Send them to me** and I'll update the code
5. **Set up webhook** (follow STEP 3 above)
6. **Test payment** with test card

**That's it! Once you give me the Price IDs, payments will work! 🚀**
