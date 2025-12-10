# 🆓 Task 2: Deploy Backend on Fly.io (FREE + NO Cold Starts!)

## Why Fly.io?

- ✅ **FREE FOREVER** - No payment, no trial expiration
- ✅ **NO COLD STARTS** - Always running! ⚡
- ✅ **Full Node.js support** - Works perfectly
- ✅ **Easy deployment** - Similar to Railway/Render
- ✅ **3 VMs included** - Enough for your backend

**This is the BEST free option with no cold starts!** 🎉

---

## Step-by-Step: Fly.io Deployment

### STEP 1: Install Fly CLI (2 min)

**macOS:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Or via Homebrew:**
```bash
brew install flyctl
```

**Verify installation:**
```bash
fly version
```

✅ **Done when**: `fly version` shows version number

---

### STEP 2: Sign Up for Fly.io (2 min)

1. **Run**:
   ```bash
   fly auth signup
   ```
2. **Opens browser** → Sign up with GitHub/Email
3. **Verify** email if needed
4. **Return to terminal** → Should see "Successfully logged in"

✅ **Done when**: Terminal shows "Successfully logged in"

---

### STEP 3: Navigate to Backend Directory (1 min)

```bash
cd "/Users/phktistakis/Devoloper Projects/School"
```

**Verify** `backend-proxy-example.js` exists:
```bash
ls backend-proxy-example.js
```

✅ **Done when**: File exists

---

### STEP 4: Create Fly.io App (3 min)

**Run:**
```bash
fly launch
```

