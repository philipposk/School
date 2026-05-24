# 🚀 Task 2: Deploy Backend - Complete Guide

## What You're Doing
Deploying your backend server so email confirmation, payments, and reminders work.

---

## 📋 Pre-Flight Checklist

Before starting, make sure you have:
- [ ] Railway account (or Render account)
- [ ] GitHub repository with your code
- [ ] All API keys ready (Groq, OpenAI, Resend, Stripe, Supabase)
- [ ] `backend-proxy-example.js` file exists ✅ (Already checked - it exists!)
- [ ] `package.json` exists ✅ (Already checked - it exists!)

---

## 🎯 Step-by-Step: Railway (Recommended)

### STEP 1: Create Railway Account (5 min)

1. **Open**: https://railway.app
2. **Click**: "Start a New Project" (top right)
3. **Choose**: "Login with GitHub"
4. **Authorize** Railway to access your GitHub
5. **Verify** your email if prompted

✅ **Done when**: You see Railway dashboard

---

### STEP 2: Create New Project (2 min)

1. **In Railway dashboard**, click **"New Project"** (big button)
2. **Select**: "Deploy from GitHub repo"
3. **Find** your `School` repository in the list
4. **Click** on it
5. **Railway will**:
   - Detect it's Node.js ✅
   - Start deploying automatically
   - Show you a URL

✅ **Done when**: You see "Deploying..." or "Building..."

---

### STEP 3: Wait for First Deploy (3-5 min)

**Railway will**:
- Install dependencies (`npm install`)
- Try to start the server
- **It will FAIL** (because no env variables yet) - That's OK!

**Watch the logs** - you'll see errors about missing API keys. Normal!

✅ **Done when**: Deployment finishes (even if it failed)

---

### STEP 4: Configure Start Command (1 min)

