// Complete Backend Server for School Platform
// Includes: AI Proxy, Email Notifications, Supabase Integration, Stripe Payments
// Deploy to Railway, Render, or Fly.io

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1); // Fly.io / proxies

// ----------------------------------------------------------------------------
// Environment variables
// ----------------------------------------------------------------------------
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'School Platform <onboarding@resend.dev>';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '';

const VIBER_AUTH_TOKEN = process.env.VIBER_AUTH_TOKEN || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID || '';
const STRIPE_YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID || '';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://school.6x7.gr';
// Comma-separated list of additional allowed origins (e.g. dev hosts)
const EXTRA_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim()).filter(Boolean);

// ----------------------------------------------------------------------------
// Stripe init
// ----------------------------------------------------------------------------
let Stripe = null;
let stripe = null;
try {
    Stripe = require('stripe');
    stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
} catch (error) {
    console.warn('Stripe module not installed. Run: npm install stripe');
}

// ----------------------------------------------------------------------------
// Supabase service-role client (for webhook writes; bypasses RLS)
// ----------------------------------------------------------------------------
let supabaseAdmin = null;
try {
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient } = require('@supabase/supabase-js');
        supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false }
        });
    }
} catch (error) {
    console.warn('Supabase admin client unavailable:', error.message);
}

// ----------------------------------------------------------------------------
// Middleware: CORS restricted to known origins
// ----------------------------------------------------------------------------
const allowedOrigins = new Set([FRONTEND_URL, ...EXTRA_ALLOWED_ORIGINS]);

// Pre-CORS guard: reject disallowed browser origins with a clean JSON 403
// before the cors() middleware throws and produces an HTML stack trace.
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }
    next();
});

app.use(cors({
    origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (allowedOrigins.has(origin)) return cb(null, true);
        // Should be unreachable thanks to the guard above, but stay safe.
        return cb(null, false);
    },
    credentials: true
}));

// Stripe webhook needs the raw body, so mount it BEFORE express.json()
app.post('/api/payments/webhook',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
);

app.use(express.json({ limit: '1mb' }));

// ----------------------------------------------------------------------------
// Rate limiters (per IP) — protect paid AI / messaging endpoints from abuse
// ----------------------------------------------------------------------------
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.AI_RATE_LIMIT_PER_MIN) || 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many AI requests, slow down.' }
});

const notificationLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.NOTIFY_RATE_LIMIT_PER_MIN) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many notification requests, slow down.' }
});

const paymentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.PAYMENT_RATE_LIMIT_PER_MIN) || 30,
    standardHeaders: true,
    legacyHeaders: false
});

// ----------------------------------------------------------------------------
// Internal helpers (no self-fetch — call these directly)
// ----------------------------------------------------------------------------
async function sendEmail({ to, subject, html, text }) {
    if (!RESEND_API_KEY) {
        return { ok: false, status: 500, error: 'Resend API key not configured' };
    }
    if (!to || !subject || !html) {
        return { ok: false, status: 400, error: 'Missing required fields: to, subject, html' };
    }
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: EMAIL_FROM,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '')
            })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return { ok: false, status: response.status, error: err.error?.message || 'Email sending failed' };
        }
        const data = await response.json();
        return { ok: true, id: data.id };
    } catch (err) {
        console.error('sendEmail error:', err);
        return { ok: false, status: 500, error: 'Internal email error' };
    }
}

