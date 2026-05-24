# ⚡ Cloudflare Workers Setup Guide - Easy Step-by-Step

**Yes, Cloudflare Workers is easy to setup!** Here's a complete guide.

---

## Why Cloudflare Workers?

✅ **Ultra-fast** - Runs on Cloudflare's edge network (200+ locations worldwide)  
✅ **Free tier** - 100,000 requests/day free  
✅ **No cold starts** - Instant responses  
✅ **Auto-scaling** - Handles traffic spikes automatically  
✅ **Simple** - Just JavaScript, no server management  

**Perfect for**: API proxies, edge functions, fast responses

---

## Step 1: Create Cloudflare Account (2 minutes)

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (free)
3. Verify your email

---

## Step 2: Install Wrangler CLI (1 minute)

**macOS:**
```bash
brew install cloudflare/wrangler/wrangler
```

**Or with npm:**
```bash
npm install -g wrangler
```

**Or with curl:**
```bash
curl -L https://github.com/cloudflare/workers-sdk/releases/latest/download/wrangler-darwin-amd64 -o wrangler
chmod +x wrangler
sudo mv wrangler /usr/local/bin/
```

---

## Step 3: Login to Cloudflare (30 seconds)

```bash
wrangler login
```

This opens your browser - click "Allow" to authorize.

---

## Step 4: Create Worker Project (1 minute)

```bash
# Create new directory
mkdir school-backend-worker
cd school-backend-worker

# Initialize worker
wrangler init school-backend
```

Choose:
- ✅ **Yes** to TypeScript (optional, but recommended)
- ✅ **Fetch handler** (for API requests)

---

## Step 5: Create Worker Code (5 minutes)

Create `src/index.ts`:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI Proxy - Groq
    if (url.pathname === '/api/ai/groq' && request.method === 'POST') {
      const { messages, options = {} } = await request.json();
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: options.model || 'llama-3.1-70b-versatile',
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
        })
      });

      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // AI Proxy - OpenAI
    if (url.pathname === '/api/ai/openai' && request.method === 'POST') {
      const { messages, options = {} } = await request.json();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4o-mini',
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2000,
        })
      });

      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Email notifications - Resend
    if (url.pathname === '/api/notifications/email' && request.method === 'POST') {
      const { to, subject, html } = await request.json();
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'School Platform <onboarding@resend.dev>',
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        })
      });

      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Welcome email
    if (url.pathname === '/api/notifications/welcome' && request.method === 'POST') {
      const { email, name } = await request.json();
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head><style>body{font-family:Arial;line-height:1.6;color:#333;}</style></head>
        <body>
          <h1>🎓 Welcome to School Platform!</h1>
          <h2>Hi ${name}!</h2>
          <p>Welcome to our learning platform! We're excited to have you join us.</p>
          <p>Get started by exploring our courses and begin your learning journey today.</p>
          <a href="${env.FRONTEND_URL || 'https://school.6x7.gr'}" style="display:inline-block;padding:12px 30px;background:#667eea;color:white;text-decoration:none;border-radius:5px;margin-top:20px;">Start Learning</a>
        </body>
        </html>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'School Platform <onboarding@resend.dev>',
          to: email,
          subject: 'Welcome to School Platform! 🎓',
          html,
        })
      });

      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};

interface Env {
  GROQ_API_KEY: string;
  OPENAI_API_KEY: string;
  RESEND_API_KEY: string;
  FRONTEND_URL?: string;
}
```

---

## Step 6: Configure Wrangler (1 minute)

Create/update `wrangler.toml`:

```toml
name = "school-backend"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Secrets are set via CLI (see next step)
```

---

## Step 7: Set Secrets (1 minute)

```bash
# Set your API keys as secrets
wrangler secret put GROQ_API_KEY
# (paste your key when prompted)

wrangler secret put OPENAI_API_KEY
# (paste your key when prompted)

wrangler secret put RESEND_API_KEY
# (paste your key when prompted)

wrangler secret put FRONTEND_URL
# (paste: https://school.6x7.gr)
```

**Note**: Secrets are encrypted and only available in your worker code via `env.SECRET_NAME`.

---

## Step 8: Deploy (30 seconds)

```bash
wrangler deploy
```

That's it! You'll get a URL like: `https://school-backend.your-subdomain.workers.dev`

