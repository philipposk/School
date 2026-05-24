# 📧 Email Service Options - Complete Guide

Here are **10 different options** for sending emails, from easiest to most advanced.

---

## Quick Comparison

| Service | Free Tier | Paid Starting | Ease | Best For |
|---------|-----------|---------------|------|----------|
| **Resend** | 3,000/mo | $20/month | ⭐⭐⭐⭐⭐ | Modern, developer-friendly |
| **SendGrid** | 100/day | $15/month | ⭐⭐⭐⭐ | Popular, reliable |
| **Mailgun** | 5,000/mo | $35/month | ⭐⭐⭐⭐ | Transactional emails |
| **Postmark** | 100/mo | $15/month | ⭐⭐⭐⭐⭐ | Best deliverability |
| **AWS SES** | 62,000/mo | $0.10/1k | ⭐⭐⭐ | Cheap at scale |
| **Postal** | Self-hosted | Free | ⭐⭐ | Self-hosted |
| **Brevo** | 300/day | $9/month | ⭐⭐⭐⭐ | Good free tier |
| **Mailjet** | 6,000/mo | $15/month | ⭐⭐⭐⭐ | Marketing + transactional |
| **Nodemailer** | Free | Free | ⭐⭐⭐ | SMTP only |
| **Supabase** | Built-in | Free | ⭐⭐⭐⭐⭐ | If using Supabase |

---

## Option 1: Resend ⭐ (Recommended - Modern)

**Best for**: Modern apps, great developer experience

### Setup:
1. Go to https://resend.com
2. Sign up (free tier: 3,000 emails/month)
3. Get API key from dashboard
4. Add to backend: `RESEND_API_KEY=re_...`

### Code:
```javascript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${RESEND_API_KEY}`
  },
  body: JSON.stringify({
    from: 'School Platform <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome!',
    html: '<h1>Welcome!</h1>'
  })
});
```

**Pricing**: 3,000 emails/month free, then $20/month for 50k  
**Pros**: Modern API, great docs, good deliverability  
**Cons**: Newer service (less established)

---

## Option 2: SendGrid (Most Popular)

**Best for**: Established apps, reliability

### Setup:
1. Go to https://sendgrid.com
2. Sign up (free tier: 100 emails/day)
3. Create API key: Settings → API Keys → Create
4. Add to backend: `SENDGRID_API_KEY=SG....`

### Code:
```javascript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SENDGRID_API_KEY}`
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: email }]
    }],
    from: { email: 'noreply@school.6x7.gr' },
    subject: 'Welcome!',
    content: [{
      type: 'text/html',
      value: '<h1>Welcome!</h1>'
    }]
  })
});
```

**Pricing**: 100 emails/day free, then $15/month for 40k  
**Pros**: Very popular, reliable, good docs  
**Cons**: API is more verbose

---

## Option 3: Mailgun (Great for Transactional)

**Best for**: Transactional emails, high volume

### Setup:
1. Go to https://www.mailgun.com
2. Sign up (free tier: 5,000 emails/month)
3. Verify domain (required)
4. Get API key from dashboard
5. Add to backend: `MAILGUN_API_KEY=...`

### Code:
```javascript
const formData = new URLSearchParams();
formData.append('from', 'School Platform <noreply@school.6x7.gr>');
formData.append('to', email);
formData.append('subject', 'Welcome!');
formData.append('html', '<h1>Welcome!</h1>');

const response = await fetch(
  `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`
    },
    body: formData
  }
);
```

**Pricing**: 5,000 emails/month free, then $35/month for 50k  
**Pros**: Great for transactional, reliable  
**Cons**: Requires domain verification

---

## Option 4: Postmark (Best Deliverability)

**Best for**: Critical emails, best deliverability

### Setup:
1. Go to https://postmarkapp.com
2. Sign up (free tier: 100 emails/month)
3. Create server
4. Get API key
5. Add to backend: `POSTMARK_API_KEY=...`

### Code:
```javascript
const response = await fetch('https://api.postmarkapp.com/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Postmark-Server-Token': POSTMARK_API_KEY
  },
  body: JSON.stringify({
    From: 'noreply@school.6x7.gr',
    To: email,
    Subject: 'Welcome!',
    HtmlBody: '<h1>Welcome!</h1>'
  })
});
```

**Pricing**: 100 emails/month free, then $15/month for 10k  
**Pros**: Best deliverability, great for transactional  
**Cons**: Smaller free tier

---

## Option 5: AWS SES (Cheapest at Scale)

**Best for**: High volume, AWS users

### Setup:
1. Go to AWS Console → SES
2. Verify email or domain
3. Move out of sandbox (request production access)
4. Create IAM user with SES permissions
5. Get access keys
6. Add to backend: `AWS_SES_ACCESS_KEY=...`, `AWS_SES_SECRET_KEY=...`

### Code:
```javascript
// Requires aws-sdk
const AWS = require('aws-sdk');
const ses = new AWS.SES({
  accessKeyId: AWS_SES_ACCESS_KEY,
  secretAccessKey: AWS_SES_SECRET_KEY,
  region: 'us-east-1'
});

await ses.sendEmail({
  Source: 'noreply@school.6x7.gr',
  Destination: { ToAddresses: [email] },
  Message: {
    Subject: { Data: 'Welcome!' },
    Body: { Html: { Data: '<h1>Welcome!</h1>' } }
  }
}).promise();
```

