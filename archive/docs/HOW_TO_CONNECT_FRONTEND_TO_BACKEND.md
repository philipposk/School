# 🔗 How to Connect Frontend to Backend

## What Does This Mean?

Your **frontend** (the website users see) needs to know **where your backend is** (the server we just deployed).

Think of it like this:
- **Frontend** = Your website (what users see)
- **Backend** = Your server (handles AI, emails, payments)
- **Connection** = Telling frontend "Hey, the backend is at `https://school-backend.fly.dev`"

---

## How It Works

Your frontend **already has code** to connect to a backend! It looks for a backend URL in **localStorage**.

**Current Backend URL:** `https://school-backend.fly.dev` ✅

---

## Two Ways to Set It

### Option 1: Via Settings UI (Easiest) ✅

1. **Open your website** in browser
2. **Click** Settings (⚙️ icon)
3. **Scroll down** to "Backend Configuration"
4. **Paste** this URL:
   ```
   https://school-backend.fly.dev
   ```
5. **Click** "Save Backend URL"
6. **Done!** ✅

---

### Option 2: Via Browser Console (Quick)

1. **Open your website** in browser
2. **Press** `F12` (or right-click → Inspect)
3. **Click** "Console" tab
4. **Paste** this code:
   ```javascript
   localStorage.setItem('backend_url', 'https://school-backend.fly.dev');
   ```
5. **Press** Enter
6. **Refresh** the page
7. **Done!** ✅

---

## What Happens After Setting It?

Once the backend URL is set, your frontend will:

✅ **Use backend for AI calls** (Groq, OpenAI)
- No need to expose API keys to users
- Faster and more secure

✅ **Send emails** (confirmation codes, welcome emails)
- Email confirmation will work
- Welcome emails will be sent

✅ **Process payments** (Stripe)
- Payment checkout will work
- Subscription management will work

✅ **Send reminders** (multi-channel notifications)
- Reminders will be sent via email/SMS/messaging

---

## Verify It's Working

**Test 1: Check Settings**
- Go to Settings → Backend Configuration
- Should show: "✓ Backend configured"

**Test 2: Try AI Chat**
- Use the AI chat feature
- Should work without asking for API keys

**Test 3: Sign Up**
- Try signing up with email
- Should receive confirmation email

---

## Current Status

**Backend:** ✅ Deployed at `https://school-backend.fly.dev`
**Frontend:** ⚠️ Needs backend URL set

**Next Step:** Set the backend URL using Option 1 or 2 above!

---

## Troubleshooting

**Backend URL not saving?**
- Make sure you include `https://`
- No trailing slash: `https://school-backend.fly.dev` ✅ (not `https://school-backend.fly.dev/` ❌)

**Features still not working?**
- Check browser console for errors (F12 → Console)
- Verify backend is running: `curl https://school-backend.fly.dev/health`

**Want to test backend directly?**
```bash
curl https://school-backend.fly.dev/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Summary

**What:** Tell your frontend where the backend is
**Why:** So features (AI, emails, payments) work
**How:** Set `backend_url` in localStorage (via Settings UI or console)
**URL:** `https://school-backend.fly.dev`

**That's it!** 🎉


## What Does This Mean?

Your **frontend** (the website users see) needs to know **where your backend is** (the server we just deployed).

Think of it like this:
- **Frontend** = Your website (what users see)
- **Backend** = Your server (handles AI, emails, payments)
- **Connection** = Telling frontend "Hey, the backend is at `https://school-backend.fly.dev`"

---

## How It Works

Your frontend **already has code** to connect to a backend! It looks for a backend URL in **localStorage**.

**Current Backend URL:** `https://school-backend.fly.dev` ✅

---

## Two Ways to Set It

### Option 1: Via Settings UI (Easiest) ✅

1. **Open your website** in browser
2. **Click** Settings (⚙️ icon)
3. **Scroll down** to "Backend Configuration"
4. **Paste** this URL:
   ```
   https://school-backend.fly.dev
   ```
5. **Click** "Save Backend URL"
6. **Done!** ✅

---

### Option 2: Via Browser Console (Quick)

1. **Open your website** in browser
2. **Press** `F12` (or right-click → Inspect)
3. **Click** "Console" tab
4. **Paste** this code:
   ```javascript
   localStorage.setItem('backend_url', 'https://school-backend.fly.dev');
   ```
5. **Press** Enter
6. **Refresh** the page
7. **Done!** ✅

---

## What Happens After Setting It?

Once the backend URL is set, your frontend will:

✅ **Use backend for AI calls** (Groq, OpenAI)
- No need to expose API keys to users
- Faster and more secure

✅ **Send emails** (confirmation codes, welcome emails)
- Email confirmation will work
- Welcome emails will be sent

✅ **Process payments** (Stripe)
- Payment checkout will work
- Subscription management will work

✅ **Send reminders** (multi-channel notifications)
- Reminders will be sent via email/SMS/messaging

---

## Verify It's Working

**Test 1: Check Settings**
- Go to Settings → Backend Configuration
- Should show: "✓ Backend configured"

**Test 2: Try AI Chat**
- Use the AI chat feature
- Should work without asking for API keys

**Test 3: Sign Up**
- Try signing up with email
- Should receive confirmation email

---

## Current Status

**Backend:** ✅ Deployed at `https://school-backend.fly.dev`
**Frontend:** ⚠️ Needs backend URL set

**Next Step:** Set the backend URL using Option 1 or 2 above!

---

## Troubleshooting

**Backend URL not saving?**
- Make sure you include `https://`
- No trailing slash: `https://school-backend.fly.dev` ✅ (not `https://school-backend.fly.dev/` ❌)

**Features still not working?**
- Check browser console for errors (F12 → Console)
- Verify backend is running: `curl https://school-backend.fly.dev/health`

**Want to test backend directly?**
```bash
curl https://school-backend.fly.dev/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Summary

**What:** Tell your frontend where the backend is
**Why:** So features (AI, emails, payments) work
**How:** Set `backend_url` in localStorage (via Settings UI or console)
**URL:** `https://school-backend.fly.dev`

**That's it!** 🎉