---

## Step 9: Test (1 minute)

```bash
# Test health endpoint
curl https://school-backend.your-subdomain.workers.dev/health

# Test AI proxy
curl -X POST https://school-backend.your-subdomain.workers.dev/api/ai/groq \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

---

## Step 10: Update Frontend

In your frontend Settings, add the Worker URL:

```javascript
localStorage.setItem('backend_url', 'https://school-backend.your-subdomain.workers.dev');
```

Or update `js/ai-config.js` default:

```javascript
backendUrl: localStorage.getItem('backend_url') || 'https://school-backend.your-subdomain.workers.dev',
```

---

## Custom Domain (Optional - 5 minutes)

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click your worker → Settings → Triggers
3. Add Custom Domain
4. Enter: `api.school.6x7.gr`
5. Cloudflare automatically configures DNS

Now use: `https://api.school.6x7.gr` instead of the `.workers.dev` URL!

---

## Project Structure

```
school-backend-worker/
├── src/
│   └── index.ts          # Your worker code
├── wrangler.toml         # Worker configuration
├── package.json          # Dependencies (if any)
└── tsconfig.json         # TypeScript config
```

---

## Advantages of Cloudflare Workers

✅ **Ultra-fast** - Runs on edge network (closest to users)  
✅ **No cold starts** - Always ready  
✅ **Free tier** - 100k requests/day  
✅ **Auto-scaling** - Handles any traffic  
✅ **Simple** - Just JavaScript  
✅ **Global** - Runs in 200+ cities  

---

## Limitations

⚠️ **CPU time limit**: 10ms CPU time per request (but can wait for I/O)  
⚠️ **Memory**: 128MB limit  
⚠️ **Request size**: 100MB limit  
⚠️ **Duration**: 30 seconds max per request  

**For your use case**: These limits are fine! AI API calls are I/O-bound (waiting for responses), not CPU-bound.

---

## Pricing

**Free Tier:**
- 100,000 requests/day
- Unlimited bandwidth
- Perfect for most apps!

**Paid:**
- $5/month for 10M requests
- $0.50 per million additional requests

---

## Troubleshooting

### "wrangler: command not found"
```bash
# Install wrangler
npm install -g wrangler
# or
brew install cloudflare/wrangler/wrangler
```

### "Authentication error"
```bash
# Re-login
wrangler login
```

### "Secret not found"
```bash
# List secrets
wrangler secret list

# Set secret again
wrangler secret put SECRET_NAME
```

### "Deploy failed"
- Check your code syntax
- Make sure you're in the worker directory
- Check `wrangler.toml` exists

---

## Comparison: Workers vs Railway/Render

| Feature | Cloudflare Workers | Railway/Render |
|---------|-------------------|----------------|
| **Speed** | ⚡⚡⚡⚡⚡ (Edge) | ⚡⚡⚡ (Single region) |
| **Setup** | ⭐⭐⭐⭐ (CLI) | ⭐⭐⭐⭐⭐ (Web UI) |
| **Free Tier** | 100k/day | $5 credit / Free (sleeps) |
| **Scaling** | Auto (edge) | Auto (single server) |
| **Cold Starts** | None | Possible |
| **Cost** | $5/month | $5-20/month |

---

## My Recommendation

**Cloudflare Workers is GREAT if:**
- ✅ You want fastest possible responses
- ✅ You're comfortable with CLI
- ✅ You want edge computing benefits
- ✅ You want generous free tier

**Use Railway/Render if:**
- ✅ You want web UI setup (no CLI)
- ✅ You need longer request times (>30s)
- ✅ You need more memory (>128MB)
- ✅ You prefer traditional server setup

---

## Quick Start Summary

```bash
# 1. Install
npm install -g wrangler

# 2. Login
wrangler login

# 3. Create project
wrangler init school-backend

# 4. Add code to src/index.ts (see above)

# 5. Set secrets
wrangler secret put GROQ_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put RESEND_API_KEY

# 6. Deploy
wrangler deploy

# 7. Done! Use the URL in your frontend
```

**Total time: ~10 minutes** ⚡

---

## Need Help?

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler
- **Examples**: https://github.com/cloudflare/workers-examples

**Yes, it's easy!** Just follow the steps above. 🚀

