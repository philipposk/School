# 🚀 Task 2: Deploy Backend - Step by Step

## Goal: Deploy backend server so email confirmation, payments, and reminders work

---

## Choose Your Platform

**Option A: Railway** (Recommended - Easier, no cold starts)  
**Option B: Render** (Free tier available, but has cold starts)

I'll show you **Railway** first (easiest), then Render as alternative.

---

## Option A: Railway Deployment (Recommended)

### Step 1: Create Railway Account

1. **Go to**: https://railway.app
2. **Click**: "Start a New Project"
3. **Sign up** with GitHub (easiest)
4. **Verify** your email

**Time: 5 minutes**

---

### Step 2: Create New Project

1. **In Railway dashboard**, click **"New Project"**
2. **Select**: "Deploy from GitHub repo"
3. **Choose** your `School` repository
4. **Railway auto-detects** Node.js ✅

**Time: 2 minutes**

---

### Step 3: Configure Project

1. **Railway will show** your project
2. **Click** on the service (should be named after your repo)
3. **Go to** "Settings" tab
4. **Set Root Directory** (if needed): Leave empty or set to `/`
5. **Set Start Command**: `node backend-proxy-example.js`
6. **Set Build Command**: `npm install`

**Time: 2 minutes**

---

### Step 4: Add Environment Variables

**This is the MOST IMPORTANT step!**

1. **In Railway**, go to your project → **"Variables"** tab
2. **Click** "New Variable"
3. **Add these ONE BY ONE**:

#### Core Variables (Required):
```
GROQ_API_KEY = your-groq-key-here
OPENAI_API_KEY = your-openai-key-here
RESEND_API_KEY = your-resend-key-here
SUPABASE_URL = https://jmjezmfhygvazfunuujt.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key-here
FRONTEND_URL = https://school.6x7.gr
PORT = 3000
```

#### Stripe Variables (Required for payments):
```
STRIPE_SECRET_KEY = sk_live_...or_sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
STRIPE_MONTHLY_PRICE_ID = price_...
STRIPE_YEARLY_PRICE_ID = price_...
```

#### Optional Messaging (Add if you have keys):
```
TWILIO_ACCOUNT_SID = ...
TWILIO_AUTH_TOKEN = ...
TWILIO_PHONE_NUMBER = +1234567890
FACEBOOK_PAGE_ACCESS_TOKEN = ...
WHATSAPP_PHONE_NUMBER_ID = ...
WHATSAPP_ACCESS_TOKEN = ...
INSTAGRAM_BUSINESS_ACCOUNT_ID = ...
VIBER_AUTH_TOKEN = ...
TELEGRAM_BOT_TOKEN = ...
DISCORD_WEBHOOK_URL = ...
```

**Time: 10-15 minutes** (depends on how many you add)

---

### Step 5: Create Backend File in Root

**Railway needs to find your backend file!**

1. **Check** if `backend-proxy-example.js` is in your repo root
2. **If not**, copy it to root directory:
   ```bash
   cp backend-proxy-example.js /Users/phktistakis/Devoloper\ Projects/School/
   ```
3. **Or create** `server.js` in root with same content

**Time: 2 minutes**

---

### Step 6: Update package.json (If Needed)

**Check** if `package.json` exists in root. If not, create it:

```json
{
  "name": "school-backend",
  "version": "1.0.0",
  "main": "backend-proxy-example.js",
  "scripts": {
    "start": "node backend-proxy-example.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "stripe": "^14.21.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Time: 2 minutes**

---

### Step 7: Deploy

1. **Railway automatically deploys** when you push to GitHub
2. **OR** click **"Deploy"** button in Railway dashboard
3. **Watch** the logs - should see:
   ```
   🚀 Backend Server running on port 3000
   📝 Groq API: ✅ Configured
   📧 Resend Email: ✅ Configured
   💳 Stripe: ✅ Configured
   ```

**Time: 3-5 minutes** (first deploy)

---

### Step 8: Get Your Backend URL

1. **In Railway**, go to your service
2. **Click** "Settings" → "Generate Domain"
3. **Copy** the URL (e.g., `https://school-backend.up.railway.app`)
4. **Save this URL!** You'll need it for frontend

