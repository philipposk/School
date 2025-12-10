# 🚨 IMMEDIATE FIX: Resend Key Lost

## The Situation
- ✅ You created a Resend API key named "school"
- ❌ You didn't copy it immediately
- ❌ Resend only shows keys ONCE (can't recover it)
- ✅ Fly.io has `RESEND_API_KEY` set (but we can't see the value)

## ✅ Solution: Create NEW Key

Since the old key is lost forever, create a new one:

### Quick Steps:
1. **Open:** `create-and-save-resend-key.html` in your browser
2. **Follow the steps** in that file
3. **Create new key** in Resend dashboard
4. **COPY IMMEDIATELY** (before closing page!)
5. **Paste in the HTML file**
6. **Save it**
7. **Run the generated command** to update Fly.io

### Or Manual Steps:

1. Go to **resend.com/api-keys**
2. Click **"+ Create API key"**
3. Name: `school-v2`
4. **IMMEDIATELY COPY** (Cmd+A, Cmd+C on Mac)
5. Run:
```bash
flyctl secrets set RESEND_API_KEY="paste-your-key-here" -a school-backend
```

## 🔍 If Key Page is Still Open

If the Resend key creation page is still open in a tab:

1. **Go to that tab**
2. **Press F12** (open console)
3. **Paste this:**
```javascript
// Extract key from page
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    if (input.value && input.value.startsWith('re_')) {
        navigator.clipboard.writeText(input.value);
        alert('✅ Copied: ' + input.value.substring(0, 20) + '...');
    }
});
```

## 💡 Why This Happened

Resend (like most services) only shows API keys ONCE for security. Once you close the page, it's gone forever. Always copy immediately!

## ✅ After Saving

Once you save the new key:
- ✅ It will work in your backend
- ✅ Emails will send
- ✅ You can delete the old "school" key from Resend dashboard

---

**Open `create-and-save-resend-key.html` now and follow the steps!**
