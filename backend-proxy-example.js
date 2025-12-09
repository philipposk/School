// Complete Backend Server for School Platform
// Includes: AI Proxy, Email Notifications, Supabase Integration
// Deploy to Railway, Render, or Fly.io

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Allow frontend to call this API
app.use(express.json());

// Environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

// Facebook/Meta API (for Messenger, WhatsApp, Instagram)
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '';

// Viber API
const VIBER_AUTH_TOKEN = process.env.VIBER_AUTH_TOKEN || '';

// Telegram Bot API
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Discord Webhook
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

// Stripe Payment System
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID || '';
const STRIPE_YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://school.6x7.gr';

// Stripe initialization
let Stripe = null;
let stripe = null;
try {
    Stripe = require('stripe');
    stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
} catch (error) {
    console.warn('Stripe module not installed. Run: npm install stripe');
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Supabase configuration endpoint (returns public config for frontend)
app.get('/api/config/supabase', (req, res) => {
    res.json({
        url: SUPABASE_URL || 'https://jmjezmfhygvazfunuujt.supabase.co',
        // Note: Anon key should be set as environment variable SUPABASE_ANON_KEY
        // If not set, frontend will need to configure it manually
        anonKey: process.env.SUPABASE_ANON_KEY || null
    });
});

// Proxy endpoint for Groq API with automatic model fallback
app.post('/api/ai/groq', async (req, res) => {
    try {
        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'Groq API key not configured on server' });
        }

        const { messages, options = {} } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        // Model fallback list (try primary first, then fallbacks)
        const groqModels = options.model 
            ? [options.model] 
            : [
                'llama-3.3-70b-versatile', // Primary
                'llama-3.1-8b-instant',    // Fallback 1
                'mixtral-8x7b-32768',      // Fallback 2
                'gemma2-9b-it'              // Fallback 3
            ];

        let lastError = null;

        // Try each model until one works
        for (const model of groqModels) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: messages,
                        temperature: options.temperature || 0.7,
                        max_tokens: options.max_tokens || 1000,
                        stream: false
                    })
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
                    const errorMsg = error.error?.message || '';

                    // If model is deprecated or unavailable, try next model
                    if (errorMsg.includes('decommissioned') || errorMsg.includes('not available') || response.status === 400) {
                        console.warn(`Groq model ${model} failed, trying next model...`);
                        lastError = new Error(errorMsg);
                        continue; // Try next model
                    }

                    return res.status(response.status).json({ error: errorMsg || 'API error' });
                }

                const data = await response.json();
                console.log(`✅ Groq API success with model: ${model}`);
                return res.json(data);
            } catch (error) {
                lastError = error;
                // If it's a model-specific error, try next model
                if (error.message && (error.message.includes('decommissioned') || error.message.includes('not available'))) {
                    console.warn(`Groq model ${model} failed: ${error.message}, trying next model...`);
                    continue;
                }
                // Other errors: return immediately
                console.error('Groq API error:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        }

        // All models failed
        return res.status(500).json({ 
            error: lastError?.message || 'All Groq models failed. Please check API configuration.' 
        });
    } catch (error) {
        console.error('Groq API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Proxy endpoint for OpenAI API
app.post('/api/ai/openai', async (req, res) => {
    try {
        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OpenAI API key not configured on server' });
        }

        const { messages, options = {} } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: options.model || 'gpt-4o-mini',
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 2000,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            return res.status(response.status).json({ error: error.error?.message || 'API error' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Email notifications endpoint
app.post('/api/notifications/email', async (req, res) => {
    try {
        if (!RESEND_API_KEY) {
            return res.status(500).json({ error: 'Resend API key not configured' });
        }

        const { to, subject, html, text } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'School Platform <onboarding@resend.dev>', // Update with your domain
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '') // Strip HTML if no text provided
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            return res.status(response.status).json({ error: error.error?.message || 'Email sending failed' });
        }

        const data = await response.json();
        res.json({ success: true, id: data.id });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send welcome email
app.post('/api/notifications/welcome', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({ error: 'Missing email or name' });
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎓 Welcome to School Platform!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name}!</h2>
                        <p>Welcome to our learning platform! We're excited to have you join us.</p>
                        <p>Get started by exploring our courses and begin your learning journey today.</p>
                        <a href="${process.env.FRONTEND_URL || 'https://school.6x7.gr'}" class="button">Start Learning</a>
                        <p style="margin-top: 30px; font-size: 12px; color: #666;">
                            If you didn't sign up for this account, please ignore this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Call email endpoint
        const emailRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                subject: 'Welcome to School Platform! 🎓',
                html
            })
        });

        const result = await emailRes.json();
        res.json(result);
    } catch (error) {
        console.error('Welcome email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send course completion email
app.post('/api/notifications/course-completed', async (req, res) => {
    try {
        const { email, name, courseTitle } = req.body;
        
        if (!email || !name || !courseTitle) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #48bb78; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Congratulations!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name}!</h2>
                        <p>Amazing work! You've completed the course: <strong>${courseTitle}</strong></p>
                        <p>Your dedication and hard work have paid off. Keep up the great learning!</p>
                        <a href="${process.env.FRONTEND_URL || 'https://school.6x7.gr'}" class="button">View Certificate</a>
                    </div>
                </div>
            </body>
            </html>
        `;

        const emailRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: email,
                subject: `🎉 Course Completed: ${courseTitle}`,
                html
            })
        });

        const result = await emailRes.json();
        res.json(result);
    } catch (error) {
        console.error('Course completion email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// SMS notifications endpoint (Twilio)
app.post('/api/notifications/sms', async (req, res) => {
    try {
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
            return res.status(500).json({ error: 'Twilio not configured' });
        }

        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({ error: 'Missing to or message' });
        }

        const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
        
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${auth}`
                },
                body: new URLSearchParams({
                    From: TWILIO_PHONE_NUMBER,
                    To: to,
                    Body: message
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            return res.status(response.status).json({ error });
        }

        const data = await response.json();
        res.json({ success: true, sid: data.sid });
    } catch (error) {
        console.error('SMS error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Facebook Messenger notifications endpoint
app.post('/api/notifications/messenger', async (req, res) => {
    try {
        if (!FACEBOOK_PAGE_ACCESS_TOKEN) {
            return res.status(500).json({ error: 'Facebook Messenger not configured' });
        }

        const { recipientId, message } = req.body;

        if (!recipientId || !message) {
            return res.status(400).json({ error: 'Missing recipientId or message' });
        }

        const response = await fetch(
            `https://graph.facebook.com/v18.0/me/messages?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: { id: recipientId },
                    message: { text: message }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            return res.status(response.status).json({ error: error.error?.message || 'Messenger sending failed' });
        }

        const data = await response.json();
        res.json({ success: true, messageId: data.message_id });
    } catch (error) {
        console.error('Messenger error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// WhatsApp notifications endpoint (Meta WhatsApp Business API)
app.post('/api/notifications/whatsapp', async (req, res) => {
    try {
        if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
            return res.status(500).json({ error: 'WhatsApp not configured' });
        }

        const { to, message } = req.body; // 'to' should be phone number with country code (e.g., "14155552671")

        if (!to || !message) {
            return res.status(400).json({ error: 'Missing to or message' });
        }

        const response = await fetch(
            `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'text',
                    text: { body: message }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            return res.status(response.status).json({ error: error.error?.message || 'WhatsApp sending failed' });
        }

        const data = await response.json();
        res.json({ success: true, messageId: data.messages[0]?.id });
    } catch (error) {
        console.error('WhatsApp error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Instagram Direct Message notifications endpoint
app.post('/api/notifications/instagram', async (req, res) => {
    try {
        if (!INSTAGRAM_BUSINESS_ACCOUNT_ID || !FACEBOOK_PAGE_ACCESS_TOKEN) {
            return res.status(500).json({ error: 'Instagram not configured' });
        }

        const { recipientId, message } = req.body;

        if (!recipientId || !message) {
            return res.status(400).json({ error: 'Missing recipientId or message' });
        }

        // Instagram uses the same Graph API as Messenger
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${FACEBOOK_PAGE_ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    recipient: { id: recipientId },
                    message: { text: message }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            return res.status(response.status).json({ error: error.error?.message || 'Instagram sending failed' });
        }

        const data = await response.json();
        res.json({ success: true, messageId: data.message_id });
    } catch (error) {
        console.error('Instagram error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Viber notifications endpoint
app.post('/api/notifications/viber', async (req, res) => {
    try {
        if (!VIBER_AUTH_TOKEN) {
            return res.status(500).json({ error: 'Viber not configured' });
        }

        const { to, message } = req.body; // 'to' should be Viber user ID

        if (!to || !message) {
            return res.status(400).json({ error: 'Missing to or message' });
        }

        const response = await fetch('https://chatapi.viber.com/pa/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Viber-Auth-Token': VIBER_AUTH_TOKEN
            },
            body: JSON.stringify({
                receiver: to,
                type: 'text',
                text: message
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            return res.status(response.status).json({ error: error.error?.message || 'Viber sending failed' });
        }

        const data = await response.json();
        res.json({ success: true, messageToken: data.message_token });
    } catch (error) {
        console.error('Viber error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Telegram notifications endpoint
app.post('/api/notifications/telegram', async (req, res) => {
    try {
        if (!TELEGRAM_BOT_TOKEN) {
            return res.status(500).json({ error: 'Telegram not configured' });
        }

        const { chatId, message } = req.body; // 'chatId' should be Telegram user chat ID

        if (!chatId || !message) {
            return res.status(400).json({ error: 'Missing chatId or message' });
        }

        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            return res.status(response.status).json({ error: error.description || 'Telegram sending failed' });
        }

        const data = await response.json();
        res.json({ success: true, messageId: data.result?.message_id });
    } catch (error) {
        console.error('Telegram error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Discord notifications endpoint (via Webhook)
app.post('/api/notifications/discord', async (req, res) => {
    try {
        if (!DISCORD_WEBHOOK_URL) {
            return res.status(500).json({ error: 'Discord not configured' });
        }

        const { message, username, avatar_url } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Missing message' });
        }

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: message,
                username: username || 'School Platform',
                avatar_url: avatar_url || undefined
            })
        });

        if (!response.ok) {
            const error = await response.text();
            return res.status(response.status).json({ error: error || 'Discord sending failed' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Discord error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Multi-channel notification endpoint (sends to all configured channels)
app.post('/api/notifications/send', async (req, res) => {
    try {
        const { 
            email, 
            phone, 
            messengerId, 
            whatsappNumber, 
            instagramId, 
            viberId, 
            telegramChatId,
            message,
            subject,
            html 
        } = req.body;

        const results = {};

        // Send email if configured
        if (email && RESEND_API_KEY && (subject || message)) {
            try {
                const emailRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: email,
                        subject: subject || 'Notification from School Platform',
                        html: html || `<p>${message}</p>`,
                        text: message
                    })
                });
                results.email = await emailRes.json();
            } catch (err) {
                results.email = { error: err.message };
            }
        }

        // Send SMS if configured
        if (phone && TWILIO_ACCOUNT_SID && message) {
            try {
                const smsRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/sms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: phone, message })
                });
                results.sms = await smsRes.json();
            } catch (err) {
                results.sms = { error: err.message };
            }
        }

        // Send WhatsApp if configured
        if (whatsappNumber && WHATSAPP_PHONE_NUMBER_ID && message) {
            try {
                const whatsappRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/whatsapp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: whatsappNumber, message })
                });
                results.whatsapp = await whatsappRes.json();
            } catch (err) {
                results.whatsapp = { error: err.message };
            }
        }

        // Send Messenger if configured
        if (messengerId && FACEBOOK_PAGE_ACCESS_TOKEN && message) {
            try {
                const messengerRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/messenger`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipientId: messengerId, message })
                });
                results.messenger = await messengerRes.json();
            } catch (err) {
                results.messenger = { error: err.message };
            }
        }

        // Send Instagram if configured
        if (instagramId && INSTAGRAM_BUSINESS_ACCOUNT_ID && message) {
            try {
                const instagramRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/instagram`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipientId: instagramId, message })
                });
                results.instagram = await instagramRes.json();
            } catch (err) {
                results.instagram = { error: err.message };
            }
        }

        // Send Viber if configured
        if (viberId && VIBER_AUTH_TOKEN && message) {
            try {
                const viberRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/viber`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: viberId, message })
                });
                results.viber = await viberRes.json();
            } catch (err) {
                results.viber = { error: err.message };
            }
        }

        // Send Telegram if configured
        if (telegramChatId && TELEGRAM_BOT_TOKEN && message) {
            try {
                const telegramRes = await fetch(`${req.protocol}://${req.get('host')}/api/notifications/telegram`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chatId: telegramChatId, message })
                });
                results.telegram = await telegramRes.json();
            } catch (err) {
                results.telegram = { error: err.message };
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('Multi-channel notification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Stripe Payment System (variables already declared at top of file)

// Create Stripe checkout session
app.post('/api/payments/create-checkout', async (req, res) => {
    try {
        if (!STRIPE_SECRET_KEY) {
            return res.status(500).json({ error: 'Stripe not configured' });
        }

        if (!stripe) {
            return res.status(500).json({ error: 'Stripe module not installed. Run: npm install stripe' });
        }

        const { planId, userId, successUrl, cancelUrl } = req.body;

        if (!planId) {
            return res.status(400).json({ error: 'Missing planId' });
        }

        // Get price ID based on plan
        let priceId = '';
        if (planId === 'monthly') {
            priceId = STRIPE_MONTHLY_PRICE_ID || req.body.priceId;
        } else if (planId === 'yearly') {
            priceId = STRIPE_YEARLY_PRICE_ID || req.body.priceId;
        } else {
            return res.status(400).json({ error: 'Invalid planId. Use "monthly" or "yearly"' });
        }

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID not configured. Set STRIPE_MONTHLY_PRICE_ID or STRIPE_YEARLY_PRICE_ID' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl || `${FRONTEND_URL}?payment=success`,
            cancel_url: cancelUrl || `${FRONTEND_URL}?payment=cancel`,
            customer_email: userId,
            metadata: {
                userId: userId,
                planId: planId
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
});

// Verify payment success
app.post('/api/payments/verify-payment', async (req, res) => {
    try {
        if (!STRIPE_SECRET_KEY || !stripe) {
            return res.status(500).json({ error: 'Stripe not configured' });
        }

        const { userId } = req.body;

        // Get customer's subscriptions
        const customers = await stripe.customers.list({
            email: userId,
            limit: 1
        });

        if (customers.data.length === 0) {
            return res.json({ subscription: null, message: 'No subscription found' });
        }

        const customer = customers.data[0];
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            return res.json({ subscription: null, message: 'No active subscription found' });
        }

        const subscription = subscriptions.data[0];
        
        // Determine plan from price ID
        const priceId = subscription.items.data[0].price.id;
        let planId = 'monthly';
        if (priceId.includes('yearly') || priceId.includes('annual')) {
            planId = 'yearly';
        }

        res.json({
            subscription: {
                plan: planId,
                status: subscription.status,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: customer.id,
                startDate: new Date(subscription.created * 1000).toISOString(),
                endDate: subscription.current_period_end 
                    ? new Date(subscription.current_period_end * 1000).toISOString()
                    : null
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: error.message || 'Failed to verify payment' });
    }
});

// Cancel subscription
app.post('/api/payments/cancel-subscription', async (req, res) => {
    try {
        if (!STRIPE_SECRET_KEY || !stripe) {
            return res.status(500).json({ error: 'Stripe not configured' });
        }

        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'Missing subscriptionId' });
        }

        const subscription = await stripe.subscriptions.cancel(subscriptionId);

        res.json({ 
            success: true, 
            subscription: {
                status: subscription.status,
                cancelledAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Subscription cancellation error:', error);
        res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
    }
});

// Stripe webhook handler (for subscription events)
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!STRIPE_WEBHOOK_SECRET) {
        return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            // Handle successful checkout
            console.log('Checkout completed:', session.id);
            break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            const subscription = event.data.object;
            // Update subscription status in database
            console.log('Subscription updated:', subscription.id);
            break;
        
        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            // Handle cancelled subscription
            console.log('Subscription cancelled:', deletedSubscription.id);
            break;
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Get subscription plans
app.get('/api/payments/plans', (req, res) => {
    res.json({
        plans: {
            free: {
                id: 'free',
                name: 'Free',
                price: 0,
                features: ['Access to free courses', 'Basic features']
            },
            monthly: {
                id: 'monthly',
                name: 'Monthly Premium',
                price: 9.99,
                interval: 'month',
                features: ['All courses', 'AI tutor', 'Certificates', 'Priority support']
            },
            yearly: {
                id: 'yearly',
                name: 'Yearly Premium',
                price: 99.99,
                interval: 'year',
                features: ['All courses', 'AI tutor', 'Certificates', 'Priority support', 'Save 17%']
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend Server running on port ${PORT}`);
    console.log(`📝 Groq API: ${GROQ_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📝 OpenAI API: ${OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📧 Resend Email: ${RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💬 Twilio SMS: ${TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📱 Facebook Messenger: ${FACEBOOK_PAGE_ACCESS_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💚 WhatsApp: ${WHATSAPP_PHONE_NUMBER_ID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📷 Instagram: ${INSTAGRAM_BUSINESS_ACCOUNT_ID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💜 Viber: ${VIBER_AUTH_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`✈️  Telegram: ${TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🎮 Discord: ${DISCORD_WEBHOOK_URL ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💳 Stripe: ${STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🗄️  Supabase: ${SUPABASE_URL ? '✅ Configured' : '❌ Not configured'}`);
});