1. **Click** on your service (the one that's deploying)
2. **Go to** "Settings" tab
3. **Find** "Start Command"
4. **Set it to**: `node backend-proxy-example.js`
5. **Click** "Save"

✅ **Done when**: Start command is saved

---

### STEP 5: Add Environment Variables (15-20 min)

**This is the MOST IMPORTANT step!**

1. **Still in Settings**, go to **"Variables"** tab
2. **Click** "New Variable" button
3. **Add each variable** one by one:

#### Add These Variables:

**Copy and paste each one:**

```
GROQ_API_KEY
```
**Value**: Your Groq API key (starts with `gsk_...`)

```
OPENAI_API_KEY
```
**Value**: Your OpenAI API key (starts with `sk-...`)

```
RESEND_API_KEY
```
**Value**: Your Resend API key (starts with `re_...`)

```
SUPABASE_URL
```
**Value**: `https://jmjezmfhygvazfunuujt.supabase.co`

```
SUPABASE_SERVICE_ROLE_KEY
```
**Value**: Your Supabase service role key (get from Supabase Dashboard → Settings → API)

```
STRIPE_SECRET_KEY
```
**Value**: Your Stripe secret key (starts with `sk_live_...` or `sk_test_...`)

```
STRIPE_WEBHOOK_SECRET
```
**Value**: Your Stripe webhook secret (starts with `whsec_...`) - Get this after setting up webhook

```
STRIPE_MONTHLY_PRICE_ID
```
**Value**: Your monthly price ID (starts with `price_...`) - Create in Stripe Dashboard

```
STRIPE_YEARLY_PRICE_ID
```
**Value**: Your yearly price ID (starts with `price_...`) - Create in Stripe Dashboard

```
FRONTEND_URL
```
**Value**: `https://school.6x7.gr`

```
PORT
```
**Value**: `3000`

**For each variable:**
- Click "New Variable"
- Paste the name (left side)
- Paste the value (right side)
- Click "Add"

✅ **Done when**: All variables are added (you'll see them listed)

---

### STEP 6: Redeploy (2 min)

1. **After adding variables**, Railway will **auto-redeploy**
2. **OR** click **"Redeploy"** button
3. **Watch logs** - should see:
   ```
   🚀 Backend Server running on port 3000
   📝 Groq API: ✅ Configured
   📝 OpenAI API: ✅ Configured
   📧 Resend Email: ✅ Configured
   💳 Stripe: ✅ Configured
   🗄️  Supabase: ✅ Configured
   ```

✅ **Done when**: Logs show "Backend Server running" with ✅ marks

---

### STEP 7: Get Your Backend URL (1 min)

1. **In Railway**, go to your service
2. **Click** "Settings" tab
3. **Find** "Generate Domain" button
4. **Click** it (if not already generated)
5. **Copy** the URL (e.g., `https://school-backend-production.up.railway.app`)

**Save this URL!** You'll need it.

✅ **Done when**: You have a URL like `https://xxx.up.railway.app`

---

### STEP 8: Test Backend (2 min)

**Open terminal** and run:
```bash
curl https://your-backend-url.up.railway.app/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2024-01-09T12:34:56.789Z"}
```

**If you see that**: ✅ **Backend is working!**

**If you get an error**: Check logs in Railway dashboard

---

### STEP 9: Add Backend URL to Frontend (2 min)

**Option A: Via Browser Console** (Easiest)
1. **Open** your site: `http://localhost:8001`
2. **Open** browser console (F12 or Cmd+Option+I)
3. **Type**:
   ```javascript
   localStorage.setItem('backend_url', 'https://your-backend-url.up.railway.app');
   ```
4. **Press Enter**
5. **Refresh** page

**Option B: Via Settings UI**
1. **Open** your site
2. **Click** Settings (⚙️ icon)
3. **Find** "Backend Configuration"
4. **Enter** your backend URL
5. **Click** Save

✅ **Done when**: Backend URL is saved

---

### STEP 10: Test Email Confirmation (5 min)

1. **Open** your site
2. **Click** "Sign In" → "Sign up"
3. **Enter**:
   - Name: Test User
   - Email: **Your real email**
   - Password: test123456
4. **Click** "Create Account"
5. **Should show**: "Check Your Email" form
6. **Check your email** for 6-digit code
7. **Enter code** → Should verify and log you in

**If it works**: ✅ **Email confirmation is working!**

**If code doesn't arrive**: 
- Check Railway logs for errors
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard

---

## 🎉 Success Checklist

- [ ] Railway account created
- [ ] Project deployed from GitHub
- [ ] All environment variables added
- [ ] Backend shows ✅ in logs
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Backend URL added to frontend
- [ ] Email confirmation code received
- [ ] Account created successfully

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module 'express'"
**Fix**: Make sure `package.json` is in root directory ✅ (It is!)

### Issue: "Backend Server running" but health check fails
**Fix**: 
- Check Railway gave you a domain
- Verify URL is correct
- Check CORS is enabled (it is in code)

### Issue: Email not sending
**Fix**:
- Check `RESEND_API_KEY` is correct
- Verify backend URL is set in frontend
- Check Railway logs for errors

### Issue: Variables not working
**Fix**:
- Check variable names are EXACT (case-sensitive)
- No extra spaces
- Redeploy after adding variables

---

## ⏱️ Time Estimate

- **First time**: 30-45 minutes
- **If you have all keys ready**: 20-30 minutes
- **Subsequent deploys**: 5 minutes

---

## 📚 What's Next?

After backend is deployed:
- ✅ Email confirmation will work
- ✅ Payments will work (after Stripe setup)
- ✅ Reminders will send notifications
- ✅ AI features will use backend

**Next Task**: Configure Supabase OAuth (Task 3)

---

## 🎯 Quick Reference

**Railway Dashboard**: https://railway.app  
**Your Backend URL**: `https://xxx.up.railway.app`  
**Health Check**: `curl https://your-url/health`  
**Frontend Setting**: `localStorage.setItem('backend_url', 'your-url')`

---

**Ready to deploy? Follow the steps above!** 🚀

