# 🎯 YOUR ACTION STEPS - Follow One by One

## ⚠️ IMPORTANT: Read this first
I've built everything. Now you need to do these steps to make it live. Each step is simple - just follow the numbers.

---

## STEP 1: Deploy New Files to GitHub ⚠️ CRITICAL

**What:** Copy new files to deploy folder and push to GitHub

**How:**
1. Open Terminal (or Command Prompt)
2. Go to your project folder:
   ```bash
   cd "/Users/phktistakis/Devoloper Projects/School"
   ```
3. Copy new files to deploy folder:
   ```bash
   cp about.html deploy-to-server/
   cp pedagogy.html deploy-to-server/
   cp community.html deploy-to-server/
   cp js/search-system.js deploy-to-server/js/
   cp js/analytics.js deploy-to-server/js/
   cp js/flashcards.js deploy-to-server/js/
   cp js/onboarding.js deploy-to-server/js/
   cp js/learner-analytics.js deploy-to-server/js/
   ```
4. Update deploy-to-server/index.html - add navigation links:
   - Open `deploy-to-server/index.html` in your editor
   - Find the header section (around line 1690)
   - Find this code:
     ```html
     <div class="header-right">
         <button class="header-btn" onclick="openAISearch()"...
     ```
   - Add these 3 lines BEFORE the buttons:
     ```html
     <a href="about.html" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 8px; margin-right: 0.5rem;">About</a>
     <a href="pedagogy.html" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 8px; margin-right: 0.5rem;">How We Teach</a>
     <a href="community.html" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 8px; margin-right: 0.5rem;">Community</a>
     ```
5. Add new script tags to deploy-to-server/index.html:
   - Find where scripts are loaded (around line 1710)
   - Find: `<script src="js/payment-system.js"></script>`
   - Add these lines AFTER it:
     ```html
     <script src="js/search-system.js"></script>
     <script src="js/analytics.js"></script>
     <script src="js/flashcards.js"></script>
     <script src="js/onboarding.js"></script>
     <script src="js/learner-analytics.js"></script>
     ```
6. Commit and push:
   ```bash
   git add .
   git commit -m "Add About, Pedagogy, Community pages and new features"
   git push origin main
   ```
7. Wait 2-3 minutes for GitHub Pages to rebuild

**✅ Check:** Visit https://school.6x7.gr/about.html - should show About page

---

## STEP 2: Set Google Analytics ID ⚠️ CRITICAL

**What:** Replace placeholder with your real Google Analytics ID

