// Simple Backend Proxy for AI API Keys
// Deploy this to Railway, Render, or Fly.io
// Set GROQ_API_KEY and OPENAI_API_KEY as environment variables

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Allow frontend to call this API
app.use(express.json());

// Get API keys from environment variables (set these in your hosting platform)
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 AI Proxy Server running on port ${PORT}`);
    console.log(`📝 Groq API: ${GROQ_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📝 OpenAI API: ${OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});

