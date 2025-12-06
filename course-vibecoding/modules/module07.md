# Module 7: Integration & Deployment

## Title: Connecting APIs and Shipping to Production

### Lecture Content

Your application is built and tested. Now it's time to connect it to real services and deploy it to production. This module covers API integrations, environment configuration, and deployment strategies.

#### 1. Connecting External APIs

**Types of Integrations:**

**Authentication APIs:**
- Auth0, Firebase Auth, Clerk
- OAuth providers (Google, GitHub)
- Custom JWT systems

**Database Services:**
- Supabase, Firebase
- MongoDB Atlas
- PostgreSQL (Railway, Neon)

**Payment APIs:**
- Stripe, PayPal
- Payment processing

**Communication APIs:**
- SendGrid, Resend (email)
- Twilio (SMS)
- Webhooks

**Storage APIs:**
- AWS S3, Cloudflare R2
- Image hosting (Cloudinary)

#### 2. Environment Configuration

**Environment Variables:**

**Local Development (.env.local):**
```env
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=dev-key-123
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Production (.env.production):**
```env
DATABASE_URL=postgresql://prod-server:5432/mydb
API_KEY=prod-key-456
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_URL=https://myapp.com
```

**Best Practices:**
- Never commit .env files
- Use .env.example as template
- Use different keys for dev/prod
- Keep secrets secure
- Use environment-specific configs

#### 3. API Integration Patterns

**Pattern 1: Direct API Calls**

**Frontend to External API:**
```typescript
// Client-side API call
const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
});
```

**Pattern 2: Backend Proxy**

**Frontend → Backend → External API:**
```typescript
// Backend API route
export async function POST(request: Request) {
  const apiKey = process.env.EXTERNAL_API_KEY;
  const response = await fetch('https://api.example.com/data', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  return response.json();
}
```

**Why Use Backend Proxy:**
- Keeps API keys secret
- Better security
- Rate limiting
- Error handling

#### 4. Deployment Platforms

**Frontend Deployment:**

**Vercel:**
- Best for Next.js
- Automatic deployments
- Free tier available
- Easy setup

**Netlify:**
- Great for static sites
- Serverless functions
- Free tier available
- Good documentation

**Cloudflare Pages:**
- Fast CDN
- Free tier
- Good performance

**Backend Deployment:**

**Railway:**
- Easy PostgreSQL setup
- Good for Node.js
- Simple deployment

**Render:**
- Free tier available
- Good documentation
- PostgreSQL included

**Fly.io:**
- Global distribution
- Good performance
- Docker-based

#### 5. Deployment Workflow

**Step-by-Step Process:**

**Step 1: Prepare for Deployment**
```bash
# Build the application
npm run build

# Test the build locally
npm start
```

**Step 2: Set Up Environment Variables**
- Add production environment variables
- Verify all secrets are set
- Test API connections

**Step 3: Deploy**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Or use Git integration (automatic)
```

**Step 4: Verify**
- Check deployed URL
- Test key features
- Monitor for errors

#### 6. Vercel Deployment

**Setting Up Vercel:**

**Installation:**
```bash
npm i -g vercel
```

**Login:**
```bash
vercel login
```

**Deploy:**
```bash
vercel
```

**Production Deploy:**
```bash
vercel --prod
```

**Environment Variables:**
- Set in Vercel dashboard
- Or use vercel env commands
- Different for preview/production

**Git Integration:**
- Connect GitHub repository
- Automatic deployments on push
- Preview deployments for PRs

#### 7. Netlify Deployment

**Setting Up Netlify:**

**Installation:**
```bash
npm i -g netlify-cli
```

**Login:**
```bash
netlify login
```

**Deploy:**
```bash
netlify deploy
```

**Production Deploy:**
```bash
netlify deploy --prod
```

**Configuration (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 8. Database Setup

**Setting Up Production Database:**

**Supabase:**
1. Create account
2. Create new project
3. Get connection string
4. Update environment variables
5. Run migrations

**MongoDB Atlas:**
1. Create account
2. Create cluster
3. Get connection string
4. Whitelist IP addresses
5. Update environment variables

**Railway PostgreSQL:**
1. Create Railway account
2. Create PostgreSQL service
3. Get connection string
4. Update environment variables

#### 9. CI/CD Pipelines

**Automated Deployment:**

**GitHub Actions Example:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
      - uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

**Benefits:**
- Automatic testing
- Automatic deployment
- Consistent process
- Error prevention

#### 10. Post-Deployment Checklist

**Things to Verify:**

✅ **Functionality:**
- All features work
- Forms submit correctly
- API calls succeed
- Authentication works

✅ **Performance:**
- Page load times acceptable
- Images optimized
- Code minified
- CDN working

✅ **Security:**
- HTTPS enabled
- API keys secure
- No sensitive data exposed
- CORS configured correctly

✅ **Monitoring:**
- Error tracking set up
- Analytics configured
- Uptime monitoring
- Performance monitoring

### Exercises (Complete all 5)

1. **API Integration:** Connect your app to one external API (e.g., weather API, news API).

2. **Environment Setup:** Create .env files for development and production.

3. **Deploy to Vercel:** Deploy a simple app to Vercel.

4. **Database Setup:** Set up a production database (Supabase or MongoDB Atlas).

5. **CI/CD:** Set up GitHub Actions for automatic deployment.

### Assignment (600–800 words)

**Deploy Complete Application**

Deploy the application you've been building throughout the course:

1. **Set up production database**
2. **Configure environment variables**
3. **Deploy frontend** (Vercel/Netlify)
4. **Deploy backend** (Railway/Render)
5. **Connect APIs** (at least one external API)
6. **Set up monitoring** (error tracking, analytics)

**Deliverables:**
1. Live deployed application URL
2. GitHub repository with deployment configs
3. Documentation of deployment process
4. Reflection on:
   - Challenges encountered
   - What worked well
   - Production considerations
   - Monitoring and maintenance

**Submission Format:** Live URL + GitHub repo + written documentation

### Quiz Questions

**Multiple Choice:**

1. Environment variables should be:
   a) Committed to Git
   b) Kept secret and secure ✓
   c) Shared publicly
   d) Hardcoded in code

2. Backend proxy is used to:
   a) Slow down requests
   b) Keep API keys secret ✓
   c) Add complexity
   d) Skip security

3. Vercel is best for:
   a) Backend only
   b) Next.js applications ✓
   c) Databases
   d) APIs only

4. Production database should:
   a) Use local database
   b) Use cloud service ✓
   c) Not exist
   d) Be public

5. CI/CD helps with:
   a) Manual deployment
   b) Automated deployment ✓
   c) Skipping tests
   d) Nothing

6. Post-deployment you should:
   a) Forget about it
   b) Monitor and verify ✓
   c) Delete code
   d) Skip testing

**Short Answer:**

7. Why use environment variables instead of hardcoding secrets?

8. What's the difference between frontend and backend deployment?

9. Why use a backend proxy for external API calls?

10. What should you check after deploying to production?

### Reading Materials
- "Deployment Best Practices" (PDF provided)
- Platform-specific deployment guides
- API integration patterns

### Resources
- Deployment platform comparison
- Environment variable management guide
- CI/CD setup templates
- Post-deployment checklist

**Next Steps:** Complete exercises before proceeding to Module 8: Advanced Techniques & Final Project.

