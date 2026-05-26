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

// Null-safe price-id reader. A subscription event with no items (rare but
// valid for some Stripe flows) would otherwise throw and 500 the webhook.
function subscriptionPriceId(sub) {
    return sub?.items?.data?.[0]?.price?.id || null;
}

// RFC-5322-lite email validation (server-side sanity check, not a guarantee).
function isLikelyEmail(s) {
    return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// Verify a Supabase access-token JWT and return the user's email.
// Returns null on any failure (no token, invalid, expired, supabase down).
async function emailFromBearer(req) {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return null;
    if (!supabaseAdmin) return null;
    try {
        const { data, error } = await supabaseAdmin.auth.getUser(m[1]);
        if (error || !data?.user?.email) return null;
        return data.user.email;
    } catch (err) {
        console.warn('emailFromBearer error:', err.message);
        return null;
    }
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

        // Anonymous checkout produces orphan subscriptions (webhook can't
        // link them to a user). Require a valid-looking email up front.
        // Prefer the auth bearer if present; fall back to the body field.
        const verifiedEmail = await emailFromBearer(req);
        const email = verifiedEmail || (typeof userId === 'string' ? userId.trim() : '');
        if (!isLikelyEmail(email)) {
            return res.status(400).json({ error: 'Missing or invalid userId (must be a valid email).' });
        }

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
            customer_email: email,
            metadata: { userId: email, planId }
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
        const verifiedEmail = await emailFromBearer(req);
        const bodyEmail = (req.body?.userId || '').toString().trim();
        if (verifiedEmail && bodyEmail && verifiedEmail.toLowerCase() !== bodyEmail.toLowerCase()) {
            return res.status(403).json({ error: 'Token does not match userId.' });
        }
        const userId = verifiedEmail || bodyEmail;
        if (!isLikelyEmail(userId)) return res.status(400).json({ error: 'Missing or invalid userId (email)' });

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
        const priceId = subscriptionPriceId(subscription);
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

// Server-side premium gate: trust this over localStorage.
// Prefer a verified Supabase JWT (Authorization: Bearer …); the email query
// param is allowed only as a fallback for callers that haven't been migrated
// yet, and never lets one user inspect another user's plan.
app.get('/api/payments/subscription', paymentLimiter, async (req, res) => {
    try {
        const verifiedEmail = await emailFromBearer(req);
        const queryEmail = String(req.query.userId || '').trim();
        // If the caller sent a JWT and a query email, they must match.
        if (verifiedEmail && queryEmail && verifiedEmail.toLowerCase() !== queryEmail.toLowerCase()) {
            return res.status(403).json({ error: 'Token does not match userId.' });
        }
        const userId = verifiedEmail || queryEmail;
        if (!isLikelyEmail(userId)) {
            return res.status(400).json({ error: 'Missing or invalid userId (must be a valid email).' });
        }

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
        const plan = planFromPriceId(subscriptionPriceId(sub)) || 'monthly';
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
                if (!userEmail) {
                    console.warn('Webhook: checkout.session.completed with no email; cannot link to a user.');
                    break;
                }
                if (session.subscription) {
                    // Fetch subscription to get accurate price + period
                    const sub = await stripe.subscriptions.retrieve(session.subscription);
                    const priceId = subscriptionPriceId(sub);
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
                // Resolve the user email: prefer live customer record, fall
                // back to the row we already wrote by stripe_subscription_id.
                // Stripe returns a stub `{deleted:true}` for deleted customers.
                let userEmail = null;
                try {
                    const customer = await stripe.customers.retrieve(sub.customer);
                    if (customer && !customer.deleted) userEmail = customer.email || null;
                } catch (e) {
                    console.warn('Webhook: customer retrieve failed:', e.message);
                }
                if (!userEmail && supabaseAdmin) {
                    const { data } = await supabaseAdmin
                        .from('subscriptions')
                        .select('user_email')
                        .eq('stripe_subscription_id', sub.id)
                        .maybeSingle();
                    if (data?.user_email) userEmail = data.user_email;
                }
                if (!userEmail) {
                    console.warn(`Webhook: no email for subscription ${sub.id}; skipping upsert.`);
                    break;
                }
                const priceId = subscriptionPriceId(sub);
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

// ============================================================================
// PHASE 1–6 ROUTES
// ============================================================================

// Auth middleware: attach req.userEmail + req.userId if the bearer is valid.
async function requireAuth(req, res, next) {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m || !supabaseAdmin) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    try {
        const { data, error } = await supabaseAdmin.auth.getUser(m[1]);
        if (error || !data?.user) return res.status(401).json({ error: 'Invalid token.' });
        req.userId = data.user.id;
        req.userEmail = data.user.email;
        req.userToken = m[1];
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Auth failed.' });
    }
}

// Helper: a Supabase client scoped to the calling user, so RLS applies.
function supabaseAs(token) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    try {
        const { createClient } = require('@supabase/supabase-js');
        return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { autoRefreshToken: false, persistSession: false }
        });
    } catch (_) { return null; }
}

// ---------- P1.1 Lesson comments ----------------------------------------------
app.get('/api/comments/:slug/:n', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
    const { slug, n } = req.params;
    // Two-step fetch: comments then profiles. We can't ask Supabase REST to
    // auto-resolve `profiles!inner(...)` because lesson_comments.user_id has
    // its FK on auth.users (not public.profiles), so the implicit join fails.
    const { data: comments, error } = await supabaseAdmin
        .from('lesson_comments')
        .select('id, body, created_at, parent_id, user_id')
        .eq('course_slug', slug)
        .eq('module_n', Number(n))
        .order('created_at', { ascending: true })
        .limit(200);
    if (error) return res.status(500).json({ error: error.message });
    const userIds = [...new Set((comments || []).map(c => c.user_id).filter(Boolean))];
    let profileMap = {};
    if (userIds.length) {
        const { data: profs } = await supabaseAdmin
            .from('profiles')
            .select('id, name, avatar_url, handle')
            .in('id', userIds);
        profileMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
    }
    const enriched = (comments || []).map(c => ({ ...c, profiles: profileMap[c.user_id] || null }));
    res.json({ comments: enriched });
});

app.post('/api/comments/:slug/:n', requireAuth, async (req, res) => {
    const { slug, n } = req.params;
    const body = (req.body?.body || '').toString().trim();
    if (!body || body.length > 5000) return res.status(400).json({ error: 'Comment must be 1–5000 chars.' });
    const parent_id = req.body?.parent_id || null;
    const client = supabaseAs(req.userToken) || supabaseAdmin;
    const { data, error } = await client
        .from('lesson_comments')
        .insert({ course_slug: slug, module_n: Number(n), user_id: req.userId, body, parent_id })
        .select()
        .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ comment: data });
});

