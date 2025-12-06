// AI API Configuration
// Store API keys securely (user can update via settings)

const AIConfig = {
    // API Keys (user can set these via settings)
    // Set your API keys through the settings panel or localStorage
    groqApiKey: localStorage.getItem('groq_api_key') || '',
    openaiApiKey: localStorage.getItem('openai_api_key') || '',
    
    // API Endpoints
    groqEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    openaiEndpoint: 'https://api.openai.com/v1/chat/completions',
    
    // Default model preferences
    groqModel: 'llama-3.1-70b-versatile', // Fast and free
    openaiModel: 'gpt-4o-mini', // Cost-effective
    
    // Save API keys
    setGroqKey(key) {
        this.groqApiKey = key;
        localStorage.setItem('groq_api_key', key);
    },
    
    setOpenAIKey(key) {
        this.openaiApiKey = key;
        localStorage.setItem('openai_api_key', key);
    },
    
    // Call Groq API (faster, good for chat/search)
    async callGroqAPI(messages, options = {}) {
        if (!this.groqApiKey) {
            throw new Error('Groq API key not configured');
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
    
    // Call OpenAI API (better for complex tasks like grading)
    async callOpenAIAPI(messages, options = {}) {
        if (!this.openaiApiKey) {
            throw new Error('OpenAI API key not configured');
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

