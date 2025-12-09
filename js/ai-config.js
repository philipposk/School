// AI API Configuration
// Uses backend proxy if available, falls back to direct API calls with user keys

const AIConfig = {
    // Backend URL (set via settings or localStorage, defaults to Fly.io backend)
    backendUrl: localStorage.getItem('backend_url') || 'https://school-backend.fly.dev',
    
    // API Keys (fallback - user can set these via settings if no backend)
    groqApiKey: localStorage.getItem('groq_api_key') || '',
    openaiApiKey: localStorage.getItem('openai_api_key') || '',
    
    // API Endpoints
    groqEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    openaiEndpoint: 'https://api.openai.com/v1/chat/completions',
    
    // Default model preferences with fallbacks
    groqModels: [
        'llama-3.3-70b-versatile', // Primary (fast and free)
        'llama-3.1-8b-instant',    // Fallback 1 (faster, smaller)
        'mixtral-8x7b-32768',      // Fallback 2 (alternative)
        'gemma2-9b-it'              // Fallback 3 (backup)
    ],
    groqModel: 'llama-3.3-70b-versatile', // Current model (for backward compatibility)
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
    
    // Call Groq API with automatic model fallback (uses backend proxy if available, otherwise direct)
    async callGroqAPI(messages, options = {}) {
        const modelsToTry = options.model ? [options.model] : this.groqModels;
        let lastError = null;
        
        // Try backend proxy first
        if (this.hasBackend()) {
            for (const model of modelsToTry) {
                try {
                    const response = await fetch(`${this.backendUrl}/api/ai/groq`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            messages, 
                            options: { ...options, model } 
                        })
                    });
                    
                    if (!response.ok) {
                        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
                        const errorMsg = error.error?.message || '';
                        
                        // If model is deprecated or unavailable, try next model
                        if (errorMsg.includes('decommissioned') || errorMsg.includes('not available') || response.status === 400) {
                            console.warn(`Model ${model} failed, trying next model...`);
                            lastError = new Error(errorMsg);
                            continue; // Try next model
                        }
                        
                        throw new Error(errorMsg || `API error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log(`✅ Groq API success with model: ${model}`);
                    return data.choices[0].message.content;
                } catch (error) {
                    lastError = error;
                    // If it's a model-specific error, try next model
                    if (error.message.includes('decommissioned') || error.message.includes('not available')) {
                        console.warn(`Model ${model} failed: ${error.message}, trying next model...`);
                        continue;
                    }
                    // Other errors: try direct API or throw
                    break;
                }
            }
            
            // If backend failed, try direct API
            console.warn('Backend proxy failed, falling back to direct API');
        }
        
        // Fallback: Direct API call (requires user's API key)
        if (!this.groqApiKey) {
            throw new Error('Groq API key not configured. Please set up backend proxy or add your API key in Settings.');
        }
        
        // Try direct API with model fallback
        for (const model of modelsToTry) {
            try {
                const response = await fetch(this.groqEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.groqApiKey}`
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
                    
                    // If model is deprecated, try next model
                    if (errorMsg.includes('decommissioned') || errorMsg.includes('not available')) {
                        console.warn(`Model ${model} failed, trying next model...`);
                        lastError = new Error(errorMsg);
                        continue;
                    }
                    
                    throw new Error(errorMsg || `API error: ${response.status}`);
                }
                
                const data = await response.json();
                console.log(`✅ Groq API success with model: ${model}`);
                return data.choices[0].message.content;
            } catch (error) {
                lastError = error;
                // If it's a model-specific error, try next model
                if (error.message.includes('decommissioned') || error.message.includes('not available')) {
                    console.warn(`Model ${model} failed: ${error.message}, trying next model...`);
                    continue;
                }
                throw error;
            }
        }
        
        // All models failed
        throw lastError || new Error('All Groq models failed. Please check your API configuration.');
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