**It will ask:**
1. **App name**: `school-backend` (or press Enter for auto-generated)
2. **Region**: Choose closest (e.g., `iad` for US East, `fra` for Frankfurt)
3. **Postgres?**: `n` (you're using Supabase)
4. **Redis?**: `n` (not needed)
5. **Deploy now?**: `n` (we'll configure first)

✅ **Done when**: `fly.toml` file is created

---

### STEP 5: Configure fly.toml (5 min)

**Open** `fly.toml` in your editor:

**Should look like:**
```toml
app = "school-backend"
primary_region = "iad"

[build]

[env]
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

**Important settings:**
- `auto_stop_machines = false` → Keeps server running (no cold starts!)
- `min_machines_running = 1` → Always 1 VM running
- `memory_mb = 256` → Free tier limit

✅ **Done when**: `fly.toml` configured

---

### STEP 6: Create Dockerfile (5 min)

**Create** `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY backend-proxy-example.js ./

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "backend-proxy-example.js"]
```

**Save** as `Dockerfile` (no extension)

✅ **Done when**: `Dockerfile` created

---

### STEP 7: Set Environment Variables (10 min)

**Set each variable:**

```bash
fly secrets set GROQ_API_KEY="your-groq-key"
fly secrets set OPENAI_API_KEY="your-openai-key"
fly secrets set RESEND_API_KEY="your-resend-key"
fly secrets set SUPABASE_URL="https://jmjezmfhygvazfunuujt.supabase.co"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
fly secrets set STRIPE_SECRET_KEY="sk_..."
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
fly secrets set STRIPE_MONTHLY_PRICE_ID="price_..."
fly secrets set STRIPE_YEARLY_PRICE_ID="price_..."
fly secrets set FRONTEND_URL="https://school.6x7.gr"
fly secrets set PORT="3000"
```

**Replace** values with your actual keys!

✅ **Done when**: All secrets set (no errors)

---

### STEP 8: Deploy! (5-10 min)

**Run:**
```bash
fly deploy
```

**What happens:**
1. Builds Docker image
2. Uploads to Fly.io
3. Starts your app
4. Shows URL: `https://school-backend.fly.dev`

**Watch logs** - Should see:
```
🚀 Backend Server running on port 3000
📝 Groq API: ✅ Configured
📧 Resend Email: ✅ Configured
```

✅ **Done when**: Deployment succeeds, URL shown

---

### STEP 9: Get Your Backend URL (1 min)

**After deployment**, you'll see:
```
==> App is deployed!
   URL: https://school-backend.fly.dev
```

**Copy this URL!**

✅ **Done when**: You have URL like `https://xxx.fly.dev`

---

### STEP 10: Test Backend (2 min)

**Test health endpoint:**
```bash
curl https://school-backend.fly.dev/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2024-01-09T..."}
```

**First request**: Should be INSTANT! ⚡ (No cold start!)

✅ **Done when**: Health check returns `{"status":"ok"}`

---

### STEP 11: Add Backend URL to Frontend (2 min)

**In browser console** (on your site):
```javascript
localStorage.setItem('backend_url', 'https://school-backend.fly.dev');
```

**Or via Settings UI**:
1. Open your site
2. Click Settings (⚙️)
3. Find "Backend Configuration"
4. Enter your Fly.io URL
5. Click Save

✅ **Done when**: Backend URL is saved

---

### STEP 12: Test Email Confirmation (5 min)

1. **Open** your site
2. **Click** "Sign In" → "Sign up"
3. **Enter**: Name, Email, Password
4. **Submit** → Should show confirmation form
5. **Check email** for 6-digit code
6. **Enter code** → Should verify and log you in

**Note**: Should be INSTANT! ⚡ No cold start delay!

---

## 🎉 Success Checklist

- [ ] Fly CLI installed
- [ ] Fly.io account created
- [ ] App created (`fly launch`)
- [ ] `fly.toml` configured (auto_stop_machines = false)
- [ ] `Dockerfile` created
- [ ] All environment variables set (`fly secrets set`)
- [ ] App deployed (`fly deploy`)
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Backend URL added to frontend
- [ ] Email confirmation tested

---

## 🧊 About Cold Starts (Fly.io)

### What Happens:
- ✅ **Server ALWAYS running** → No sleep! ⚡
- ✅ **First request**: INSTANT! (No delay)
- ✅ **All requests**: Fast! (No cold starts)

### Why No Cold Starts?
- `auto_stop_machines = false` → Server never sleeps
- `min_machines_running = 1` → Always 1 VM active
- **Free tier** = 3 VMs, but you only need 1!

---

## 💰 Cost: FREE Forever!

**Free Tier Includes:**
- ✅ **3 shared VMs**
- ✅ **256MB RAM** per VM
- ✅ **3GB storage** per VM
- ✅ **160GB outbound data** per month
- ✅ **NO cold starts** (always running)

**Your Backend Needs:**
- ✅ **1 VM** = Enough! (~$0/month)
- ✅ **256MB RAM** = Fine for Node.js
- ✅ **160GB bandwidth** = Plenty for 100+ users

**Total Cost: $0/month** ✅

---

## 🐛 Troubleshooting

### Deployment Fails?
- **Check** `Dockerfile` exists ✅
- **Verify** `package.json` exists ✅
- **Check** logs: `fly logs`

### Secrets Not Working?
- **Verify** names are EXACT (case-sensitive)
- **Check** secrets: `fly secrets list`
- **Redeploy** after adding secrets

### App Won't Start?
- **Check** logs: `fly logs`
- **Verify** PORT is set correctly
- **Check** `fly.toml` configuration

### Cold Starts Still Happening?
- **Check** `fly.toml`: `auto_stop_machines = false`
- **Verify** `min_machines_running = 1`
- **Check** status: `fly status`

---

## 📊 Comparison

| Feature | Fly.io Free | Render Free | Railway |
|---------|-------------|-------------|---------|
| **Cost** | **$0/mo** ✅ | $0/mo ✅ | $5/mo |
| **Cold Starts** | **❌ No** ✅ | ⚠️ Yes | ❌ No |
| **Always Running** | **✅ Yes** ✅ | ❌ No | ✅ Yes |
| **Setup** | Easy | Easy | Easy |

**Fly.io = Best free option with no cold starts!** 🎉

---

## ⏱️ Time Estimate

- **Total**: 30-40 minutes
- **First deploy**: 5-10 minutes
- **Subsequent deploys**: 2-3 minutes

---

## 🎯 What This Enables

After deployment:
- ✅ Email confirmation works
- ✅ Payments work (Stripe)
- ✅ Reminders send notifications
- ✅ AI features use backend
- ✅ **NO COLD STARTS!** ⚡
- ✅ **ALL FREE!** 🎉

---

## 📚 Next Steps

After backend is deployed:
- **Task 3**: Configure Supabase OAuth
- **Task 4**: Set up Stripe products
- **Task 5**: Test everything

---

## 🚀 Quick Commands Reference

```bash
# Deploy
fly deploy

# View logs
fly logs

# Check status
fly status

# List secrets
fly secrets list

# Set secret
fly secrets set KEY="value"

# Open app
fly open
```

---

**Ready to deploy? Follow the steps above!** 🚀

**Remember**: Fly.io is FREE + NO cold starts! ✅


## Why Fly.io?

- ✅ **FREE FOREVER** - No payment, no trial expiration
- ✅ **NO COLD STARTS** - Always running! ⚡
- ✅ **Full Node.js support** - Works perfectly
- ✅ **Easy deployment** - Similar to Railway/Render
- ✅ **3 VMs included** - Enough for your backend

**This is the BEST free option with no cold starts!** 🎉

---

## Step-by-Step: Fly.io Deployment

### STEP 1: Install Fly CLI (2 min)

**macOS:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Or via Homebrew:**
```bash
brew install flyctl
```

**Verify installation:**
```bash
fly version
```

✅ **Done when**: `fly version` shows version number

---

### STEP 2: Sign Up for Fly.io (2 min)

1. **Run**:
   ```bash
   fly auth signup
   ```
2. **Opens browser** → Sign up with GitHub/Email
3. **Verify** email if needed
4. **Return to terminal** → Should see "Successfully logged in"

✅ **Done when**: Terminal shows "Successfully logged in"

---

### STEP 3: Navigate to Backend Directory (1 min)

```bash
cd "/Users/phktistakis/Devoloper Projects/School"
```

**Verify** `backend-proxy-example.js` exists:
```bash
ls backend-proxy-example.js
```

✅ **Done when**: File exists

---

### STEP 4: Create Fly.io App (3 min)

**Run:**
```bash
fly launch
```

**It will ask:**
1. **App name**: `school-backend` (or press Enter for auto-generated)
2. **Region**: Choose closest (e.g., `iad` for US East, `fra` for Frankfurt)
3. **Postgres?**: `n` (you're using Supabase)
4. **Redis?**: `n` (not needed)
5. **Deploy now?**: `n` (we'll configure first)

✅ **Done when**: `fly.toml` file is created

---

### STEP 5: Configure fly.toml (5 min)

**Open** `fly.toml` in your editor:

**Should look like:**
```toml
app = "school-backend"
primary_region = "iad"

[build]

[env]
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

**Important settings:**
- `auto_stop_machines = false` → Keeps server running (no cold starts!)
- `min_machines_running = 1` → Always 1 VM running
- `memory_mb = 256` → Free tier limit

✅ **Done when**: `fly.toml` configured

---

### STEP 6: Create Dockerfile (5 min)

**Create** `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY backend-proxy-example.js ./

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "backend-proxy-example.js"]
```

**Save** as `Dockerfile` (no extension)

✅ **Done when**: `Dockerfile` created

---

### STEP 7: Set Environment Variables (10 min)

**Set each variable:**

```bash
fly secrets set GROQ_API_KEY="your-groq-key"
fly secrets set OPENAI_API_KEY="your-openai-key"
fly secrets set RESEND_API_KEY="your-resend-key"
fly secrets set SUPABASE_URL="https://jmjezmfhygvazfunuujt.supabase.co"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
fly secrets set STRIPE_SECRET_KEY="sk_..."
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
fly secrets set STRIPE_MONTHLY_PRICE_ID="price_..."
fly secrets set STRIPE_YEARLY_PRICE_ID="price_..."
fly secrets set FRONTEND_URL="https://school.6x7.gr"
fly secrets set PORT="3000"
```

**Replace** values with your actual keys!

✅ **Done when**: All secrets set (no errors)

---

### STEP 8: Deploy! (5-10 min)

**Run:**
```bash
fly deploy
```

**What happens:**
1. Builds Docker image
2. Uploads to Fly.io
3. Starts your app
4. Shows URL: `https://school-backend.fly.dev`

**Watch logs** - Should see:
```
🚀 Backend Server running on port 3000
📝 Groq API: ✅ Configured
📧 Resend Email: ✅ Configured
```

✅ **Done when**: Deployment succeeds, URL shown

---

### STEP 9: Get Your Backend URL (1 min)

**After deployment**, you'll see:
```
==> App is deployed!
   URL: https://school-backend.fly.dev
```

**Copy this URL!**

✅ **Done when**: You have URL like `https://xxx.fly.dev`

---

### STEP 10: Test Backend (2 min)

**Test health endpoint:**
```bash
curl https://school-backend.fly.dev/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2024-01-09T..."}
```

**First request**: Should be INSTANT! ⚡ (No cold start!)

✅ **Done when**: Health check returns `{"status":"ok"}`

---

### STEP 11: Add Backend URL to Frontend (2 min)

**In browser console** (on your site):
```javascript
localStorage.setItem('backend_url', 'https://school-backend.fly.dev');
```

**Or via Settings UI**:
1. Open your site
2. Click Settings (⚙️)
3. Find "Backend Configuration"
4. Enter your Fly.io URL
5. Click Save

✅ **Done when**: Backend URL is saved

---

### STEP 12: Test Email Confirmation (5 min)

1. **Open** your site
2. **Click** "Sign In" → "Sign up"
3. **Enter**: Name, Email, Password
4. **Submit** → Should show confirmation form
5. **Check email** for 6-digit code
6. **Enter code** → Should verify and log you in

**Note**: Should be INSTANT! ⚡ No cold start delay!

---

## 🎉 Success Checklist

- [ ] Fly CLI installed
- [ ] Fly.io account created
- [ ] App created (`fly launch`)
- [ ] `fly.toml` configured (auto_stop_machines = false)
- [ ] `Dockerfile` created
- [ ] All environment variables set (`fly secrets set`)
- [ ] App deployed (`fly deploy`)
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Backend URL added to frontend
- [ ] Email confirmation tested

---

## 🧊 About Cold Starts (Fly.io)

### What Happens:
- ✅ **Server ALWAYS running** → No sleep! ⚡
- ✅ **First request**: INSTANT! (No delay)
- ✅ **All requests**: Fast! (No cold starts)

### Why No Cold Starts?
- `auto_stop_machines = false` → Server never sleeps
- `min_machines_running = 1` → Always 1 VM active
- **Free tier** = 3 VMs, but you only need 1!

---

## 💰 Cost: FREE Forever!

**Free Tier Includes:**
- ✅ **3 shared VMs**
- ✅ **256MB RAM** per VM
- ✅ **3GB storage** per VM
- ✅ **160GB outbound data** per month
- ✅ **NO cold starts** (always running)

**Your Backend Needs:**
- ✅ **1 VM** = Enough! (~$0/month)
- ✅ **256MB RAM** = Fine for Node.js
- ✅ **160GB bandwidth** = Plenty for 100+ users

**Total Cost: $0/month** ✅

---

## 🐛 Troubleshooting

### Deployment Fails?
- **Check** `Dockerfile` exists ✅
- **Verify** `package.json` exists ✅
- **Check** logs: `fly logs`

### Secrets Not Working?
- **Verify** names are EXACT (case-sensitive)
- **Check** secrets: `fly secrets list`
- **Redeploy** after adding secrets

### App Won't Start?
- **Check** logs: `fly logs`
- **Verify** PORT is set correctly
- **Check** `fly.toml` configuration

### Cold Starts Still Happening?
- **Check** `fly.toml`: `auto_stop_machines = false`
- **Verify** `min_machines_running = 1`
- **Check** status: `fly status`

---

## 📊 Comparison

| Feature | Fly.io Free | Render Free | Railway |
|---------|-------------|-------------|---------|
| **Cost** | **$0/mo** ✅ | $0/mo ✅ | $5/mo |
| **Cold Starts** | **❌ No** ✅ | ⚠️ Yes | ❌ No |
| **Always Running** | **✅ Yes** ✅ | ❌ No | ✅ Yes |
| **Setup** | Easy | Easy | Easy |

**Fly.io = Best free option with no cold starts!** 🎉

---

## ⏱️ Time Estimate

- **Total**: 30-40 minutes
- **First deploy**: 5-10 minutes
- **Subsequent deploys**: 2-3 minutes

---

## 🎯 What This Enables

After deployment:
- ✅ Email confirmation works
- ✅ Payments work (Stripe)
- ✅ Reminders send notifications
- ✅ AI features use backend
- ✅ **NO COLD STARTS!** ⚡
- ✅ **ALL FREE!** 🎉

---

## 📚 Next Steps

After backend is deployed:
- **Task 3**: Configure Supabase OAuth
- **Task 4**: Set up Stripe products
- **Task 5**: Test everything

---

## 🚀 Quick Commands Reference

```bash
# Deploy
fly deploy

# View logs
fly logs

# Check status
fly status

# List secrets
fly secrets list

# Set secret
fly secrets set KEY="value"

# Open app
fly open
```

---

**Ready to deploy? Follow the steps above!** 🚀

**Remember**: Fly.io is FREE + NO cold starts! ✅

