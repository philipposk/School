# 🚨 Fix: Can't Copy Resend Key After Creation

## The Problem
Resend only shows the API key **ONCE** when you create it. If you didn't copy it immediately, you can't see it again.

## ✅ Solution: Create a NEW Key

Since you can't recover the old key, let's create a new one and save it properly:

### Step 1: Create New Key
1. Go to **resend.com/api-keys**
2. Click **"+ Create API key"**
3. Name it: `school-backup` or `school-v2`
4. **IMMEDIATELY COPY THE KEY** (do this FIRST before anything else!)
5. Paste it somewhere safe (text file, notes app, etc.)

### Step 2: Save It Properly
1. Open `save-resend-key-now.html` in your browser
2. Paste the FULL key
3. Click "Save"
4. It will give you the command to add it to Fly.io

### Step 3: Add to Fly.io
```bash
flyctl secrets set RESEND_API_KEY="your-new-full-key-here" -a school-backend
```

### Step 4: Delete Old Key (Optional)
1. Go back to Resend dashboard
2. Delete the old "school" key (since you can't use it anyway)
3. Keep only the new one

## 🔍 If Key is Still Visible on Page

If the key creation page is still open and you can see the key:

### Quick Extract (Browser Console):
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Paste this and press Enter:

```javascript
// Find and copy the key
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
    if (input.value && input.value.startsWith('re_') && input.value.length > 30) {
        console.log('Found key:', input.value);
        navigator.clipboard.writeText(input.value);
        alert('✅ Key copied to clipboard: ' + input.value.substring(0, 20) + '...');
    }
});

// Also check text content
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
let node;
while (node = walker.nextNode()) {
    if (node.textContent.includes('re_') && node.textContent.trim().length > 30) {
        const key = node.textContent.trim();
        if (key.startsWith('re_')) {
            console.log('Found key in text:', key);
            navigator.clipboard.writeText(key);
            alert('✅ Key copied: ' + key.substring(0, 20) + '...');
            break;
        }
    }
}
```

## 💡 Prevention: Always Copy Immediately

When creating API keys:
1. **Create key**
2. **COPY IMMEDIATELY** (before closing the page)
3. **Save to secure location**
4. **Then** configure it in your backend

## 🆘 If Nothing Works

Create a new key and I'll help you save it properly this time. The old key is lost forever (that's how Resend works for security).
