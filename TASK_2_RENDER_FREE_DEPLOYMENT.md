# 🆓 Task 2: Deploy Backend on Render (FREE Forever!)

## Why Render Free?

- ✅ **FREE FOREVER** - No payment, no trial expiration
- ✅ **Same code** - Works exactly the same
- ⚠️ **Cold starts** - 30-60 second delay when server sleeps (only if inactive 15min)

**Cold Start = Server sleeps after 15min, takes 30-60 seconds to wake up**

---

## Step-by-Step: Render Free Deployment

### STEP 1: Create Render Account (2 min)

1. **Go to**: https://render.com
2. **Click**: "Get Started for Free" (top right)
3. **Choose**: "Sign up with GitHub"
4. **Authorize** Render to access GitHub
5. **Verify** email if prompted

✅ **Done when**: You see Render dashboard

---

### STEP 2: Create Web Service (3 min)

1. **In Render dashboard**, click **"New +"** button (top right)
2. **Select**: "Web Service"
3. **Connect** your GitHub account (if not already)
4. **Find** your `School` repository
5. **Click** "Connect" next to it

✅ **Done when**: You see service configuration page

---

### STEP 3: Configure Service (5 min)

**Fill in these settings:**

1. **Name**: `school-backend`
2. **Environment**: `Node`
3. **Region**: Choose closest to you (e.g., Frankfurt)
4. **Branch**: `main` (or your main branch)
5. **Root Directory**: Leave empty (or `/`)
6. **Build Command**: `npm install`
7. **Start Command**: `node backend-proxy-example.js`
8. **Plan**: **Select "Free"** ⭐ (IMPORTANT!)

**Scroll down:**
- **Auto-Deploy**: Yes (deploys on git push)
- **Health Check Path**: `/health`

✅ **Done when**: All fields filled, "Free" plan selected

---

### STEP 4: Add Environment Variables (15 min)

**Before clicking "Create Web Service":**

1. **Scroll down** to "Environment Variables" section
2. **Click** "Add Environment Variable"
3. **Add each one**:

**Required Variables:**
```
GROQ_API_KEY = your-groq-key
OPENAI_API_KEY = your-openai-key
RESEND_API_KEY = your-resend-key
SUPABASE_URL = https://jmjezmfhygvazfunuujt.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
STRIPE_SECRET_KEY = sk_...
STRIPE_WEBHOOK_SECRET = whsec_...
STRIPE_MONTHLY_PRICE_ID = price_...
STRIPE_YEARLY_PRICE_ID = price_...
FRONTEND_URL = https://school.6x7.gr
PORT = 3000
```

**For each variable:**
- Click "Add Environment Variable"
- Enter name (left)
- Enter value (right)
- Click "Add"

✅ **Done when**: All variables added

---

### STEP 5: Create Web Service (5-10 min)

1. **Click** "Create Web Service" button (bottom)
2. **Render will**:
   - Install dependencies
   - Start your server
   - Give you a URL
3. **Wait** 5-10 minutes (first deploy takes longer)
4. **Watch** the logs - should see:
   ```
   🚀 Backend Server running on port 3000
   📝 Groq API: ✅ Configured
   📧 Resend Email: ✅ Configured
   ```

✅ **Done when**: Status shows "Live" ✅

---

### STEP 6: Get Your Backend URL (1 min)

1. **In Render**, your service page shows:
   - **URL**: `https://school-backend.onrender.com` (or similar)
2. **Copy** this URL
3. **Save it!** You'll need it for frontend

✅ **Done when**: You have URL like `https://xxx.onrender.com`

---

### STEP 7: Test Backend (2 min)

**Open terminal:**
```bash
curl https://school-backend.onrender.com/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2024-01-09T..."}
```

**If it works**: ✅ **Backend is live!**

**If first request takes 30-60 seconds**: That's the cold start! Normal for free tier.

---

### STEP 8: Add Backend URL to Frontend (2 min)

**In browser console** (on your site):
```javascript
localStorage.setItem('backend_url', 'https://school-backend.onrender.com');
```

**Or via Settings UI**:
1. Open your site
2. Click Settings (⚙️)
3. Find "Backend Configuration"
4. Enter your Render URL
5. Click Save

✅ **Done when**: Backend URL is saved

---

### STEP 9: Test Email Confirmation (5 min)

1. **Open** your site
2. **Click** "Sign In" → "Sign up"
3. **Enter**: Name, Email, Password
4. **Submit** → Should show confirmation form
5. **Check email** for 6-digit code
6. **Enter code** → Should verify and log you in

**Note**: First request might take 30-60 seconds (cold start). After that, it's instant!

