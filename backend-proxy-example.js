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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for Groq API
app.post('/api/ai/groq', async (req, res) => {
    try {
        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'Groq API key not configured on server' });
        }

        const { messages, options = {} } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: options.model || 'llama-3.1-70b-versatile',
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 1000,
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on port ${PORT}`);
    console.log(`📝 Groq API: ${GROQ_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📝 OpenAI API: ${OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📧 Resend Email: ${RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`💬 Twilio SMS: ${TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🗄️  Supabase: ${SUPABASE_URL ? '✅ Configured' : '❌ Not configured'}`);
});

