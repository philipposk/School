# 🔑 Save Resend Key - Simple Method

## Just Do This:

### Step 1: Get Your Key
1. Go to resend.com/api-keys
2. Create new key (or use existing one if you can see it)
3. Copy it

### Step 2: Save to Fly.io (That's All You Need!)

Run this command in your terminal (replace `YOUR_KEY_HERE` with your actual key):

```bash
flyctl secrets set RESEND_API_KEY="YOUR_KEY_HERE" -a school-backend
```

**Example:**
```bash
flyctl secrets set RESEND_API_KEY="re_fkdK8Eyu_abc123xyz" -a school-backend
```

### Step 3: Test It Works

```bash
curl -X POST https://school-backend.fly.dev/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

If you get a success response, it's working!

---

## That's It!

You don't need to open any HTML files. Just:
1. Copy your key from Resend
2. Run the `flyctl secrets set` command
3. Done!

The key is now saved in Fly.io and your backend will use it.