---

## 🎉 Success Checklist

- [ ] Render account created
- [ ] Web service created (Free plan)
- [ ] All environment variables added
- [ ] Service shows "Live" status
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Backend URL added to frontend
- [ ] Email confirmation tested

---

## 🧊 About Cold Starts

### What Happens:
1. **No one visits** for 15 minutes → Server sleeps 😴
2. **User visits** → Server wakes up (30-60 seconds) ⏰
3. **After wake up** → Works normally ✅

### Is This Bad?
- **For testing**: Totally fine! ✅
- **For users**: Annoying but free
- **If users active**: No cold starts!

### How to Avoid Cold Starts:
- **Keep users active** - Server stays awake
- **Upgrade to Paid** ($7/month) - No cold starts
- **Or** accept the delay - It's FREE! 🎉

---

## 💰 Cost Comparison

| Platform | Cost | Cold Starts |
|----------|------|-------------|
| **Render Free** | **$0/month** ✅ | ⚠️ Yes (30-60 sec) |
| **Render Paid** | $7/month | ❌ No |
| **Railway** | $5/month | ❌ No |

**For FREE**: Render Free is perfect! ✅

---

## 🐛 Troubleshooting

### Service Won't Start?
- **Check logs** in Render dashboard
- **Verify** `package.json` exists ✅ (It does!)
- **Check** start command: `node backend-proxy-example.js`

### Cold Start Too Slow?
- **That's normal** for free tier
- **First request** always slow (30-60 sec)
- **After that** - Instant!

### Variables Not Working?
- **Check** names are EXACT (case-sensitive)
- **No spaces** before/after
- **Redeploy** after adding variables

---

## ⏱️ Time Estimate

- **Total**: 30-40 minutes
- **First deploy**: 5-10 minutes
- **Subsequent deploys**: 2-3 minutes

---

## 🎯 What This Enables

After deployment:
- ✅ Email confirmation works
- ✅ Payments work (Stripe)
- ✅ Reminders send notifications
- ✅ AI features use backend
- ✅ **ALL FREE!** 🎉

---

## 📚 Next Steps

After backend is deployed:
- **Task 3**: Configure Supabase OAuth
- **Task 4**: Set up Stripe products
- **Task 5**: Test everything

---

**Ready to deploy? Follow the steps above!** 🚀

**Remember**: Select **"Free"** plan - No payment needed! ✅


## Why Render Free?

- ✅ **FREE FOREVER** - No payment, no trial expiration
- ✅ **Same code** - Works exactly the same
- ⚠️ **Cold starts** - 30-60 second delay when server sleeps (only if inactive 15min)

**Cold Start = Server sleeps after 15min, takes 30-60 seconds to wake up**

---

## Step-by-Step: Render Free Deployment

### STEP 1: Create Render Account (2 min)

1. **Go to**: https://render.com
2. **Click**: "Get Started for Free" (top right)
3. **Choose**: "Sign up with GitHub"
4. **Authorize** Render to access GitHub
5. **Verify** email if prompted

✅ **Done when**: You see Render dashboard

---

### STEP 2: Create Web Service (3 min)

1. **In Render dashboard**, click **"New +"** button (top right)
2. **Select**: "Web Service"
3. **Connect** your GitHub account (if not already)
4. **Find** your `School` repository
5. **Click** "Connect" next to it

✅ **Done when**: You see service configuration page

---

### STEP 3: Configure Service (5 min)

**Fill in these settings:**

1. **Name**: `school-backend`
2. **Environment**: `Node`
3. **Region**: Choose closest to you (e.g., Frankfurt)
4. **Branch**: `main` (or your main branch)
5. **Root Directory**: Leave empty (or `/`)
6. **Build Command**: `npm install`
7. **Start Command**: `node backend-proxy-example.js`
8. **Plan**: **Select "Free"** ⭐ (IMPORTANT!)

**Scroll down:**
- **Auto-Deploy**: Yes (deploys on git push)
- **Health Check Path**: `/health`

✅ **Done when**: All fields filled, "Free" plan selected

---

### STEP 4: Add Environment Variables (15 min)

**Before clicking "Create Web Service":**

1. **Scroll down** to "Environment Variables" section
2. **Click** "Add Environment Variable"
3. **Add each one**:

**Required Variables:**
```
GROQ_API_KEY = your-groq-key
OPENAI_API_KEY = your-openai-key
RESEND_API_KEY = your-resend-key
SUPABASE_URL = https://jmjezmfhygvazfunuujt.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
STRIPE_SECRET_KEY = sk_...
STRIPE_WEBHOOK_SECRET = whsec_...
STRIPE_MONTHLY_PRICE_ID = price_...
STRIPE_YEARLY_PRICE_ID = price_...
FRONTEND_URL = https://school.6x7.gr
PORT = 3000
```