app.delete('/api/comments/:id', requireAuth, async (req, res) => {
    const client = supabaseAs(req.userToken) || supabaseAdmin;
    const { error } = await client.from('lesson_comments').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

// ---------- P1.2 Certificates ------------------------------------------------
app.post('/api/certificates/issue', requireAuth, async (req, res) => {
    const { courseSlug, courseTitle, studentName } = req.body || {};
    if (!courseSlug || !courseTitle) return res.status(400).json({ error: 'Missing courseSlug / courseTitle.' });
    // Verify premium server-side: only PRO users get persisted certs.
    if (supabaseAdmin) {
        const { data: sub } = await supabaseAdmin.from('subscriptions')
            .select('status,end_date').eq('user_email', req.userEmail).maybeSingle();
        const active = sub && sub.status === 'active' && (!sub.end_date || new Date(sub.end_date) > new Date());
        if (!active) return res.status(402).json({ error: 'Certificates are a premium feature.' });
    }
    const certNumber = 'CT-' + (require('crypto').randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase());
    const { data, error } = await supabaseAdmin.from('certificates').insert({
        certificate_number: certNumber,
        user_id: req.userId,
        user_email: req.userEmail,
        student_name: (studentName || '').slice(0, 120) || req.userEmail.split('@')[0],
        course_slug: courseSlug,
        course_title: courseTitle.slice(0, 200)
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ certificate: data });
});

app.get('/api/certificates/verify/:certNumber', async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
    const { data, error } = await supabaseAdmin
        .from('certificates')
        .select('certificate_number, student_name, course_slug, course_title, issued_at, revoked')
        .eq('certificate_number', req.params.certNumber)
        .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Certificate not found.' });
    res.json({ certificate: data });
});

// ---------- P1.3 Notifications -----------------------------------------------
app.get('/api/notifications', requireAuth, async (req, res) => {
    const client = supabaseAs(req.userToken) || supabaseAdmin;
    const { data, error } = await client
        .from('notifications')
        .select('*')
        .eq('user_id', req.userId)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ notifications: data, unread: data.filter(n => !n.read_at).length });
});

