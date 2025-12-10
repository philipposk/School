# 🔍 Finding Your Resend API Key

## Option 1: Check Your Deployment Platform

### If using Railway:
1. Go to https://railway.app
2. Sign in
3. Select your project → **Variables** tab
4. Look for `RESEND_API_KEY`
5. Click the eye icon to reveal it
6. Copy it

### If using Render:
1. Go to https://render.com
2. Sign in
3. Select your service → **Environment** tab
4. Look for `RESEND_API_KEY`
5. Click to reveal and copy

### If using Fly.io:
Run this command:
```bash
flyctl secrets list -a school-backend
```

## Option 2: Get It From Resend Dashboard

1. Go to **https://resend.com**
2. Sign in to your account
3. Click **Dashboard** → **API Keys**
4. You'll see your API keys listed
5. Click **Copy** or **Show** next to your key
6. It starts with `re_...`

## Option 3: Check Browser localStorage

Open browser console (F12) and run:
```javascript
localStorage.getItem('resend_api_key')
```

## Option 4: If You Can't Copy It

If the key is displayed but you can't copy it:
1. **Right-click** on the key → **Inspect Element**
2. Find the element showing the key
3. Double-click the text content to select it
4. Copy with Cmd+C (Mac) or Ctrl+C (Windows)

## Once You Have It

1. Open `save-resend-key.html` in your browser
2. Paste the key
3. Click "Save Resend API Key"
4. It will be saved securely

## Quick Save Command

If you have the key, you can also add it directly to your backend:

**Railway/Render:**
- Add environment variable: `RESEND_API_KEY=your-key-here`

**Fly.io:**
```bash
flyctl secrets set RESEND_API_KEY="your-key-here" -a school-backend
```