**Pricing**: 62,000 emails/month free (if on EC2), then $0.10 per 1,000  
**Pros**: Very cheap at scale, reliable  
**Cons**: Complex setup, requires AWS knowledge

---

## Option 6: Brevo (Formerly Sendinblue)

**Best for**: Good free tier, marketing + transactional

### Setup:
1. Go to https://www.brevo.com
2. Sign up (free tier: 300 emails/day)
3. Get API key from SMTP & API → API Keys
4. Add to backend: `BREVO_API_KEY=...`

### Code:
```javascript
const response = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': BREVO_API_KEY
  },
  body: JSON.stringify({
    sender: { email: 'noreply@school.6x7.gr' },
    to: [{ email: email }],
    subject: 'Welcome!',
    htmlContent: '<h1>Welcome!</h1>'
  })
});
```

**Pricing**: 300 emails/day free, then $9/month for 20k  
**Pros**: Good free tier, marketing features  
**Cons**: Less known than SendGrid

---

## Option 7: Mailjet (Marketing + Transactional)

**Best for**: Both marketing and transactional emails

### Setup:
1. Go to https://www.mailjet.com
2. Sign up (free tier: 6,000 emails/month)
3. Get API key and Secret from Account Settings
4. Add to backend: `MAILJET_API_KEY=...`, `MAILJET_SECRET_KEY=...`

### Code:
```javascript
const response = await fetch('https://api.mailjet.com/v3.1/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString('base64')}`
  },
  body: JSON.stringify({
    Messages: [{
      From: { Email: 'noreply@school.6x7.gr' },
      To: [{ Email: email }],
      Subject: 'Welcome!',
      HTMLPart: '<h1>Welcome!</h1>'
    }]
  })
});
```

**Pricing**: 6,000 emails/month free, then $15/month for 15k  
**Pros**: Good free tier, marketing features  
**Cons**: API is more complex

---

## Option 8: Supabase (If Using Supabase)

**Best for**: Already using Supabase

### Setup:
1. Go to Supabase Dashboard → Settings → Auth
2. Enable Email Auth
3. Configure SMTP settings (or use Supabase's built-in)
4. Use Supabase client to send emails

### Code:
```javascript
// Using Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { email, subject, html } = await req.json()
  
  // Supabase handles email sending via Auth
  // Or use Resend/SendGrid from Edge Function
})
```

**Pricing**: Free (if using Supabase)  
**Pros**: Integrated if using Supabase  
**Cons**: Limited customization

---

## Option 9: Nodemailer (SMTP - Free)

**Best for**: Using your own SMTP server

### Setup:
1. Get SMTP credentials from your email provider
2. Install: `npm install nodemailer`
3. Configure SMTP

### Code:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

await transporter.sendMail({
  from: 'School Platform <noreply@school.6x7.gr>',
  to: email,
  subject: 'Welcome!',
  html: '<h1>Welcome!</h1>'
});
```

**Pricing**: Free (uses your SMTP)  
**Pros**: Free, flexible  
**Cons**: Need SMTP server, deliverability issues

---

## Option 10: Postal (Self-Hosted)

**Best for**: Full control, self-hosting

### Setup:
1. Deploy Postal on your server (Docker)
2. Configure DNS records
3. Use Postal API

**Pricing**: Free (self-hosted)  
**Pros**: Full control, free  
**Cons**: You manage everything, complex setup

---

## Recommendation by Use Case

### 🎯 **I want easiest setup**
→ **Resend** (modern API, great docs)

### 💰 **I want best free tier**
→ **Brevo** (300/day) or **Mailgun** (5k/month)

### 📈 **I need high volume**
→ **AWS SES** (cheapest at scale)

### ✅ **I need best deliverability**
→ **Postmark** (best inbox rates)

### 🔗 **I'm using Supabase**
→ **Supabase** (built-in, free)

### 🆓 **I want completely free**
→ **Nodemailer** (with Gmail SMTP) or **Postal** (self-hosted)

---

## Update Backend Code

To use a different email service, update `backend-proxy-example.js`:

### For SendGrid:
```javascript
app.post('/api/notifications/email', async (req, res) => {
  const { to, subject, html } = req.body;
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@school.6x7.gr' },
      subject,
      content: [{ type: 'text/html', value: html }]
    })
  });
  
  res.json(await response.json());
});
```

### For Mailgun:
```javascript
const formData = new URLSearchParams();
formData.append('from', 'School Platform <noreply@school.6x7.gr>');
formData.append('to', to);
formData.append('subject', subject);
formData.append('html', html);

const response = await fetch(
  `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
    },
    body: formData
  }
);
```

---

## My Recommendation

**Start with Resend** - it's modern, easy to use, and has a good free tier.  
**If you need more emails**: Switch to **Brevo** (300/day free) or **Mailgun** (5k/month free).  
**If you're scaling**: Use **AWS SES** (cheapest at high volume).