async function sendSMS({ to, message }) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        return { ok: false, status: 500, error: 'Twilio not configured' };
    }
    if (!to || !message) return { ok: false, status: 400, error: 'Missing to or message' };

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    try {
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${auth}`
                },
                body: new URLSearchParams({ From: TWILIO_PHONE_NUMBER, To: to, Body: message })
            }
        );
        if (!response.ok) {
            const err = await response.text();
            return { ok: false, status: response.status, error: err };
        }
        const data = await response.json();
        return { ok: true, sid: data.sid };
    } catch (err) {
        console.error('sendSMS error:', err);
        return { ok: false, status: 500, error: 'Internal SMS error' };
    }
}

async function sendWhatsApp({ to, message }) {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
        return { ok: false, status: 500, error: 'WhatsApp not configured' };
    }
    if (!to || !message) return { ok: false, status: 400, error: 'Missing to or message' };
    try {
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
                    to, type: 'text', text: { body: message }
                })
            }
        );
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return { ok: false, status: response.status, error: err.error?.message || 'WhatsApp sending failed' };
        }
        const data = await response.json();
        return { ok: true, messageId: data.messages?.[0]?.id };
    } catch (err) {
        return { ok: false, status: 500, error: 'Internal WhatsApp error' };
    }
}

async function sendMessenger({ recipientId, message }) {
    if (!FACEBOOK_PAGE_ACCESS_TOKEN) return { ok: false, status: 500, error: 'Messenger not configured' };
    if (!recipientId || !message) return { ok: false, status: 400, error: 'Missing recipientId or message' };
    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/me/messages?access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient: { id: recipientId }, message: { text: message } })
            }
        );
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return { ok: false, status: response.status, error: err.error?.message || 'Messenger sending failed' };
        }
        const data = await response.json();
        return { ok: true, messageId: data.message_id };
    } catch (err) {
        return { ok: false, status: 500, error: 'Internal Messenger error' };
    }
}

async function sendInstagram({ recipientId, message }) {
    if (!INSTAGRAM_BUSINESS_ACCOUNT_ID || !FACEBOOK_PAGE_ACCESS_TOKEN)
        return { ok: false, status: 500, error: 'Instagram not configured' };
    if (!recipientId || !message) return { ok: false, status: 400, error: 'Missing recipientId or message' };
    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${FACEBOOK_PAGE_ACCESS_TOKEN}`
                },
                body: JSON.stringify({ recipient: { id: recipientId }, message: { text: message } })
            }
        );
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return { ok: false, status: response.status, error: err.error?.message || 'Instagram sending failed' };
        }
        const data = await response.json();
        return { ok: true, messageId: data.message_id };
    } catch (err) {
        return { ok: false, status: 500, error: 'Internal Instagram error' };
    }
}

async function sendViber({ to, message }) {
    if (!VIBER_AUTH_TOKEN) return { ok: false, status: 500, error: 'Viber not configured' };
    if (!to || !message) return { ok: false, status: 400, error: 'Missing to or message' };
    try {
        const response = await fetch('https://chatapi.viber.com/pa/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Viber-Auth-Token': VIBER_AUTH_TOKEN },
            body: JSON.stringify({ receiver: to, type: 'text', text: message })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return { ok: false, status: response.status, error: err.error?.message || 'Viber sending failed' };
        }
        const data = await response.json();
        return { ok: true, messageToken: data.message_token };
    } catch (err) {
        return { ok: false, status: 500, error: 'Internal Viber error' };
    }
}

async function sendTelegram({ chatId, message }) {
    if (!TELEGRAM_BOT_TOKEN) return { ok: false, status: 500, error: 'Telegram not configured' };
    if (!chatId || !message) return { ok: false, status: 400, error: 'Missing chatId or message' };
    try {
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
            }
        );
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            return { ok: false, status: response.status, error: err.description || 'Telegram sending failed' };
        }
        const data = await response.json();
        return { ok: true, messageId: data.result?.message_id };
    } catch (err) {
        return { ok: false, status: 500, error: 'Internal Telegram error' };
    }
}

async function sendDiscord({ message, username, avatar_url }) {
    if (!DISCORD_WEBHOOK_URL) return { ok: false, status: 500, error: 'Discord not configured' };
    if (!message) return { ok: false, status: 400, error: 'Missing message' };
    try {
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
            const err = await response.text();
            return { ok: false, status: response.status, error: err || 'Discord sending failed' };
        }
        return { ok: true };
    } catch (err) {
        return { ok: false, status: 500, error: 'Internal Discord error' };
    }
}

function planFromPriceId(priceId) {
    if (priceId && STRIPE_YEARLY_PRICE_ID && priceId === STRIPE_YEARLY_PRICE_ID) return 'yearly';
    if (priceId && STRIPE_MONTHLY_PRICE_ID && priceId === STRIPE_MONTHLY_PRICE_ID) return 'monthly';
    // Unknown price — caller decides default
    return null;
}

// Stripe moved `current_period_*` from the subscription onto each subscription
// item. Prefer the item field, fall back to the legacy top-level for older
// accounts/events.
function subscriptionPeriodEnd(sub) {
    const item = sub?.items?.data?.[0];
    const ts = item?.current_period_end ?? sub?.current_period_end ?? null;
    return ts ? new Date(ts * 1000).toISOString() : null;
}

