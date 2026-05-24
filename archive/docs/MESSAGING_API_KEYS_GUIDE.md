# 📱 Messaging API Keys Setup Guide

Complete guide for setting up Facebook Messenger, WhatsApp, Instagram, Viber, Telegram, and Discord messaging.

---

## 🎯 Quick Overview

| Platform | API Provider | Free Tier | Setup Difficulty |
|----------|-------------|-----------|------------------|
| **Facebook Messenger** | Meta/Facebook | ✅ Yes | ⭐⭐⭐ Medium |
| **WhatsApp** | Meta WhatsApp Business | ⚠️ Limited | ⭐⭐⭐⭐ Hard |
| **Instagram** | Meta/Facebook | ✅ Yes | ⭐⭐⭐ Medium |
| **Viber** | Viber | ✅ Yes | ⭐⭐ Easy |
| **Telegram** | Telegram Bot API | ✅ Yes | ⭐ Easy |
| **Discord** | Discord Webhooks | ✅ Yes | ⭐ Very Easy |

---

## 1. Facebook Messenger Setup

### Step 1: Create Facebook App
1. Go to https://developers.facebook.com
2. Click **My Apps** → **Create App**
3. Choose **Business** type
4. Fill in app name: "School Platform"
5. Click **Create App**

### Step 2: Add Messenger Product
1. In your app dashboard, click **Add Product**
2. Find **Messenger** → Click **Set Up**
3. Go to **Settings** → **Basic**
4. Copy **App ID** and **App Secret** (save these!)

### Step 3: Create Facebook Page
1. Go to https://www.facebook.com/pages/create
2. Create a page for your school/platform
3. Note the Page ID (in page settings)

### Step 4: Get Page Access Token
1. In Facebook App → **Messenger** → **Settings**
2. Under **Access Tokens**, select your page
3. Click **Generate Token**
4. Copy the **Page Access Token** (starts with `EAAB...`)

