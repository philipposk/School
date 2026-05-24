# 🚀 Quick Setup: Backend Proxy for Shared API Keys

This guide shows you how to set up a backend proxy so **all users** can use AI features without needing their own API keys.

---

## Option 1: Railway (Easiest) ⭐

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

### Step 2: Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select your School repository
3. Railway will auto-detect Node.js

### Step 3: Set Environment Variables
1. Go to your project → Variables
2. Add:
   - `GROQ_API_KEY` = `your-groq-key-here`
   - `OPENAI_API_KEY` = `your-openai-key-here`
   - `PORT` = `3000` (optional, Railway sets this automatically)

### Step 4: Get Your Backend URL
- Railway gives you a URL like: `https://your-app.up.railway.app`
- Copy this URL

### Step 5: Update Frontend
Update `js/ai-config.js` to use your backend:

```javascript
// Change from direct API calls to proxy calls
const BACKEND_URL = 'https://your-app.up.railway.app'; // Your Railway URL

async callGroqAPI(messages, options = {}) {
    const response = await fetch(`${BACKEND_URL}/api/ai/groq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, options })
    });
    
    if (!response.ok) {
        throw new Error('API error');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}
```

---

## Option 2: Render (Free Tier)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. Settings:
   - **Name**: `school-ai-proxy`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (or leave empty)

### Step 3: Set Environment Variables
1. Go to "Environment" tab
2. Add:
   - `GROQ_API_KEY`
   - `OPENAI_API_KEY`

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment
3. Copy your URL: `https://school-ai-proxy.onrender.com`

---

## Option 3: Fly.io (Fastest)

### Step 1: Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login
```bash
fly auth login
```

### Step 3: Create App
```bash
fly launch
```

### Step 4: Set Secrets
```bash
fly secrets set GROQ_API_KEY=your-key-here
fly secrets set OPENAI_API_KEY=your-key-here
```

### Step 5: Deploy
```bash
fly deploy
```

---

## Option 4: Vercel Serverless Functions

### Step 1: Create `api/ai-proxy.js`
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, provider } = req.body;
  const apiKey = provider === 'groq' 
    ? process.env.GROQ_API_KEY 
    : process.env.OPENAI_API_KEY;

  const endpoint = provider === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ messages })
  });

  const data = await response.json();
  res.json(data);
}
```

### Step 2: Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Step 3: Set Environment Variables
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `GROQ_API_KEY` and `OPENAI_API_KEY`

---

## Testing Your Backend

### Test with curl:
```bash
curl -X POST https://your-backend-url.com/api/ai/groq \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Expected Response:
```json
{
  "choices": [{
    "message": {
      "content": "Hello! How can I help you today?"
    }
  }]
}
```

---

## Cost Estimates

### Free Tiers:
- **Railway**: $5 credit/month (enough for small apps)
- **Render**: Free tier (spins down after 15min inactivity)
- **Fly.io**: Free tier (3 shared VMs)
- **Vercel**: Free tier (100GB bandwidth/month)

### API Costs:
- **Groq**: Free tier available (very generous)
- **OpenAI**: ~$0.15 per 1M tokens (GPT-4o-mini)

---

## Security Notes

✅ **DO**:
- Store API keys in environment variables (never in code)
- Use HTTPS (all platforms provide this)
- Add rate limiting (prevent abuse)
- Monitor usage (set up alerts)

❌ **DON'T**:
- Commit API keys to Git
- Expose API keys in frontend code
- Allow unlimited requests (add rate limiting)

---

## Next Steps

1. ✅ Deploy backend proxy
2. ✅ Update frontend to use proxy
3. ✅ Test AI features work for all users
4. ✅ Add rate limiting (prevent abuse)
5. ✅ Monitor costs and usage

---

## Need Help?

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Fly.io Docs**: https://fly.io/docs
- **Vercel Docs**: https://vercel.com/docs