function subscriptionPeriodStart(sub) {
    const item = sub?.items?.data?.[0];
    const ts = item?.current_period_start ?? sub?.current_period_start ?? sub?.created ?? null;
    return ts ? new Date(ts * 1000).toISOString() : null;
}

// ----------------------------------------------------------------------------
// Root / health
// ----------------------------------------------------------------------------
app.get('/', (_req, res) => {
    res.json({
        name: 'School Platform Backend API',
        version: '1.1.0',
        status: 'running',
        endpoints: {
            health: '/health',
            ai: { groq: '/api/ai/groq', openai: '/api/ai/openai' },
            notifications: {
                email: '/api/notifications/email',
                sms: '/api/notifications/sms',
                send: '/api/notifications/send'
            },
            payments: {
                createCheckout: '/api/payments/create-checkout',
                verifyPayment: '/api/payments/verify-payment',
                cancelSubscription: '/api/payments/cancel-subscription',
                subscription: '/api/payments/subscription',
                webhook: '/api/payments/webhook',
                plans: '/api/payments/plans'
            },
            config: { supabase: '/api/config/supabase' }
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
// Supabase public config (anon key is safe to expose; no hardcoded fallback)
// ----------------------------------------------------------------------------
app.get('/api/config/supabase', (_req, res) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return res.status(503).json({
            error: 'Supabase not configured on server. Set SUPABASE_URL and SUPABASE_ANON_KEY.'
        });
    }
    res.json({ url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY });
});

// ----------------------------------------------------------------------------
// AI proxies
// ----------------------------------------------------------------------------
app.post('/api/ai/groq', aiLimiter, async (req, res) => {
    try {
        if (!GROQ_API_KEY) return res.status(500).json({ error: 'Groq API key not configured on server' });

        const { messages, options = {} } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        const groqModels = options.model
            ? [options.model]
            : ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'];

        let lastError = null;
        for (const model of groqModels) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model, messages,
                        temperature: options.temperature ?? 0.7,
                        max_tokens: options.max_tokens ?? 1000,
                        stream: false
                    })
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
                    const msg = error.error?.message || '';
                    if (msg.includes('decommissioned') || msg.includes('not available') || response.status === 400) {
                        console.warn(`Groq model ${model} failed, trying next…`);
                        lastError = new Error(msg);
                        continue;
                    }
                    return res.status(response.status).json({ error: msg || 'API error' });
                }
                const data = await response.json();
                return res.json(data);
            } catch (error) {
                lastError = error;
                if (error.message && (error.message.includes('decommissioned') || error.message.includes('not available'))) {
                    continue;
                }
                console.error('Groq API error:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        }
        return res.status(500).json({ error: lastError?.message || 'All Groq models failed.' });
    } catch (error) {
        console.error('Groq API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/ai/openai', aiLimiter, async (req, res) => {
    try {
        if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI API key not configured on server' });

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
                messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens ?? 2000,
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

// ----------------------------------------------------------------------------
// Notifications
// ----------------------------------------------------------------------------
app.post('/api/notifications/email', notificationLimiter, async (req, res) => {
    const result = await sendEmail(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, id: result.id });
});

app.post('/api/notifications/welcome', notificationLimiter, async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Missing email or name' });

    const html = welcomeEmailHtml(name);
    const result = await sendEmail({
        to: email,
        subject: 'Welcome to School Platform! 🎓',
        html
    });
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, id: result.id });
});

app.post('/api/notifications/course-completed', notificationLimiter, async (req, res) => {
    const { email, name, courseTitle } = req.body;
    if (!email || !name || !courseTitle) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const html = courseCompletedEmailHtml(name, courseTitle);
    const result = await sendEmail({
        to: email,
        subject: `🎉 Course Completed: ${courseTitle}`,
        html
    });
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, id: result.id });
});

app.post('/api/notifications/sms', notificationLimiter, async (req, res) => {
    const result = await sendSMS(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, sid: result.sid });
});

app.post('/api/notifications/messenger', notificationLimiter, async (req, res) => {
    const result = await sendMessenger(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, messageId: result.messageId });
});

app.post('/api/notifications/whatsapp', notificationLimiter, async (req, res) => {
    const result = await sendWhatsApp(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, messageId: result.messageId });
});