**How:**
1. Go to https://analytics.google.com/
2. Sign in with your Google account
3. Click "Admin" (bottom left)
4. Click "Create Property" (if you don't have one)
5. Enter property name: "School Learning Platform"
6. Click "Create"
7. Copy your "Measurement ID" (looks like: `G-XXXXXXXXXX`)
8. Open `index.html` in your editor
9. Find line ~11 that says: `gtag('config', 'GA_MEASUREMENT_ID', {`
10. Replace `'GA_MEASUREMENT_ID'` with your actual ID (keep the quotes):
    ```javascript
    gtag('config', 'G-XXXXXXXXXX', {
    ```
11. Do the same in `deploy-to-server/index.html`
12. Also find line ~10: `<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>`
13. Replace `GA_MEASUREMENT_ID` with your ID:
    ```html
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    ```
14. Commit and push:
    ```bash
    git add index.html deploy-to-server/index.html
    git commit -m "Add Google Analytics ID"
    git push origin main
    ```

**✅ Check:** Open your site, open browser DevTools (F12), go to Network tab, refresh page. You should see requests to `googletagmanager.com`

---

## STEP 3: Test All New Pages ⚠️ IMPORTANT

**What:** Verify all new pages work on live site

**How:**
1. Visit https://school.6x7.gr/about.html
   - ✅ Should show About Us page with mission, team, values
   - ❌ If 404: Wait 2 more minutes, GitHub Pages might still building

2. Visit https://school.6x7.gr/pedagogy.html
   - ✅ Should show "How We Teach" page with pedagogical methods
   - ❌ If 404: Check if file exists in deploy-to-server folder

3. Visit https://school.6x7.gr/community.html
   - ✅ Should show Community page with forum discussions
   - ❌ If 404: Check if file was copied correctly

4. Visit https://school.6x7.gr (main page)
   - ✅ Click "About" link in header - should go to about.html
   - ✅ Click "How We Teach" link - should go to pedagogy.html
   - ✅ Click "Community" link - should go to community.html

**If any page shows 404:**
- Check if file exists in `deploy-to-server/` folder
- Re-run the copy commands from STEP 1
- Wait 2-3 minutes after pushing

---

## STEP 4: Set Up Stripe (If Using Payments) ⚠️ OPTIONAL BUT RECOMMENDED

**What:** Configure real Stripe payment IDs

**How:**
1. Go to https://dashboard.stripe.com/
2. Sign in or create account
3. Go to "Products" → "Add Product"
4. Create "Monthly Premium" product:
   - Name: "Monthly Premium"
   - Price: $9.99
   - Billing period: Monthly
   - Click "Save"
   - Copy the "Price ID" (looks like: `price_xxxxxxxxxxxxx`)
5. Create "Yearly Premium" product:
   - Name: "Yearly Premium"
   - Price: $99.99
   - Billing period: Yearly
   - Click "Save"
   - Copy the "Price ID"
6. Open `js/payment-system.js` in your editor
7. Find line 19: `stripePriceId: (typeof process !== 'undefined' && process.env && process.env.STRIPE_MONTHLY_PRICE_ID) || 'price_monthly',`
8. Replace `'price_monthly'` with your actual monthly price ID:
   ```javascript
   stripePriceId: (typeof process !== 'undefined' && process.env && process.env.STRIPE_MONTHLY_PRICE_ID) || 'price_xxxxxxxxxxxxx',
   ```
9. Find line 27: `stripePriceId: (typeof process !== 'undefined' && process.env && process.env.STRIPE_YEARLY_PRICE_ID) || 'price_yearly',`
10. Replace `'price_yearly'` with your actual yearly price ID
11. Do the same in `deploy-to-server/js/payment-system.js`
12. Get Stripe Secret Key:
    - In Stripe Dashboard, go to "Developers" → "API keys"
    - Copy "Secret key" (starts with `sk_test_` or `sk_live_`)
13. Set in your backend (Fly.io):
    ```bash
    fly secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
    ```
14. Configure webhook:
    - In Stripe Dashboard, go to "Developers" → "Webhooks"
    - Click "Add endpoint"
    - URL: `https://school-backend.fly.dev/api/payments/webhook`
    - Select events: `checkout.session.completed`, `customer.subscription.updated`
    - Click "Add endpoint"
    - Copy webhook signing secret
    - Set in backend: `fly secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`
15. Commit and push:
    ```bash
    git add js/payment-system.js deploy-to-server/js/payment-system.js
    git commit -m "Add Stripe price IDs"
    git push origin main
    ```

**✅ Check:** Try to upgrade to premium plan, should open Stripe checkout

---

## STEP 5: Configure OAuth (OR Hide Buttons) ⚠️ IMPORTANT

**What:** Set up Google/Facebook/Apple sign-in OR hide buttons if not ready

### Option A: Set Up OAuth (Recommended)

**Google OAuth:**
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: `https://school.6x7.gr`
7. Copy "Client ID"
8. Update in your auth code (find where Google OAuth is configured)

**Facebook OAuth:**
1. Go to https://developers.facebook.com/
2. Create new app
3. Add "Facebook Login" product
4. Get App ID
5. Update in your auth code

**Apple Sign In:**
1. Go to https://developer.apple.com/
2. Configure Sign in with Apple
3. Get Service ID
4. Update in your auth code

### Option B: Hide OAuth Buttons (Easier for now)

1. Open `index.html` in editor
2. Find sign-in form (search for "Sign in with Google")
3. Comment out or remove OAuth buttons:
   ```html
   <!--
   <button onclick="signInWithGoogle()">Sign in with Google</button>
   <button onclick="signInWithFacebook()">Sign in with Facebook</button>
   <button onclick="signInWithApple()">Sign in with Apple</button>
   -->
   ```
4. Do same in `deploy-to-server/index.html`
5. Commit and push

**✅ Check:** Sign-in page should only show email/password (or OAuth buttons work)

---

## STEP 6: Verify Content Assets ⚠️ IMPORTANT

**What:** Make sure all videos, PDFs, images load correctly

**How:**
1. Go through each course on your live site
2. For each module:
   - ✅ Check if videos play (if you have videos)
   - ✅ Check if PDF download links work
   - ✅ Check if images load
   - ✅ Check if quiz questions display
3. If something is broken:
   - Check the file path in the course data
   - Verify file exists on server
   - Fix path and redeploy

**✅ Check:** All course content loads without errors

---

## STEP 7: Test New Features ⚠️ IMPORTANT

**What:** Verify all new features work

**How:**
1. **Test Search:**
   - Type something in search (if search UI is visible)
   - Should show results
   - ✅ Works / ❌ Doesn't work

2. **Test Onboarding:**
   - Open browser console (F12)
   - Run: `localStorage.removeItem('onboarding_completed')`
   - Refresh page
   - Should show onboarding wizard
   - Complete it
   - ✅ Works / ❌ Doesn't work

3. **Test Community Forum:**
   - Go to https://school.6x7.gr/community.html
   - Try to create a new post (if signed in)
   - ✅ Works / ❌ Doesn't work

4. **Test Analytics Dashboard:**
   - Complete a module
   - Check if analytics data appears (if dashboard is accessible)
   - ✅ Works / ❌ Doesn't work

5. **Test Certificate Sharing:**
   - Earn a certificate (complete a course)
   - Click LinkedIn share button
   - Click Twitter share button
   - ✅ Works / ❌ Doesn't work

**✅ Check:** All features work or note which ones need fixing

---

## STEP 8: Run Test Suite ⚠️ IMPORTANT

**What:** Verify all automated tests still pass

**How:**
1. Open Terminal
2. Go to project folder:
   ```bash
   cd "/Users/phktistakis/Devoloper Projects/School"
   ```
3. Run tests:
   ```bash
   npm run test:features
   ```
4. Should show: `Passed: 48, Failed: 0`
5. If any fail, note which ones

**✅ Check:** Tests pass (48/48) or note failures

---

## STEP 9: Final Verification ⚠️ CRITICAL

**What:** Do a final check before considering it done

**Checklist:**
- [ ] All new pages load (About, Pedagogy, Community)
- [ ] Navigation links work in header
- [ ] Google Analytics ID is set (check Network tab)
- [ ] Stripe is configured (if using payments)
- [ ] OAuth works OR buttons are hidden
- [ ] All course content loads
- [ ] No console errors on main page
- [ ] Test suite passes (48/48)
- [ ] Site works on mobile (check on phone)

**✅ Check:** Everything works or note what's broken

---

## 🎉 DONE!

If all steps above are complete, your platform is **production-ready**!

---

## ❓ Troubleshooting

**Problem:** Pages show 404
- **Fix:** Wait 2-3 minutes after pushing, GitHub Pages needs time to rebuild

**Problem:** Scripts not loading
- **Fix:** Check if files exist in `deploy-to-server/js/` folder

**Problem:** Google Analytics not working
- **Fix:** Check if ID is correct (should start with `G-`)

**Problem:** Stripe checkout not working
- **Fix:** Check if price IDs are correct, check backend logs

**Problem:** OAuth buttons don't work
- **Fix:** Either configure OAuth properly or hide buttons (see STEP 5)

---

## 📞 Need Help?

If something doesn't work:
1. Check browser console for errors (F12 → Console tab)
2. Check Network tab to see if files load
3. Check if files exist in `deploy-to-server/` folder
4. Try waiting 2-3 minutes after pushing to GitHub

---

**That's it! Follow these steps one by one and you're done! 🚀**
