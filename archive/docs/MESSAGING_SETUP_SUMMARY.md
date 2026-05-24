# 📱 Messaging Platforms - Setup Summary

## ✅ What's Been Added

Your backend now supports sending messages via **6 different platforms**:

1. ✅ **Facebook Messenger** - Send messages to Facebook users
2. ✅ **WhatsApp** - Send messages via WhatsApp Business API
3. ✅ **Instagram** - Send direct messages on Instagram
4. ✅ **Viber** - Send messages via Viber Public Account
5. ✅ **Telegram** - Send messages via Telegram Bot
6. ✅ **Discord** - Send messages via Discord Webhook/Bot

Plus existing:
- ✅ **Email** (Resend)
- ✅ **SMS** (Twilio)

---

## 🚀 New Backend Endpoints

### Individual Platform Endpoints:

```
POST /api/notifications/messenger
POST /api/notifications/whatsapp
POST /api/notifications/instagram
POST /api/notifications/viber
POST /api/notifications/telegram
POST /api/notifications/discord
```

### Multi-Channel Endpoint (Send to All):

```
POST /api/notifications/send
```

This endpoint sends to **all configured platforms** at once!

---

## 📋 What You Need to Do

### Step 1: Find Your API Keys

Check these places for your existing API keys:
- ✅ Email inbox (search for "Facebook", "WhatsApp", "Viber", "Telegram", "Discord")
- ✅ https://developers.facebook.com/apps (Facebook/Meta)
- ✅ https://partners.viber.com (Viber)
- ✅ https://discord.com/developers/applications (Discord)
- ✅ Telegram: Check @BotFather chat history
- ✅ Your credentials.json file (if you created one)

### Step 2: Set Up Missing Platforms

**Easiest to start** (if you don't have keys yet):
1. **Telegram** - 5 minutes
   - Open Telegram → Search @BotFather → `/newbot`
   - Copy bot token

2. **Discord** - 2 minutes
   - Discord Server → Settings → Integrations → Webhooks
   - Create webhook → Copy URL

3. **Viber** - 15 minutes
   - Go to https://partners.viber.com
   - Create public account → Get auth token

**More complex** (require business verification):
- Facebook Messenger (30 min)
- Instagram (30 min)
- WhatsApp (1-2 days - requires business verification)

### Step 3: Add Keys to Backend

Add these environment variables to Railway/Render:

```bash
# Facebook/Meta
FACEBOOK_PAGE_ACCESS_TOKEN=EAAB...your-token
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAB...your-token
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841405309211844

# Viber
VIBER_AUTH_TOKEN=4a...your-token

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABC...your-token

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456/abc...
```

---

## 🧪 How to Use

### Send to Single Platform:

```javascript
// Facebook Messenger
await fetch('https://your-backend.railway.app/api/notifications/messenger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        recipientId: 'USER_PSID',
        message: 'Hello!'
    })
});

// WhatsApp
await fetch('https://your-backend.railway.app/api/notifications/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        to: '14155552671', // Phone with country code
        message: 'Hello!'
    })
});

// Telegram
await fetch('https://your-backend.railway.app/api/notifications/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        chatId: '123456789',
        message: 'Hello!'
    })
});
```

### Send to ALL Platforms at Once:

```javascript
await fetch('https://your-backend.railway.app/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        phone: '+1234567890',
        whatsappNumber: '14155552671',
        messengerId: 'USER_PSID',
        instagramId: 'INSTAGRAM_USER_ID',
        viberId: 'VIBER_USER_ID',
        telegramChatId: '123456789',
        message: 'Welcome to School Platform!',
        subject: 'Welcome!'
    })
});
```

---

## 📚 Documentation

**Full setup guide**: See `MESSAGING_API_KEYS_GUIDE.md` for:
- Step-by-step setup for each platform
- Where to find API keys
- Testing instructions
- Troubleshooting tips

---

## 🎯 Quick Start Checklist

- [ ] Read `MESSAGING_API_KEYS_GUIDE.md`
- [ ] Find your existing API keys (check email, accounts)
- [ ] Set up Telegram (easiest - 5 min)
- [ ] Set up Discord (easiest - 2 min)
- [ ] Add keys to backend environment variables
- [ ] Test endpoints (see guide)
- [ ] Update frontend to use messaging endpoints

---

## 💡 Tips

1. **Start with Telegram & Discord** - They're the easiest to set up
2. **Facebook/Meta platforms** - Use same access token for Messenger, WhatsApp, Instagram
3. **WhatsApp** - Requires business verification (takes 1-2 days)
4. **Viber** - Users must subscribe to your public account first
5. **Telegram** - Users must start conversation with bot first

---

**All code is ready! Just add your API keys and you're good to go!** 🚀

