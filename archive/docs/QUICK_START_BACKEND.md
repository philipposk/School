# ⚡ Quick Start: Backend Deployment

## Fastest Way to Deploy (Railway)

### 1. Go to Railway
👉 https://railway.app

### 2. Sign Up
- Click "Start a New Project"
- Sign up with GitHub

### 3. Deploy from GitHub
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `School` repository
- Railway auto-detects Node.js ✅

### 4. Add Environment Variables
Go to your project → **Variables** tab → Add these:

**Required:**
```
GROQ_API_KEY=your-key
OPENAI_API_KEY=your-key
RESEND_API_KEY=your-key
SUPABASE_URL=https://jmjezmfhygvazfunuujt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
FRONTEND_URL=https://school.6x7.gr
PORT=3000
```

### 5. Set Start Command
Go to Settings → Start Command:
```
node backend-proxy-example.js
```

### 6. Deploy
- Railway auto-deploys
- Wait 2-3 minutes
- Get your URL: `https://your-app.up.railway.app`

### 7. Test
```bash
curl https://your-app.up.railway.app/health
```

Should return: `{"status":"ok"}` ✅

### 8. Add to Frontend
In browser console:
```javascript
localStorage.setItem('backend_url', 'https://your-app.up.railway.app');
```

**Done!** 🎉

---

## Files You Need

✅ `package.json` - Already exists  
✅ `backend-proxy-example.js` - Already exists  
✅ Dependencies listed - Already correct

**Everything is ready!** Just deploy! 🚀