app.post('/api/notifications/:id/read', requireAuth, async (req, res) => {
    const client = supabaseAs(req.userToken) || supabaseAdmin;
    const { error } = await client
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', req.userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

async function createNotification({ userId, kind, title, body, url }) {
    if (!supabaseAdmin || !userId) return;
    await supabaseAdmin.from('notifications').insert({ user_id: userId, kind, title, body, url });
}

// ---------- P1.4 Stripe Customer Portal --------------------------------------
app.post('/api/payments/portal', requireAuth, paymentLimiter, async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
    // Find or create customer by email.
    try {
        let customer;
        const customers = await stripe.customers.list({ email: req.userEmail, limit: 1 });
        if (customers.data.length > 0) customer = customers.data[0];
        else customer = await stripe.customers.create({ email: req.userEmail });
        const session = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: req.body?.returnUrl || FRONTEND_URL
        });
        res.json({ url: session.url });
    } catch (e) {
        console.error('portal error:', e);
        res.status(500).json({ error: e.message || 'Portal failed.' });
    }
});

// ---------- P1.8 GDPR export + delete ----------------------------------------
app.get('/api/user/export', requireAuth, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
    try {
        const tables = ['profiles', 'user_progress', 'quiz_scores', 'user_notes',
            'lesson_comments', 'certificates', 'subscriptions', 'notifications',
            'community_posts', 'post_comments', 'post_likes',
            'flashcards', 'flashcard_reviews', 'user_streaks', 'user_badges'];
        const dump = { exported_at: new Date().toISOString(), user_id: req.userId, email: req.userEmail };
        for (const t of tables) {
            const col = t === 'subscriptions' ? 'user_email' : 'user_id';
            const val = t === 'subscriptions' ? req.userEmail : req.userId;
            const { data } = await supabaseAdmin.from(t).select('*').eq(col, val);
            dump[t] = data || [];
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="school-export-${Date.now()}.json"`);
        res.send(JSON.stringify(dump, null, 2));
    } catch (e) {
        console.error('export error:', e);
        res.status(500).json({ error: e.message || 'Export failed.' });
    }
});

app.delete('/api/user/delete', requireAuth, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'DB not configured' });
    try {
        // Stripe: cancel any active sub before nuking the row.
        if (stripe) {
            try {
                const customers = await stripe.customers.list({ email: req.userEmail, limit: 1 });
                if (customers.data[0]) {
                    const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: 'active' });
                    for (const s of subs.data) await stripe.subscriptions.cancel(s.id);
                    await stripe.customers.del(customers.data[0].id);
                }
            } catch (e) { console.warn('stripe cleanup:', e.message); }
        }
        // Auth deletion cascades via ON DELETE CASCADE on FKs.
        const { error } = await supabaseAdmin.auth.admin.deleteUser(req.userId);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ ok: true });
    } catch (e) {
        console.error('delete error:', e);
        res.status(500).json({ error: e.message || 'Delete failed.' });
    }
});

// ---------- P3.3 AI practice quiz --------------------------------------------
app.post('/api/ai/practice-quiz', aiLimiter, async (req, res) => {
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'Groq not configured' });
    const { courseTitle, moduleTitle, missedConcepts = [], count = 5 } = req.body || {};
    if (!courseTitle) return res.status(400).json({ error: 'Missing courseTitle' });

    const prompt = `Generate exactly ${count} multiple-choice quiz questions about "${moduleTitle || courseTitle}".
Focus on these missed concepts the student needs to practice: ${missedConcepts.join(', ') || '(general review)'}.

Respond as JSON only — no prose — matching this shape:
{
  "questions": [
    { "id": 1, "question": "<text>", "type": "multiple_choice",
      "options": ["a","b","c","d"], "correct_answer": <0-3>,
      "explanation": "<one sentence>" }
  ]
}`;
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are an expert educator who writes precise quizzes. Output JSON only.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5, max_tokens: 1200, stream: false
            })
        });
        const data = await response.json();
        let text = data.choices?.[0]?.message?.content || '';
        // Extract JSON from fenced or raw response
        text = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
        const first = text.indexOf('{'); const last = text.lastIndexOf('}');
        if (first === -1 || last === -1) return res.status(502).json({ error: 'AI returned non-JSON.' });
        const parsed = JSON.parse(text.slice(first, last + 1));
        res.json(parsed);
    } catch (e) {
        console.error('practice-quiz error:', e);
        res.status(500).json({ error: e.message || 'AI practice quiz failed.' });
    }
});

// ---------- P3.5 Voice tutor (Whisper transcription) -------------------------
// Accepts raw audio body (audio/webm typical) up to ~15 MB. Returns { text }.
app.post('/api/ai/whisper', aiLimiter, express.raw({ type: 'audio/*', limit: '15mb' }), async (req, res) => {
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'Groq not configured' });
    if (!req.body || !req.body.length) return res.status(400).json({ error: 'Missing audio body.' });
    try {
        const form = new FormData();
        const contentType = req.headers['content-type'] || 'audio/webm';
        const ext = contentType.includes('mp3') ? 'mp3' : contentType.includes('mp4') ? 'm4a' : 'webm';
        const blob = new Blob([req.body], { type: contentType });
        form.append('file', blob, `audio.${ext}`);
        form.append('model', 'whisper-large-v3-turbo');
        form.append('response_format', 'json');
        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
            body: form
        });
        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: err });
        }
        const data = await response.json();
        res.json({ text: data.text || '' });
    } catch (e) {
        console.error('whisper error:', e);
        res.status(500).json({ error: e.message || 'Transcription failed.' });
    }
});

// ---------- P5.3 Push subscriptions ------------------------------------------
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:noreply@school.6x7.gr';
let webpush = null;
try {
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
        webpush = require('web-push');
        webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    }
} catch (_) { /* web-push optional */ }

app.get('/api/push/vapid-public-key', (_req, res) => {
    if (!VAPID_PUBLIC_KEY) return res.status(503).json({ error: 'Push not configured.' });
    res.json({ key: VAPID_PUBLIC_KEY });
});

app.post('/api/push/subscribe', requireAuth, async (req, res) => {
    const sub = req.body?.subscription;
    if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
        return res.status(400).json({ error: 'Invalid subscription payload.' });
    }
    if (!supabaseAdmin) return res.status(503).json({ error: 'DB not configured.' });
    const { error } = await supabaseAdmin.from('push_subscriptions').upsert({
        endpoint: sub.endpoint,
        user_id: req.userId,
        p256dh: sub.keys.p256dh,
        auth_key: sub.keys.auth
    }, { onConflict: 'endpoint' });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

app.post('/api/push/unsubscribe', requireAuth, async (req, res) => {
    const endpoint = req.body?.endpoint;
    if (!endpoint || !supabaseAdmin) return res.status(400).json({ error: 'Bad request.' });
    await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', req.userId);
    res.json({ ok: true });
});

async function sendPushToUser(userId, payload) {
    if (!webpush || !supabaseAdmin) return;
    const { data } = await supabaseAdmin.from('push_subscriptions').select('*').eq('user_id', userId);
    if (!data) return;
    for (const sub of data) {
        try {
            await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth_key }
            }, JSON.stringify(payload));
        } catch (e) {
            if (e.statusCode === 410 || e.statusCode === 404) {
                await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
            } else {
                console.warn('push send failed:', e.statusCode, e.body);
            }
        }
    }
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
