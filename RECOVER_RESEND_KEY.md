# 🔑 Recover Your Resend API Key

I'm sorry the key wasn't saved properly. Here are **all the ways** to find it:

## ✅ Method 1: Check Fly.io Secrets (Most Likely)

Your backend is deployed on Fly.io. Run:

```bash
cd "/Users/phktistakis/Devoloper Projects/School"
./check-fly-secrets.sh
```

Or manually:
```bash
flyctl secrets list -a school-backend
```

Look for `RESEND_API_KEY` in the list. If it's there, you can see it's set (but the value is hidden for security).

## ✅ Method 2: Get It From Resend Dashboard

1. Go to **https://resend.com**
2. **Sign in**
3. Click **Dashboard** → **API Keys** (in sidebar)
4. You'll see your API keys
5. Click **"Show"** or **"Copy"** button next to your key
6. The key starts with `re_...`

**If you can't copy it:**
- Right-click on the key → Inspect Element
- Find the `<input>` or `<span>` element
- Double-click the text to select it
- Copy with Cmd+C

## ✅ Method 3: Check Browser localStorage

Open browser console (F12) and run:
```javascript
localStorage.getItem('resend_api_key')
```

## ✅ Method 4: Check Your Email

Search your email for:
- "Resend"
- "API key"
- "Welcome to Resend"

Resend sends a welcome email with your API key when you sign up.

## ✅ Method 5: Create a New Key (If All Else Fails)

If you can't find it, create a new one:

1. Go to **https://resend.com** → Dashboard → API Keys
2. Click **"Create API Key"**
3. Give it a name (e.g., "School Platform")
4. Copy the key immediately (you can only see it once!)
5. Save it using `save-resend-key.html`

## 💾 Once You Find It - Save It Properly

### Option A: Use the Helper File
1. Open `save-resend-key.html` in your browser
2. Paste your key
3. Click "Save"

### Option B: Add to Fly.io
```bash
flyctl secrets set RESEND_API_KEY="your-key-here" -a school-backend
```

### Option C: Add to credentials.json
I'll help you add it to your credentials file once you have it.

## 🆘 If You Still Can't Find It

Tell me:
1. Where are you looking at the key? (Resend dashboard, deployment platform, etc.)
2. What happens when you try to copy it?
3. Can you see the key but just can't select it?

I'll help you get it!
