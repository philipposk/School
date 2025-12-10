# 🎯 Stripe Setup - Complete Guide

## ⚠️ IMPORTANT: You Have Product IDs, But Need Price IDs

You provided:
- Monthly Product ID: `prod_TZwkitF5vtHLjy`
- Yearly Product ID: `prod_TZwlP4UT0spyij`

**These are Product IDs, not Price IDs!** Stripe needs **Price IDs** (format: `price_xxxxxxxxxxxxx`) for checkout.

---

## STEP 1: Create Prices for Your Products

### In Stripe Dashboard:

1. **Go to Products** → Click on "Monthly Premium" product (`prod_TZwkitF5vtHLjy`)
2. **Click "Add price"** (or "Pricing" tab)
3. **Set up Monthly Price:**
   - Price: `9.99`
   - Billing period: `Monthly (recurring)`
   - Currency: `USD` (or your currency)
   - Click **"Add price"**
   - **COPY THE PRICE ID** (starts with `price_`)

4. **Go to Products** → Click on "Yearly Premium" product (`prod_TZwlP4UT0spyij`)
5. **Click "Add price"**
6. **Set up Yearly Price:**
   - Price: `99.99`
   - Billing period: `Yearly (recurring)`
   - Currency: `USD` (or your currency)
   - Click **"Add price"**
   - **COPY THE PRICE ID** (starts with `price_`)

---

## STEP 2: Update Code with Price IDs

Once you have the Price IDs, I'll update:
- `js/payment-system.js`
- `deploy-to-server/js/payment-system.js`

Replace the placeholder `price_1SRO4dCGeGVZZj1Rmonthly` and `price_1SRO4dCGeGVZZj1Ryearly` with your actual Price IDs.

---

## STEP 3: Configure Backend (Fly.io)

### Get Stripe Secret Key:

1. In Stripe Dashboard → **Developers** → **API keys**
2. Copy **Secret key** (starts with `sk_test_` for test mode, `sk_live_` for live)
3. Set in Fly.io:
   ```bash
   fly secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```

### Set Up Webhook:

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://school-backend.fly.dev/api/payments/webhook`
4. **Select events to listen to:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. **Copy the "Signing secret"** (starts with `whsec_`)
7. Set in Fly.io:
   ```bash
   fly secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## STEP 4: Test Payment Flow

### Test Mode:

1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date (e.g., `12/34`)
3. Any 3-digit CVC (e.g., `123`)
4. Any ZIP code (e.g., `12345`)

### Test the Flow:

1. Go to your site
2. Click "Upgrade" or subscription button
3. Should open Stripe Checkout
4. Enter test card details
5. Complete payment
6. Should redirect back to your site with `?payment=success`
7. Check Stripe Dashboard → **Payments** to see test payment

---

## STEP 5: Switch to Live Mode (When Ready)

1. In Stripe Dashboard, click **"Switch to live account"** (top right)
2. Get **Live Secret Key** (starts with `sk_live_`)
3. Update Fly.io secrets:
   ```bash
   fly secrets set STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```
4. Create **Live webhook** with same endpoint URL
5. Get **Live webhook secret** and update:
   ```bash
   fly secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
6. Update Price IDs in code to **Live Price IDs** (they'll be different from test)

---

## ✅ Checklist

- [ ] Created Monthly price (recurring, $9.99/month)
- [ ] Copied Monthly Price ID (`price_xxxxx`)
- [ ] Created Yearly price (recurring, $99.99/year)
- [ ] Copied Yearly Price ID (`price_xxxxx`)
- [ ] Updated code with Price IDs (I'll do this once you provide them)
- [ ] Set Stripe Secret Key in Fly.io
- [ ] Created webhook endpoint
- [ ] Set Webhook Secret in Fly.io
- [ ] Tested payment flow with test card
- [ ] Verified webhook receives events
- [ ] Tested subscription cancellation
- [ ] Ready to switch to live mode

---

## 🚨 Common Issues

**Issue:** "No such price" error
- **Fix:** Make sure you're using Price ID (`price_xxx`), not Product ID (`prod_xxx`)

**Issue:** Webhook not receiving events
- **Fix:** Check webhook URL is correct, check Fly.io logs, verify webhook secret matches

**Issue:** Payment succeeds but subscription not activated
- **Fix:** Check backend webhook handler is processing `checkout.session.completed` event

**Issue:** Test mode vs Live mode confusion
- **Fix:** Always test in test mode first, then switch to live when ready

---

## 📞 Next Steps

**Once you have the Price IDs:**
1. Send them to me (format: `price_xxxxxxxxxxxxx`)
2. I'll update the code
3. You test the payment flow
4. If it works, you're done! 🎉