### Step 5: Set Webhook (Optional - for receiving messages)
1. In **Messenger** → **Settings** → **Webhooks**
2. Add callback URL: `https://your-backend.railway.app/webhook/messenger`
3. Verify token (you'll need to implement verification endpoint)
4. Subscribe to `messages` events

### Environment Variables:
```
FACEBOOK_PAGE_ACCESS_TOKEN=EAAB...your-token
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

---

## 2. WhatsApp Business API Setup

### Option A: Meta WhatsApp Business API (Official)

**Step 1: Create Meta Business Account**
1. Go to https://business.facebook.com
2. Create a business account
3. Verify your business (may require documents)

**Step 2: Set Up WhatsApp Business Account**
1. Go to https://business.facebook.com/settings/whatsapp-business-accounts
2. Create WhatsApp Business Account
3. Add phone number (must be verified)

**Step 3: Get API Credentials**
1. Go to **WhatsApp** → **API Setup**
2. Copy:
   - **Phone Number ID** (e.g., `123456789012345`)
   - **Temporary Access Token** (starts with `EAAB...`)
   - **Business Account ID** (optional)

**Step 4: Get Permanent Token**
1. Go to **System Users** → Create system user
2. Assign WhatsApp permissions
3. Generate token with 60-day expiration
4. Set up token refresh (requires webhook)

### Option B: Twilio WhatsApp (Easier Alternative)

If Meta API is too complex, use Twilio:
1. Go to https://www.twilio.com/whatsapp
2. Sign up for Twilio
3. Get WhatsApp-enabled phone number
4. Use Twilio credentials (same as SMS setup)

### Environment Variables:
```
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAB...your-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id
```

**Note**: WhatsApp requires phone numbers in format: `14155552671` (country code + number, no + or spaces)

---

## 3. Instagram Direct Messages Setup

### Step 1: Convert to Business Account
1. Go to Instagram app → Settings → Account
2. Switch to **Business Account**
3. Connect to Facebook Page

### Step 2: Get Instagram Business Account ID
1. Go to https://developers.facebook.com/tools/explorer
2. Select your app
3. Get user access token with `instagram_basic`, `instagram_manage_messages` permissions
4. Query: `me/accounts` → Find your page → Get `instagram_business_account` ID

### Step 3: Get Access Token
1. Use same Facebook Page Access Token from Messenger setup
2. Or generate Instagram-specific token with permissions:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `pages_messaging`

### Environment Variables:
```
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841405309211844
FACEBOOK_PAGE_ACCESS_TOKEN=EAAB...your-token (same as Messenger)
```

---

## 4. Viber Setup

### Step 1: Create Viber Account
1. Go to https://partners.viber.com
2. Sign up for Viber Business account
3. Verify your business

### Step 2: Create Public Account
1. In Viber Partners dashboard, create **Public Account**
2. Fill in business details
3. Get approved (may take 1-2 days)

### Step 3: Get Auth Token
1. Go to **Public Accounts** → Your account
2. Go to **API** section
3. Copy **Authentication Token** (starts with `4...`)

### Step 4: Set Webhook URL (Optional)
1. Set webhook URL: `https://your-backend.railway.app/webhook/viber`
2. Subscribe to events: `delivered`, `seen`, `failed`

### Environment Variables:
```
VIBER_AUTH_TOKEN=4a...your-token
```

**Note**: Viber requires user to subscribe to your public account first before you can message them.

---

## 5. Telegram Bot Setup

### Step 1: Create Bot
1. Open Telegram app
2. Search for **@BotFather**
3. Send `/newbot` command
4. Follow instructions:
   - Choose bot name: "School Platform Bot"
   - Choose username: `your_school_bot`
5. Copy the **Bot Token** (starts with `123456789:ABC...`)

### Step 2: Get User Chat ID
Users need to:
1. Start conversation with your bot
2. Send `/start` command
3. Your backend can get chat_id from webhook updates

### Step 3: Set Webhook (Optional)
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-backend.railway.app/webhook/telegram"
```

### Environment Variables:
```
TELEGRAM_BOT_TOKEN=123456789:ABC...your-token
```

**Note**: Users must start conversation with bot first. You can't initiate conversations.

---

## 6. Discord Setup

### Option A: Webhook (Easiest - for notifications)

**Step 1: Create Webhook**
1. Go to your Discord server
2. Server Settings → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Choose channel
5. Copy **Webhook URL** (starts with `https://discord.com/api/webhooks/...`)

**Step 2: Test Webhook**
```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'
```

### Option B: Bot (For Direct Messages)

**Step 1: Create Bot**
1. Go to https://discord.com/developers/applications
2. Click **New Application** → Name: "School Platform"
3. Go to **Bot** section → Click **Add Bot**
4. Copy **Bot Token** (starts with `MTIz...`)

**Step 2: Invite Bot**
1. Go to **OAuth2** → **URL Generator**
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: `Send Messages`, `Read Message History`
4. Copy invite URL and open in browser
5. Add bot to your server

**Step 3: Get User ID**
Users need to enable Developer Mode:
1. Discord Settings → Advanced → Enable Developer Mode
2. Right-click user → Copy ID

### Environment Variables:
```
# For Webhooks (easiest)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456/abc...

# For Bot (advanced)
DISCORD_BOT_TOKEN=MTIz...your-token
```

---

## 📋 Complete Environment Variables List

Add all these to your Railway/Render backend:

```bash
# Existing
GROQ_API_KEY=your-groq-key
OPENAI_API_KEY=your-openai-key
RESEND_API_KEY=your-resend-key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Facebook/Meta
FACEBOOK_PAGE_ACCESS_TOKEN=EAAB...your-token
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAB...your-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-id
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841405309211844

# Viber
VIBER_AUTH_TOKEN=4a...your-token

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABC...your-token

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456/abc...
```

---

## 🧪 Testing Your Setup

### Test Facebook Messenger:
```bash
curl -X POST https://your-backend.railway.app/api/notifications/messenger \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "USER_PSID",
    "message": "Hello from School Platform!"
  }'
```

### Test WhatsApp:
```bash
curl -X POST https://your-backend.railway.app/api/notifications/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "14155552671",
    "message": "Hello from School Platform!"
  }'
```

### Test Instagram:
```bash
curl -X POST https://your-backend.railway.app/api/notifications/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "INSTAGRAM_USER_ID",
    "message": "Hello from School Platform!"
  }'
```

### Test Viber:
```bash
curl -X POST https://your-backend.railway.app/api/notifications/viber \
  -H "Content-Type: application/json" \
  -d '{
    "to": "VIBER_USER_ID",
    "message": "Hello from School Platform!"
  }'
```

### Test Telegram:
```bash
curl -X POST https://your-backend.railway.app/api/notifications/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "123456789",
    "message": "Hello from School Platform!"
  }'
```

### Test Discord:
```bash
curl -X POST https://your-backend.railway.app/api/notifications/discord \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from School Platform!",
    "username": "School Platform"
  }'
```

### Test Multi-Channel (sends to all configured):
```bash
curl -X POST https://your-backend.railway.app/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+1234567890",
    "whatsappNumber": "14155552671",
    "messengerId": "USER_PSID",
    "instagramId": "INSTAGRAM_USER_ID",
    "viberId": "VIBER_USER_ID",
    "telegramChatId": "123456789",
    "message": "Welcome to School Platform!",
    "subject": "Welcome!"
  }'
```

---

## 🔍 Where to Find Your API Keys

### If you already have keys but don't remember where:

1. **Check your email** - Search for:
   - "Facebook Developer"
   - "WhatsApp Business"
   - "Viber Partners"
   - "Telegram Bot"
   - "Discord Developer"

2. **Check your accounts**:
   - https://developers.facebook.com/apps (Facebook/Meta)
   - https://partners.viber.com (Viber)
   - https://discord.com/developers/applications (Discord)
   - Telegram: Check @BotFather chat history

3. **Check your backend environment variables**:
   - Railway: Project → Variables tab
   - Render: Environment tab
   - Heroku: Settings → Config Vars

4. **Check credentials.json** (if you created one):
   - `/Users/phktistakis/Devoloper Projects/School/credentials.json`
   - `/Users/phktistakis/Devoloper Projects/credentials-school.json`

---

## ⚠️ Important Notes

### Facebook/Meta Platforms:
- **Messenger**: Users must message your page first (24-hour window)
- **WhatsApp**: Requires verified business account, phone number verification
- **Instagram**: Must be Business account, connected to Facebook Page

### Viber:
- Users must subscribe to your Public Account first
- Free tier: 1,000 messages/month

### Telegram:
- Users must start conversation with bot first
- Free, unlimited messages

### Discord:
- Webhooks: Easy, but only for channels
- Bot: Can DM users, but requires bot invite

---

## 🚀 Quick Start (Minimum Setup)

**Easiest to set up first:**
1. ✅ **Telegram** - 5 minutes (just create bot with @BotFather)
2. ✅ **Discord** - 2 minutes (create webhook)
3. ✅ **Viber** - 15 minutes (create public account)
4. ⚠️ **Facebook Messenger** - 30 minutes (create app + page)
5. ⚠️ **Instagram** - 30 minutes (convert to business + connect)
6. ❌ **WhatsApp** - 1-2 days (business verification required)

---

## 📚 Documentation Links

- **Facebook Messenger**: https://developers.facebook.com/docs/messenger-platform
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Instagram Messaging**: https://developers.facebook.com/docs/instagram-api
- **Viber API**: https://developers.viber.com/docs/api/rest-bot-api
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Discord Webhooks**: https://discord.com/developers/docs/resources/webhook

---

**Need help?** Check the backend logs when testing endpoints - they'll show which services are configured!