app.post('/api/notifications/instagram', notificationLimiter, async (req, res) => {
    const result = await sendInstagram(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, messageId: result.messageId });
});

app.post('/api/notifications/viber', notificationLimiter, async (req, res) => {
    const result = await sendViber(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, messageToken: result.messageToken });
});

app.post('/api/notifications/telegram', notificationLimiter, async (req, res) => {
    const result = await sendTelegram(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true, messageId: result.messageId });
});

app.post('/api/notifications/discord', notificationLimiter, async (req, res) => {
    const result = await sendDiscord(req.body);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ success: true });
});

// Multi-channel fan-out (one rate-limit hit for the parent request)
app.post('/api/notifications/send', notificationLimiter, async (req, res) => {
    const {
        email, phone, messengerId, whatsappNumber, instagramId,
        viberId, telegramChatId, message, subject, html
    } = req.body;

    const results = {};
    const tasks = [];

    if (email && (subject || message)) {
        tasks.push(sendEmail({
            to: email,
            subject: subject || 'Notification from School Platform',
            html: html || `<p>${message}</p>`,
            text: message
        }).then(r => { results.email = r; }));
    }
    if (phone && message) tasks.push(sendSMS({ to: phone, message }).then(r => { results.sms = r; }));
    if (whatsappNumber && message) tasks.push(sendWhatsApp({ to: whatsappNumber, message }).then(r => { results.whatsapp = r; }));
    if (messengerId && message) tasks.push(sendMessenger({ recipientId: messengerId, message }).then(r => { results.messenger = r; }));
    if (instagramId && message) tasks.push(sendInstagram({ recipientId: instagramId, message }).then(r => { results.instagram = r; }));
    if (viberId && message) tasks.push(sendViber({ to: viberId, message }).then(r => { results.viber = r; }));
    if (telegramChatId && message) tasks.push(sendTelegram({ chatId: telegramChatId, message }).then(r => { results.telegram = r; }));

    await Promise.all(tasks);
    res.json({ success: true, results });
});

// ----------------------------------------------------------------------------
// Payments
// ----------------------------------------------------------------------------
app.post('/api/payments/create-checkout', paymentLimiter, async (req, res) => {
    try {
        if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

        const { planId, userId, successUrl, cancelUrl } = req.body;
        if (!planId) return res.status(400).json({ error: 'Missing planId' });

        let priceId = '';
        if (planId === 'monthly') priceId = STRIPE_MONTHLY_PRICE_ID || req.body.priceId;
        else if (planId === 'yearly') priceId = STRIPE_YEARLY_PRICE_ID || req.body.priceId;
        else return res.status(400).json({ error: 'Invalid planId. Use "monthly" or "yearly"' });

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID not configured. Set STRIPE_MONTHLY_PRICE_ID or STRIPE_YEARLY_PRICE_ID' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: successUrl || `${FRONTEND_URL}?payment=success`,
            cancel_url: cancelUrl || `${FRONTEND_URL}?payment=cancel`,
            customer_email: userId, // frontend passes email as userId
            metadata: { userId: userId || '', planId }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: error.message || 'Failed to create checkout session' });
    }
});

app.post('/api/payments/verify-payment', paymentLimiter, async (req, res) => {
    try {
        if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId (email)' });

        const customers = await stripe.customers.list({ email: userId, limit: 1 });
        if (customers.data.length === 0) {
            return res.json({ subscription: null, message: 'No subscription found' });
        }
        const customer = customers.data[0];
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id, status: 'active', limit: 1
        });
        if (subscriptions.data.length === 0) {
            return res.json({ subscription: null, message: 'No active subscription found' });
        }
        const subscription = subscriptions.data[0];
        const priceId = subscription.items.data[0].price.id;
        const plan = planFromPriceId(priceId) || 'monthly';

        res.json({
            subscription: {
                plan,
                status: subscription.status,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: customer.id,
                startDate: new Date(subscription.created * 1000).toISOString(),
                endDate: subscriptionPeriodEnd(subscription)
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: error.message || 'Failed to verify payment' });
    }
});

