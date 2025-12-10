# 🔑 Step-by-Step: Get Your Resend Key

## Step 1: Create New Key in Resend

1. **Go to:** https://resend.com/api-keys
2. **Click:** "+ Create API key" (top right button)
3. **Name it:** `school-backup` (or any name you want)
4. **Click:** "Create"

## Step 2: COPY THE KEY IMMEDIATELY ⚠️

**CRITICAL:** Resend only shows the key ONCE. Copy it NOW before closing the page!

**How to copy:**
- **Option A:** Click the "Copy" button if available
- **Option B:** Click and drag to select all the text, then Cmd+C (Mac) or Ctrl+C (Windows)
- **Option C:** Right-click on the key → Select All → Copy
- **Option D:** Press Cmd+A (Mac) or Ctrl+A (Windows) to select all, then Cmd+C/Ctrl+C

**The key looks like:** `re_fkdK8Eyu_abc123xyz456...` (it's longer than what's shown in the list)

## Step 3: Paste It Here

Once you've copied the key, **paste it here in this chat** and I'll immediately run the command to save it to Fly.io.

## Step 4: I'll Run the Command

As soon as you paste the key, I'll run:
```bash
flyctl secrets set RESEND_API_KEY="your-key" -a school-backend
```

## Step 5: Test It Works

After I save it, we'll test that emails work:
```bash
curl -X POST https://school-backend.fly.dev/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@gmail.com","subject":"Test","html":"<p>Test</p>"}'
```

---

## ⚠️ Important Reminders

- ✅ Copy the key IMMEDIATELY after creating it
- ✅ Don't close the Resend page until you've copied it
- ✅ Paste it here and I'll save it immediately
- ✅ The key starts with `re_` and is about 40-50 characters long

---

**Ready? Go to resend.com/api-keys and create the key, then paste it here!**