**For each variable:**
- Click "Add Environment Variable"
- Enter name (left)
- Enter value (right)
- Click "Add"

✅ **Done when**: All variables added

---

### STEP 5: Create Web Service (5-10 min)

1. **Click** "Create Web Service" button (bottom)
2. **Render will**:
   - Install dependencies
   - Start your server
   - Give you a URL
3. **Wait** 5-10 minutes (first deploy takes longer)
4. **Watch** the logs - should see:
   ```
   🚀 Backend Server running on port 3000
   📝 Groq API: ✅ Configured
   📧 Resend Email: ✅ Configured
   ```

✅ **Done when**: Status shows "Live" ✅

---

### STEP 6: Get Your Backend URL (1 min)

1. **In Render**, your service page shows:
   - **URL**: `https://school-backend.onrender.com` (or similar)
2. **Copy** this URL
3. **Save it!** You'll need it for frontend

✅ **Done when**: You have URL like `https://xxx.onrender.com`

---

### STEP 7: Test Backend (2 min)

**Open terminal:**
```bash
curl https://school-backend.onrender.com/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2024-01-09T..."}
```

**If it works**: ✅ **Backend is live!**

**If first request takes 30-60 seconds**: That's the cold start! Normal for free tier.

---

### STEP 8: Add Backend URL to Frontend (2 min)

**In browser console** (on your site):
```javascript
localStorage.setItem('backend_url', 'https://school-backend.onrender.com');
```

**Or via Settings UI**:
1. Open your site
2. Click Settings (⚙️)
3. Find "Backend Configuration"
4. Enter your Render URL
5. Click Save

✅ **Done when**: Backend URL is saved

---

### STEP 9: Test Email Confirmation (5 min)

1. **Open** your site
2. **Click** "Sign In" → "Sign up"
3. **Enter**: Name, Email, Password
4. **Submit** → Should show confirmation form
5. **Check email** for 6-digit code
6. **Enter code** → Should verify and log you in

**Note**: First request might take 30-60 seconds (cold start). After that, it's instant!

---

## 🎉 Success Checklist

- [ ] Render account created
- [ ] Web service created (Free plan)
- [ ] All environment variables added
- [ ] Service shows "Live" status
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Backend URL added to frontend
- [ ] Email confirmation tested

---

## 🧊 About Cold Starts

### What Happens:
1. **No one visits** for 15 minutes → Server sleeps 😴
2. **User visits** → Server wakes up (30-60 seconds) ⏰
3. **After wake up** → Works normally ✅

### Is This Bad?
- **For testing**: Totally fine! ✅
- **For users**: Annoying but free
- **If users active**: No cold starts!

### How to Avoid Cold Starts:
- **Keep users active** - Server stays awake
- **Upgrade to Paid** ($7/month) - No cold starts
- **Or** accept the delay - It's FREE! 🎉

---

## 💰 Cost Comparison

| Platform | Cost | Cold Starts |
|----------|------|-------------|
| **Render Free** | **$0/month** ✅ | ⚠️ Yes (30-60 sec) |
| **Render Paid** | $7/month | ❌ No |
| **Railway** | $5/month | ❌ No |

**For FREE**: Render Free is perfect! ✅

---

## 🐛 Troubleshooting

### Service Won't Start?
- **Check logs** in Render dashboard
- **Verify** `package.json` exists ✅ (It does!)
- **Check** start command: `node backend-proxy-example.js`

### Cold Start Too Slow?
- **That's normal** for free tier
- **First request** always slow (30-60 sec)
- **After that** - Instant!

### Variables Not Working?
- **Check** names are EXACT (case-sensitive)
- **No spaces** before/after
- **Redeploy** after adding variables

---

## ⏱️ Time Estimate

- **Total**: 30-40 minutes
- **First deploy**: 5-10 minutes
- **Subsequent deploys**: 2-3 minutes

---

## 🎯 What This Enables

After deployment:
- ✅ Email confirmation works
- ✅ Payments work (Stripe)
- ✅ Reminders send notifications
- ✅ AI features use backend
- ✅ **ALL FREE!** 🎉

---

## 📚 Next Steps

After backend is deployed:
- **Task 3**: Configure Supabase OAuth
- **Task 4**: Set up Stripe products
- **Task 5**: Test everything

---

**Ready to deploy? Follow the steps above!** 🚀

**Remember**: Select **"Free"** plan - No payment needed! ✅

