# ✅ Setup Checklist - What You Need to Do

This checklist covers everything **YOU** need to do. All the code is already done! 🎉

---

## Phase 1: Supabase Setup (30 minutes)

### ✅ Step 1: Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up (free tier available)
- [ ] Create new project: "School Platform"
- [ ] **Save your database password** (you'll need it!)

### ✅ Step 2: Run Database Schema
- [ ] Go to **SQL Editor** in Supabase dashboard
- [ ] Open `supabase-setup.md` file
- [ ] Copy the entire SQL code block
- [ ] Paste into SQL Editor
- [ ] Click **Run**
- [ ] Verify tables are created (check Tables section)

### ✅ Step 3: Enable OAuth (Optional but Recommended)
- [ ] Go to **Authentication** → **Providers**

**Google OAuth:**
- [ ] Go to https://console.cloud.google.com
- [ ] Create new project or select existing
- [ ] Enable Google+ API
- [ ] Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
- [ ] Application type: **Web application**
- [ ] Authorized redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
- [ ] Copy **Client ID** and **Client Secret**
- [ ] Paste into Supabase Google provider settings

**GitHub OAuth:**
- [ ] Go to GitHub → Settings → Developer settings → OAuth Apps
- [ ] Click **New OAuth App**
- [ ] Application name: "School Platform"
- [ ] Homepage URL: `https://school.6x7.gr`
- [ ] Authorization callback URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
- [ ] Copy **Client ID** and **Client Secret**
- [ ] Paste into Supabase GitHub provider settings

### ✅ Step 4: Enable Storage
- [ ] Go to **Storage** in Supabase
- [ ] Click **New bucket**
- [ ] Name: `avatars` → **Public** → Create
- [ ] Click **New bucket**
- [ ] Name: `assignments` → **Private** → Create

### ✅ Step 5: Get Credentials
- [ ] Go to **Settings** → **API**
- [ ] Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
- [ ] Copy **anon/public key** (starts with `eyJhbGc...`)
- [ ] Copy **service_role key** (KEEP SECRET - backend only!)
- [ ] **Save these somewhere safe!**

---

## Phase 2: Backend Server Setup (20 minutes)

### ✅ Option A: Railway (Recommended - Easiest)

1. **Create Account:**
   - [ ] Go to https://railway.app
   - [ ] Sign up with GitHub
   - [ ] Verify email

2. **Deploy Backend:**
   - [ ] Click **New Project**
   - [ ] Click **Deploy from GitHub repo**
   - [ ] Select your `School` repository
   - [ ] Railway auto-detects Node.js ✅
   - [ ] Click **Deploy**

3. **Set Environment Variables:**
   - [ ] Go to your project → **Variables** tab
   - [ ] Add these variables:
     ```
     GROQ_API_KEY=your-groq-key-here
     OPENAI_API_KEY=your-openai-key-here
     RESEND_API_KEY=your-resend-key-here
     SUPABASE_URL=https://xxxxx.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     FRONTEND_URL=https://school.6x7.gr
     
     # Optional: Messaging Platforms (see MESSAGING_API_KEYS_GUIDE.md)
     FACEBOOK_PAGE_ACCESS_TOKEN=...
     WHATSAPP_PHONE_NUMBER_ID=...
     WHATSAPP_ACCESS_TOKEN=...
     INSTAGRAM_BUSINESS_ACCOUNT_ID=...
     VIBER_AUTH_TOKEN=...
     TELEGRAM_BOT_TOKEN=...
     DISCORD_WEBHOOK_URL=...
     ```
   - [ ] Click **Save**

4. **Get Backend URL:**
   - [ ] Railway gives you a URL like: `https://school-backend.up.railway.app`
   - [ ] Copy this URL

### ✅ Option B: Render (Alternative)

1. **Create Account:**
   - [ ] Go to https://render.com
   - [ ] Sign up with GitHub

2. **Create Web Service:**
   - [ ] Click **New** → **Web Service**
   - [ ] Connect your GitHub repo
   - [ ] Settings:
     - Name: `school-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - [ ] Click **Create Web Service**

3. **Set Environment Variables:** (same as Railway)

4. **Get Backend URL:** (e.g., `https://school-backend.onrender.com`)

---

## Phase 3: Get API Keys (15 minutes)

### ✅ Groq API Key (Free)
- [ ] Go to https://console.groq.com
- [ ] Sign up/login
- [ ] Go to **API Keys**
- [ ] Click **Create API Key**
- [ ] Copy the key (starts with `gsk_...`)
- [ ] Add to backend environment variables

### ✅ OpenAI API Key (Optional - for grading)
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Sign up/login
- [ ] Click **Create new secret key**
- [ ] Copy the key (starts with `sk-...`)
- [ ] Add to backend environment variables
- [ ] Add billing info (required for API usage)

### ✅ Resend API Key (Email)
- [ ] Go to https://resend.com
- [ ] Sign up (free tier: 3,000 emails/month)
- [ ] Go to **API Keys**
- [ ] Click **Create API Key**
- [ ] Copy the key (starts with `re_...`)
- [ ] Add to backend environment variables

### ✅ Twilio (Optional - SMS)
- [ ] Go to https://www.twilio.com
- [ ] Sign up
- [ ] Get **Account SID** and **Auth Token**
- [ ] Buy a phone number
- [ ] Add to backend environment variables:
  ```
  TWILIO_ACCOUNT_SID=...
  TWILIO_AUTH_TOKEN=...
  TWILIO_PHONE_NUMBER=+1234567890
  ```

### ✅ Messaging Platforms (Optional - Facebook, WhatsApp, Instagram, Viber, Telegram, Discord)
- [ ] **Facebook Messenger**: See `MESSAGING_API_KEYS_GUIDE.md` for setup
- [ ] **WhatsApp**: See `MESSAGING_API_KEYS_GUIDE.md` for setup
- [ ] **Instagram**: See `MESSAGING_API_KEYS_GUIDE.md` for setup
- [ ] **Viber**: See `MESSAGING_API_KEYS_GUIDE.md` for setup
- [ ] **Telegram**: See `MESSAGING_API_KEYS_GUIDE.md` for setup
- [ ] **Discord**: See `MESSAGING_API_KEYS_GUIDE.md` for setup

**Quick Setup Guide**: See `MESSAGING_API_KEYS_GUIDE.md` for detailed instructions on finding and setting up API keys for all messaging platforms.

**Easiest to start with**:
1. Telegram (5 min) - Create bot with @BotFather
2. Discord (2 min) - Create webhook
3. Viber (15 min) - Create public account

---

## Phase 4: Frontend Configuration (5 minutes)

### ✅ Add Supabase Credentials
1. **Option A: Via Settings UI**
   - [ ] Open your site: https://school.6x7.gr
   - [ ] Click **Settings** (⚙️ icon)
   - [ ] Scroll to **Backend Configuration**
   - [ ] Enter Supabase URL
   - [ ] Enter Supabase Anon Key
   - [ ] Click **Save**

2. **Option B: Via Browser Console**
   ```javascript
   localStorage.setItem('supabase_url', 'https://xxxxx.supabase.co');
   localStorage.setItem('supabase_anon_key', 'your-anon-key-here');
   ```

### ✅ Add Backend URL
1. **Via Settings UI:**
   - [ ] In Settings → Backend Configuration
   - [ ] Enter your Railway/Render backend URL
   - [ ] Click **Save**

2. **Via Browser Console:**
   ```javascript
   localStorage.setItem('backend_url', 'https://your-backend.railway.app');
   ```

---

## Phase 5: Testing (10 minutes)

### ✅ Test Checklist
- [ ] **Sign Up**: Create a new account (should use Supabase)
- [ ] **Sign In**: Login with email/password
- [ ] **OAuth**: Try Google/GitHub login (if configured)
- [ ] **AI Features**: Ask AI chatbot a question (should work without user keys)
- [ ] **Progress**: Complete a module (should save to Supabase)
- [ ] **Email**: Check email for welcome message
- [ ] **Settings**: Verify backend/Supabase status shows ✅

### ✅ Test Commands (Optional)
```bash
# Test backend health
curl https://your-backend.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Phase 6: Migration (Optional - 5 minutes)

If you have existing users with localStorage data:

- [ ] Open browser console on your site
- [ ] Run: `await MigrationManager.migrateUserData()`
- [ ] Check console for success message

---

## 🎉 You're Done!

Once all checkboxes are complete:
- ✅ Users can sign up/login with Supabase
- ✅ AI features work for everyone (no individual keys needed)
- ✅ Email notifications work
- ✅ Progress saves to database
- ✅ Real-time messaging works
- ✅ File uploads work

---

## 📚 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Implementation Guide**: See `IMPLEMENTATION_GUIDE.md`
- **Backend Setup**: See `BACKEND_SETUP.md`
- **Supabase Setup**: See `supabase-setup.md`

---

## ⚠️ Troubleshooting

**Backend not connecting?**
- Check Railway/Render logs
- Verify environment variables are set
- Test `/health` endpoint

**Supabase not working?**
- Check URL and key are correct
- Verify RLS policies are set
- Check browser console for errors

**Email not sending?**
- Check Resend API key
- Verify email address format
- Check Resend dashboard for errors

---

**All code is ready! Just follow the checklist above.** 🚀

