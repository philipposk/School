# 🔄 How school.6x7.gr Works - Simple Explanation

## When User Visits school.6x7.gr

### Step 1: Page Loads (GitHub Pages)
```
User types: school.6x7.gr
    ↓
Browser requests: school.6x7.gr
    ↓
GitHub Pages serves: index.html, CSS, JavaScript files
    ↓
Page displays on user's screen
```
**Fly.io is NOT used here** ✅

---

### Step 2: User Clicks "AI Chat" (Fly.io IS Used)
```
User clicks AI chat button
    ↓
JavaScript code runs: AIConfig.callGroqAPI()
    ↓
JavaScript makes request to: school-backend.fly.dev/api/ai/groq
    ↓
Fly.io backend processes request
    ↓
Fly.io calls Groq API
    ↓
Fly.io returns response to user's browser
    ↓
AI response displays in chat
```
**Fly.io IS used here** ✅

---

### Step 3: User Signs Up (Fly.io IS Used)
```
User fills signup form and clicks "Sign Up"
    ↓
JavaScript code runs: AuthManager.signUp()
    ↓
JavaScript makes request to: school-backend.fly.dev/api/notifications/email
    ↓
Fly.io backend sends confirmation email via Resend
    ↓
User receives email with 6-digit code
```
**Fly.io IS used here** ✅

---

### Step 4: User Just Reads Course Content (Fly.io NOT Used)
```
User clicks on a course module
    ↓
JavaScript loads content from localStorage or GitHub Pages
    ↓
Content displays
```
**Fly.io is NOT used here** ✅

---

## Summary

| Action | Uses Fly.io? | Why? |
|--------|--------------|------|
| Visit homepage | ❌ No | Just HTML/CSS from GitHub Pages |
| Read course content | ❌ No | Content is in HTML files |
| Navigate pages | ❌ No | JavaScript routing |
| Use AI chat | ✅ Yes | Needs Groq API (via Fly.io) |
| Sign up | ✅ Yes | Needs email sending (via Fly.io) |
| Make payment | ✅ Yes | Needs Stripe (via Fly.io) |
| Get reminder | ✅ Yes | Needs notifications (via Fly.io) |

---

## Visual Flow

```
┌─────────────────────────────────────────┐
│  User's Browser                        │
│                                         │
│  school.6x7.gr (GitHub Pages)          │
│  ├─ index.html                         │
│  ├─ js/ai-config.js                   │
│  ├─ js/auth-enhanced.js               │
│  └─ js/payment-system.js              │
│                                         │
│  When user clicks "AI Chat":          │
│  └─→ fetch('school-backend.fly.dev')  │
└─────────────────────────────────────────┘
              │
              │ API Request
              ↓
┌─────────────────────────────────────────┐
│  Fly.io Backend                         │
│  school-backend.fly.dev                 │
│  ├─ /api/ai/groq                       │
│  ├─ /api/notifications/email           │
│  ├─ /api/payments/create-checkout     │
│  └─ /api/config/supabase              │
│                                         │
│  Processes request and returns data    │
└─────────────────────────────────────────┘
```

---

## Key Points

1. **school.6x7.gr** = Frontend (GitHub Pages)
   - What users see
   - HTML, CSS, JavaScript files
   - Updates automatically when you push to GitHub

2. **school-backend.fly.dev** = Backend (Fly.io)
   - API server
   - Handles AI, email, payments
   - Needs manual deploy (`flyctl deploy`)

3. **They work together:**
   - Frontend (GitHub) makes requests to Backend (Fly.io)
   - Backend processes and returns data
   - Frontend displays the data to user

---

## When You Update Code

### Update Frontend (HTML/CSS/JS):
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
→ **Auto-deploys to GitHub Pages in 1-2 minutes** ✅

### Update Backend (API):
```bash
git add backend-proxy-example.js
git commit -m "Update backend"
git push origin main
flyctl deploy -a school-backend
```
→ **Needs manual deploy** ⚠️

---

**In Simple Terms:**
- **GitHub Pages** = The website users see
- **Fly.io** = The server that handles AI, emails, payments (works behind the scenes)