**Time: 1 minute**

---

### Step 9: Test Backend

**Open terminal and run:**
```bash
curl https://your-backend-url.railway.app/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2024-01-09T..."}
```

**If it works**: ✅ Backend is live!

**Time: 2 minutes**

---

## Option B: Render Deployment (Alternative)

### Step 1: Create Render Account

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **Verify** email

**Time: 5 minutes**

---

### Step 2: Create Web Service

1. **Click**: "New" → "Web Service"
2. **Connect** your GitHub repository
3. **Select** your `School` repo
4. **Settings**:
   - **Name**: `school-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node backend-proxy-example.js`
   - **Root Directory**: `/` (or leave empty)

**Time: 5 minutes**

---

### Step 3: Add Environment Variables

**Same as Railway** - go to "Environment" tab and add all variables.

**Time: 10-15 minutes**

---

### Step 4: Deploy

1. **Click**: "Create Web Service"
2. **Render** will deploy automatically
3. **Wait** for deployment (5-10 minutes first time)
4. **Get URL**: `https://school-backend.onrender.com`

**Time: 10 minutes**

---

## ✅ After Deployment

### Step 10: Update Frontend with Backend URL

**Option A: Via Settings UI**
1. Open your site
2. Click Settings (⚙️ icon)
3. Find "Backend Configuration"
4. Enter your backend URL: `https://your-backend.railway.app`
5. Click Save

**Option B: Via Browser Console**
```javascript
localStorage.setItem('backend_url', 'https://your-backend.railway.app');
```

**Option C: Direct in Code** (if you want it hardcoded)
Find where backend URL is used and update it.

---

### Step 11: Test Email Confirmation

1. **Open** your site
2. **Sign up** with email/password
3. **Check** your email for confirmation code
4. **Enter code** → Should verify and create account

**If it works**: ✅ Email confirmation is working!

---

## 🐛 Troubleshooting

### Backend Not Starting?
- **Check logs** in Railway/Render dashboard
- **Verify** `package.json` exists
- **Check** start command is correct
- **Verify** Node.js version (needs 18+)

### Environment Variables Not Working?
- **Check** variable names are EXACT (case-sensitive)
- **Verify** no extra spaces
- **Check** values are correct
- **Redeploy** after adding variables

### Health Endpoint Not Working?
- **Check** backend is running (look at logs)
- **Verify** URL is correct
- **Check** CORS is enabled (should be in code)

### Email Not Sending?
- **Verify** `RESEND_API_KEY` is set
- **Check** Resend dashboard for errors
- **Verify** backend URL is set in frontend

---

## 📋 Checklist

- [ ] Railway/Render account created
- [ ] Project created and connected to GitHub
- [ ] Backend file in root directory
- [ ] `package.json` exists with dependencies
- [ ] All environment variables added
- [ ] Backend deployed successfully
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Backend URL added to frontend
- [ ] Email confirmation tested and working

---

## ⏱️ Time Estimate

- **Railway**: 30-45 minutes (first time)
- **Render**: 45-60 minutes (first time)
- **Subsequent deploys**: 5-10 minutes

---

## 🎯 What This Enables

After backend is deployed:
- ✅ Email confirmation codes will send
- ✅ Payments will work (Stripe)
- ✅ Reminders will send notifications
- ✅ AI features will use backend proxy
- ✅ All API endpoints will work

---

## 📚 Next Steps

Once backend is deployed:
- **Task 3**: Configure Supabase OAuth (Google, Facebook, Apple)
- **Task 4**: Set up Stripe products & webhook
- **Task 5**: Test everything

---

**Ready to deploy? Follow the steps above!** 🚀