// Server-side premium gate: trust this over localStorage
app.get('/api/payments/subscription', paymentLimiter, async (req, res) => {
    try {
        const userId = String(req.query.userId || '').trim();
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        // Prefer DB record (cheap), fall back to live Stripe check
        if (supabaseAdmin) {
            const { data, error } = await supabaseAdmin
                .from('subscriptions')
                .select('plan,status,stripe_subscription_id,stripe_customer_id,start_date,end_date')
                .eq('user_email', userId)
                .maybeSingle();
            if (!error && data) {
                const active = data.status === 'active'
                    && (!data.end_date || new Date(data.end_date) > new Date());
                return res.json({
                    plan: data.plan,
                    status: data.status,
                    active,
                    endDate: data.end_date,
                    stripeSubscriptionId: data.stripe_subscription_id,
                    stripeCustomerId: data.stripe_customer_id,
                    source: 'db'
                });
            }
        }

        if (!stripe) {
            return res.json({ plan: 'free', status: 'inactive', active: false, source: 'none' });
        }
        const customers = await stripe.customers.list({ email: userId, limit: 1 });
        if (customers.data.length === 0) {
            return res.json({ plan: 'free', status: 'inactive', active: false, source: 'stripe' });
        }
        const subs = await stripe.subscriptions.list({
            customer: customers.data[0].id, status: 'active', limit: 1
        });
        if (subs.data.length === 0) {
            return res.json({ plan: 'free', status: 'inactive', active: false, source: 'stripe' });
        }
        const sub = subs.data[0];
        const plan = planFromPriceId(sub.items.data[0].price.id) || 'monthly';
        res.json({
            plan,
            status: sub.status,
            active: true,
            endDate: subscriptionPeriodEnd(sub),
            stripeSubscriptionId: sub.id,
            stripeCustomerId: customers.data[0].id,
            source: 'stripe'
        });
    } catch (error) {
        console.error('Subscription lookup error:', error);
        res.status(500).json({ error: error.message || 'Lookup failed' });
    }
});

app.post('/api/payments/cancel-subscription', paymentLimiter, async (req, res) => {
    try {
        if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
        const { subscriptionId } = req.body;
        if (!subscriptionId) return res.status(400).json({ error: 'Missing subscriptionId' });

        const subscription = await stripe.subscriptions.cancel(subscriptionId);

        if (supabaseAdmin) {
            await supabaseAdmin.from('subscriptions')
                .update({ status: subscription.status, cancelled_at: new Date().toISOString() })
                .eq('stripe_subscription_id', subscriptionId);
        }

        res.json({
            success: true,
            subscription: { status: subscription.status, cancelledAt: new Date().toISOString() }
        });
    } catch (error) {
        console.error('Subscription cancellation error:', error);
        res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
    }
});

// Stripe webhook (raw body — mounted at top, before express.json)
async function handleStripeWebhook(req, res) {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
        return res.status(400).send('Webhook secret not configured');
    }
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userEmail = session.customer_email || session.metadata?.userId;
                const planFromMeta = session.metadata?.planId || null;
                if (userEmail && session.subscription) {
                    // Fetch subscription to get accurate price + period
                    const sub = await stripe.subscriptions.retrieve(session.subscription);
                    const priceId = sub.items.data[0].price.id;
                    const plan = planFromPriceId(priceId) || planFromMeta || 'monthly';
                    await upsertSubscription({
                        userEmail,
                        plan,
                        status: sub.status,
                        stripeSubscriptionId: sub.id,
                        stripeCustomerId: sub.customer,
                        startDate: new Date(sub.created * 1000).toISOString(),
                        endDate: subscriptionPeriodEnd(sub)
                    });
                }
                break;
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                const customer = await stripe.customers.retrieve(sub.customer);
                const userEmail = customer?.email;
                if (userEmail) {
                    const priceId = sub.items.data[0].price.id;
                    const plan = planFromPriceId(priceId) || 'monthly';
                    await upsertSubscription({
                        userEmail,
                        plan,
                        status: sub.status,
                        stripeSubscriptionId: sub.id,
                        stripeCustomerId: sub.customer,
                        startDate: new Date(sub.created * 1000).toISOString(),
                        endDate: subscriptionPeriodEnd(sub)
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                if (supabaseAdmin) {
                    await supabaseAdmin.from('subscriptions')
                        .update({
                            status: 'cancelled',
                            plan: 'free',
                            cancelled_at: new Date().toISOString()
                        })
                        .eq('stripe_subscription_id', sub.id);
                }
                break;
            }
            default:
                // Ignored event types are fine; Stripe needs a 200.
                break;
        }
        res.json({ received: true });
    } catch (err) {
        console.error('Webhook handler error:', err);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
}

