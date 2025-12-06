// AI API Configuration
// Uses backend proxy if available, falls back to direct API calls with user keys

const AIConfig = {
    // Backend URL (set via settings or localStorage)
    backendUrl: localStorage.getItem('backend_url') || '',
    
    // API Keys (fallback - user can set these via settings if no backend)
    groqApiKey: localStorage.getItem('groq_api_key') || '',
    openaiApiKey: localStorage.getItem('openai_api_key') || '',
    
    // API Endpoints
    groqEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    openaiEndpoint: 'https://api.openai.com/v1/chat/completions',
    
    // Default model preferences
    groqModel: 'llama-3.1-70b-versatile', // Fast and free
    openaiModel: 'gpt-4o-mini', // Cost-effective
    
    // Check if backend is configured
    hasBackend() {
        return !!this.backendUrl && this.backendUrl.trim() !== '';
    },
    
    // Set backend URL
    setBackendUrl(url) {
        this.backendUrl = url;
        localStorage.setItem('backend_url', url);
    },
    
    // Save API keys (fallback mode)
    setGroqKey(key) {
        this.groqApiKey = key;
        localStorage.setItem('groq_api_key', key);
    },
    
    setOpenAIKey(key) {
        this.openaiApiKey = key;
        localStorage.setItem('openai_api_key', key);
    },
    
    // Call Groq API (uses backend proxy if available, otherwise direct)
    async callGroqAPI(messages, options = {}) {
        // Try backend proxy first
        if (this.hasBackend()) {
            try {
                const response = await fetch(`${this.backendUrl}/api/ai/groq`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages, options })
                });
                
                if (!response.ok) {
                    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
                    throw new Error(error.error?.message || `API error: ${response.status}`);
                }
                
                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.warn('Backend proxy failed, falling back to direct API:', error);
                // Fall through to direct API call
            }
        }
        
        // Fallback: Direct API call (requires user's API key)
        if (!this.groqApiKey) {
            throw new Error('Groq API key not configured. Please set up backend proxy or add your API key in Settings.');
        }
        
        const response = await fetch(this.groqEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.groqApiKey}`
            },
            body: JSON.stringify({
                model: options.model || this.groqModel,
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 1000,
                stream: false
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    },
    
    // Call OpenAI API (uses backend proxy if available, otherwise direct)
    async callOpenAIAPI(messages, options = {}) {
        // Try backend proxy first
        if (this.hasBackend()) {
            try {
                const response = await fetch(`${this.backendUrl}/api/ai/openai`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages, options })
                });
                
                if (!response.ok) {
                    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
                    throw new Error(error.error?.message || `API error: ${response.status}`);
                }
                
                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.warn('Backend proxy failed, falling back to direct API:', error);
                // Fall through to direct API call
            }
        }
        
        // Fallback: Direct API call (requires user's API key)
        if (!this.openaiApiKey) {
            throw new Error('OpenAI API key not configured. Please set up backend proxy or add your API key in Settings.');
        }
        
        const response = await fetch(this.openaiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openaiApiKey}`
            },
            body: JSON.stringify({
                model: options.model || this.openaiModel,
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 2000,
                stream: false
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
};

// Export
window.AIConfig = AIConfig;

