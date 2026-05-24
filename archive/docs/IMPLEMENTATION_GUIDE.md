# 🚀 Complete Implementation Guide

This guide walks you through implementing all backend features step by step.

## Phase 1: Supabase Setup (30 minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com and sign up
2. Create new project: "School Platform"
3. Save your database password securely
4. Wait ~2 minutes for setup

### Step 2: Run Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste the SQL from `supabase-setup.md`
3. Click "Run" to create all tables

### Step 3: Enable OAuth Providers
1. Go to **Authentication** → **Providers**
2. **Google OAuth**:
   - Go to https://console.cloud.google.com
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
3. **GitHub OAuth**:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth app
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

### Step 4: Enable Storage
1. Go to **Storage** in Supabase
2. Create bucket: `avatars` (public)
3. Create bucket: `assignments` (private)
4. Set policies (users can upload their own files)

### Step 5: Get Credentials
1. Go to **Settings** → **API**
2. Copy:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

---

## Phase 2: Backend Server Setup (20 minutes)

### Option A: Railway (Recommended)

1. **Sign up**: https://railway.app (use GitHub)
2. **Create Project**: "School Backend"
3. **Deploy**:
   - Click "New" → "GitHub Repo"
   - Select your School repository
   - Railway auto-detects Node.js
4. **Set Environment Variables**:
   ```
   GROQ_API_KEY=your-groq-key
   OPENAI_API_KEY=your-openai-key
   RESEND_API_KEY=your-resend-key
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   TWILIO_ACCOUNT_SID=your-twilio-sid (optional)
   TWILIO_AUTH_TOKEN=your-twilio-token (optional)
   TWILIO_PHONE_NUMBER=+1234567890 (optional)
   FRONTEND_URL=https://school.6x7.gr
   ```
5. **Deploy**: Railway automatically deploys
6. **Get URL**: Copy your Railway URL (e.g., `https://school-backend.up.railway.app`)

### Option B: Render

1. **Sign up**: https://render.com
2. **New Web Service**:
   - Connect GitHub repo
   - Name: `school-backend`
   - Environment: `Node`
   - Build: `npm install`
   - Start: `npm start`
3. **Set Environment Variables** (same as Railway)
4. **Deploy**

---

## Phase 3: Email Service Setup (10 minutes)

### Resend Setup

1. **Sign up**: https://resend.com
2. **Get API Key**: Dashboard → API Keys → Create
3. **Verify Domain** (optional, for production):
   - Add your domain
   - Add DNS records
   - Use custom "from" address
4. **Add to Backend**: Set `RESEND_API_KEY` in Railway/Render

---

## Phase 4: SMS Service Setup (Optional, 10 minutes)

### Twilio Setup

1. **Sign up**: https://www.twilio.com
2. **Get Credentials**:
   - Account SID
   - Auth Token
   - Phone Number (buy one)
3. **Add to Backend**: Set Twilio env vars in Railway/Render

---

## Phase 5: Frontend Integration (30 minutes)

### Step 1: Add Supabase Credentials

1. Open `index.html`
2. In Settings modal, add Supabase configuration section:

```javascript
// Add to settings modal
<div>
  <h3>🔧 Backend Configuration</h3>
  <input type="text" id="supabaseUrl" placeholder="Supabase URL" />
  <input type="text" id="supabaseKey" placeholder="Supabase Anon Key" />
  <button onclick="saveSupabaseConfig()">Save</button>
</div>
```

Or set directly in browser console:
```javascript
localStorage.setItem('supabase_url', 'https://xxxxx.supabase.co');
localStorage.setItem('supabase_anon_key', 'your-anon-key');
```

### Step 2: Update AI Config

Update `js/ai-config.js` to use backend proxy:

```javascript
const BACKEND_URL = localStorage.getItem('backend_url') || 'https://your-backend.railway.app';

async callGroqAPI(messages, options = {}) {
    const response = await fetch(`${BACKEND_URL}/api/ai/groq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, options })
    });
    
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.choices[0].message.content;
}
```

### Step 3: Update Authentication

Replace localStorage auth with Supabase:

```javascript
// In login handler
async function handleLogin(email, password) {
    try {
        const { data, error } = await SupabaseManager.signIn(email, password);
        if (error) throw error;
        
        // Get user profile
        const profile = await SupabaseManager.getProfile(data.user.id);
        
        // Update UI
        user = { ...data.user, ...profile };
        updateUserDisplay();
        
        // Send welcome email
        await fetch(`${BACKEND_URL}/api/notifications/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.name })
        });
    } catch (error) {
        console.error('Login error:', error);
    }
}
```

### Step 4: Migrate Existing Data

Run migration script once:

```javascript
// In browser console
await MigrationManager.migrateUserData();
```

---

## Phase 6: Testing (20 minutes)

### Test Checklist

- [ ] **Supabase Connection**: User can sign up/sign in
- [ ] **OAuth**: Google/GitHub login works
- [ ] **AI Proxy**: AI features work without user keys
- [ ] **Email**: Welcome email sent on signup
- [ ] **Progress**: User progress saves to Supabase
- [ ] **Real-time**: Messages update in real-time
- [ ] **File Upload**: Profile picture uploads work
- [ ] **SMS** (if enabled): Test SMS notification

### Test Commands

```bash
# Test backend health
curl https://your-backend.railway.app/health

# Test AI proxy
curl -X POST https://your-backend.railway.app/api/ai/groq \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Test email
curl -X POST https://your-backend.railway.app/api/notifications/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

---

## Phase 7: Production Deployment

### Frontend Updates

1. **Update Backend URL**: Set in `js/ai-config.js`
2. **Add Supabase Config**: Add to Settings or environment
3. **Test**: Verify all features work

### Backend Monitoring

1. **Railway/Render Dashboard**: Monitor logs
2. **Set Up Alerts**: Email alerts for errors
3. **Monitor Costs**: Track API usage

---

## Environment Variables Summary

### Backend (Railway/Render)
```
GROQ_API_KEY=...
OPENAI_API_KEY=...
RESEND_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
TWILIO_ACCOUNT_SID=... (optional)
TWILIO_AUTH_TOKEN=... (optional)
TWILIO_PHONE_NUMBER=... (optional)
FRONTEND_URL=https://school.6x7.gr
PORT=3000
```

### Frontend (localStorage or Settings)
```
supabase_url=https://xxxxx.supabase.co
supabase_anon_key=...
backend_url=https://your-backend.railway.app
```

---

## Troubleshooting

### Supabase Connection Issues
- Check URL and key are correct
- Verify RLS policies are set
- Check browser console for errors

### Backend Not Working
- Check Railway/Render logs
- Verify environment variables are set
- Test endpoints with curl

### Email Not Sending
- Check Resend API key
- Verify email address format
- Check Resend dashboard for errors

### OAuth Not Working
- Verify redirect URIs match
- Check OAuth app credentials
- Ensure providers are enabled in Supabase

---

## Next Steps

1. ✅ Complete all phases above
2. ✅ Test thoroughly
3. ✅ Deploy to production
4. ✅ Monitor usage and costs
5. ✅ Add rate limiting (prevent abuse)
6. ✅ Set up analytics

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Resend Docs**: https://resend.com/docs
- **Twilio Docs**: https://www.twilio.com/docs