async function upsertSubscription({
    userEmail, plan, status, stripeSubscriptionId, stripeCustomerId, startDate, endDate
}) {
    if (!supabaseAdmin) {
        console.warn('No Supabase admin client — subscription state cannot be persisted.');
        return;
    }
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
            user_email: userEmail,
            plan,
            status,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            start_date: startDate,
            end_date: endDate,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_email' });
    if (error) console.error('Subscription upsert error:', error);
}

app.get('/api/payments/plans', (_req, res) => {
    res.json({
        plans: {
            free: {
                id: 'free', name: 'Free', price: 0,
                features: ['Access to free courses', 'Basic features']
            },
            monthly: {
                id: 'monthly', name: 'Monthly Premium', price: 9.99, interval: 'month',
                features: ['All courses', 'AI tutor', 'Certificates', 'Priority support']
            },
            yearly: {
                id: 'yearly', name: 'Yearly Premium', price: 99.99, interval: 'year',
                features: ['All courses', 'AI tutor', 'Certificates', 'Priority support', 'Save 17%']
            }
        }
    });
});

// ----------------------------------------------------------------------------
// Email templates
// ----------------------------------------------------------------------------
function welcomeEmailHtml(name) {
    return `
        <!DOCTYPE html>
        <html><head><style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style></head>
        <body><div class="container">
            <div class="header"><h1>🎓 Welcome to School Platform!</h1></div>
            <div class="content">
                <h2>Hi ${escapeHtml(name)}!</h2>
                <p>Welcome to our learning platform! We're excited to have you join us.</p>
                <p>Get started by exploring our courses and begin your learning journey today.</p>
                <a href="${FRONTEND_URL}" class="button">Start Learning</a>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                    If you didn't sign up for this account, please ignore this email.
                </p>
            </div>
        </div></body></html>`;
}

function courseCompletedEmailHtml(name, courseTitle) {
    return `
        <!DOCTYPE html>
        <html><head><style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #48bb78; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style></head>
        <body><div class="container">
            <div class="header"><h1>🎉 Congratulations!</h1></div>
            <div class="content">
                <h2>Hi ${escapeHtml(name)}!</h2>
                <p>Amazing work! You've completed the course: <strong>${escapeHtml(courseTitle)}</strong></p>
                <p>Your dedication and hard work have paid off. Keep up the great learning!</p>
                <a href="${FRONTEND_URL}" class="button">View Certificate</a>
            </div>
        </div></body></html>`;
}

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------------
// Start
// ----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend Server running on port ${PORT}`);
    console.log(`🌐 Allowed origins: ${[...allowedOrigins].join(', ') || '(none)'}`);
    console.log(`📝 Groq API: ${GROQ_API_KEY ? '✅' : '❌'}`);
    console.log(`📝 OpenAI API: ${OPENAI_API_KEY ? '✅' : '❌'}`);
    console.log(`📧 Resend Email: ${RESEND_API_KEY ? '✅' : '❌'} (from: ${EMAIL_FROM})`);
    console.log(`💬 Twilio SMS: ${TWILIO_ACCOUNT_SID ? '✅' : '❌'}`);
    console.log(`📱 Messenger: ${FACEBOOK_PAGE_ACCESS_TOKEN ? '✅' : '❌'}`);
    console.log(`💚 WhatsApp: ${WHATSAPP_PHONE_NUMBER_ID ? '✅' : '❌'}`);
    console.log(`📷 Instagram: ${INSTAGRAM_BUSINESS_ACCOUNT_ID ? '✅' : '❌'}`);
    console.log(`💜 Viber: ${VIBER_AUTH_TOKEN ? '✅' : '❌'}`);
    console.log(`✈️  Telegram: ${TELEGRAM_BOT_TOKEN ? '✅' : '❌'}`);
    console.log(`🎮 Discord: ${DISCORD_WEBHOOK_URL ? '✅' : '❌'}`);
    console.log(`💳 Stripe: ${STRIPE_SECRET_KEY ? '✅' : '❌'} (webhook: ${STRIPE_WEBHOOK_SECRET ? '✅' : '❌'})`);
    console.log(`🗄️  Supabase: ${SUPABASE_URL ? '✅' : '❌'} (admin: ${supabaseAdmin ? '✅' : '❌'})`);
});
