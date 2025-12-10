# 🔑 Save Resend Key - Just Do This

## Super Simple Method:

### 1. Get your Resend key from resend.com/api-keys

### 2. Run this ONE command (replace YOUR_KEY with your actual key):

```bash
flyctl secrets set RESEND_API_KEY="YOUR_KEY" -a school-backend
```

**That's it!** The key is now saved.

### 3. Test it works:

```bash
curl -X POST https://school-backend.fly.dev/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@gmail.com","subject":"Test","html":"<p>Test</p>"}'
```

---

## Alternative: Use the Script

If you prefer, run:
```bash
./quick-save-resend.sh
```

It will ask you to paste the key and do everything automatically.

---

**No HTML files needed. Just one command. Done.**
