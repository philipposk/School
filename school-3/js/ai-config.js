/**
 * AI API Configuration Module
 * 
 * Manages AI API configuration and provides methods for calling Groq and OpenAI APIs.
 * Uses backend proxy if available, falls back to direct API calls with user keys.
 * Implements automatic model fallback for Groq API.
 * 
 * @module AIConfig
 */

// Constants
const DEFAULT_BACKEND_URL = 'https://school-backend.fly.dev';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

// Default Groq models with fallback order
const GROQ_MODELS = [
    'llama-3.3-70b-versatile', // Primary (fast and free)
    'llama-3.1-8b-instant',    // Fallback 1 (faster, smaller)
    'mixtral-8x7b-32768',      // Fallback 2 (alternative)
    'gemma2-9b-it'              // Fallback 3 (backup)
];

// Error messages
const ERROR_MESSAGES = {
    GROQ_KEY_MISSING: 'Groq API key not configured. Please set up backend proxy or add your API key in Settings.',
    OPENAI_KEY_MISSING: 'OpenAI API key not configured. Please set up backend proxy or add your API key in Settings.',
    ALL_MODELS_FAILED: 'All Groq models failed. Please check your API configuration.',
    UNKNOWN_ERROR: 'Unknown error'
};

const AIConfig = {
    // Backend URL (set via settings or localStorage, defaults to Fly.io backend)
    backendUrl: localStorage.getItem('backend_url') || DEFAULT_BACKEND_URL,
    
    // API Keys (fallback - user can set these via settings if no backend)
    groqApiKey: localStorage.getItem('groq_api_key') || '',
    openaiApiKey: localStorage.getItem('openai_api_key') || '',
    
    // API Endpoints
    groqEndpoint: GROQ_ENDPOINT,
    openaiEndpoint: OPENAI_ENDPOINT,
    
    // Default model preferences with fallbacks
    groqModels: GROQ_MODELS,
    groqModel: DEFAULT_GROQ_MODEL, // Current model (for backward compatibility)
    openaiModel: DEFAULT_OPENAI_MODEL, // Cost-effective
    
    /**
     * Check if backend is configured
     * @returns {boolean} True if backend URL is configured
     */
    hasBackend() {
        return !!this.backendUrl && this.backendUrl.trim() !== '';
    },
    
    /**
     * Set backend URL and persist to localStorage
     * @param {string} url - Backend URL
     */
    setBackendUrl(url) {
        this.backendUrl = url;
        localStorage.setItem('backend_url', url);
    },
    
    /**
     * Save Groq API key and persist to localStorage
     * @param {string} key - Groq API key
     */
    setGroqKey(key) {
        this.groqApiKey = key;
        localStorage.setItem('groq_api_key', key);
    },
    
    /**
     * Save OpenAI API key and persist to localStorage
     * @param {string} key - OpenAI API key
     */
    setOpenAIKey(key) {
        this.openaiApiKey = key;
        localStorage.setItem('openai_api_key', key);
    },
    
    /**
     * Parse error response from API
     * @param {Response} response - Fetch response object
     * @returns {Promise<Object>} Parsed error object
     */
    async _parseErrorResponse(response) {
        try {
            const error = await response.json();
            return error.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
        } catch {
            return ERROR_MESSAGES.UNKNOWN_ERROR;
        }
    },
    
    /**
     * Check if error is model-specific (deprecated/unavailable)
     * @param {string} errorMsg - Error message
     * @returns {boolean} True if error is model-specific
     */
    _isModelError(errorMsg) {
        return errorMsg.includes('decommissioned') || errorMsg.includes('not available');
    },
    
    /**
     * Call API via backend proxy
     * @param {string} endpoint - API endpoint path
     * @param {Object} payload - Request payload
     * @returns {Promise<Object>} Response data
     */
    async _callBackendProxy(endpoint, payload) {
        const response = await fetch(`${this.backendUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorMsg = await this._parseErrorResponse(response);
            throw new Error(errorMsg || `API error: ${response.status}`);
        }
        
        return await response.json();
    },
    
    /**
     * Call Groq API directly with API key
     * @param {string} model - Model name
     * @param {Array} messages - Chat messages
     * @param {Object} options - API options
     * @returns {Promise<Object>} Response data
     */
    async _callGroqDirect(model, messages, options) {
        const response = await fetch(this.groqEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.groqApiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 1000,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorMsg = await this._parseErrorResponse(response);
            throw new Error(errorMsg || `API error: ${response.status}`);
        }
        
        return await response.json();
    },
    
    /**
     * Try models with fallback logic
     * @param {Array<string>} models - Models to try
     * @param {Function} apiCallFn - Function to call API for each model
     * @returns {Promise<string>} API response content
     */
    async _tryModelsWithFallback(models, apiCallFn) {
        let lastError = null;
        
        for (const model of models) {
            try {
                const data = await apiCallFn(model);
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    console.log(`✅ Groq API success with model: ${model}`);
                    return content;
                }
                throw new Error('Invalid response format');
            } catch (error) {
                lastError = error;
                const errorMsg = error.message || '';
                
                // If it's a model-specific error, try next model
                if (this._isModelError(errorMsg)) {
                    console.warn(`Model ${model} failed: ${errorMsg}, trying next model...`);
                    continue;
                }
                
                // For non-model errors, break and try next method
                break;
            }
        }
        
        throw lastError || new Error(ERROR_MESSAGES.ALL_MODELS_FAILED);
    },
    
    /**
     * Call Groq API with automatic model fallback
     * Uses backend proxy if available, otherwise direct API calls
     * 
     * @param {Array<Object>} messages - Chat messages array
     * @param {Object} options - API options (model, temperature, max_tokens)
     * @returns {Promise<string>} AI response content
     * @throws {Error} If all models fail or API key is missing
     */
    async callGroqAPI(messages, options = {}) {
        const modelsToTry = options.model ? [options.model] : this.groqModels;
        
        // Try backend proxy first
        if (this.hasBackend()) {
            try {
                return await this._tryModelsWithFallback(modelsToTry, async (model) => {
                    return await this._callBackendProxy('/api/ai/groq', {
                        messages,
                        options: { ...options, model }
                    });
                });
            } catch (error) {
                // If backend fails, try direct API
                if (!this._isModelError(error.message)) {
                    console.warn('Backend proxy failed, falling back to direct API');
                }
            }
        }
        
        // Fallback: Direct API call (requires user's API key)
        if (!this.groqApiKey) {
            throw new Error(ERROR_MESSAGES.GROQ_KEY_MISSING);
        }
        
        return await this._tryModelsWithFallback(modelsToTry, async (model) => {
            return await this._callGroqDirect(model, messages, options);
        });
    },
    
    /**
     * Call OpenAI API directly with API key
     * @param {Array} messages - Chat messages
     * @param {Object} options - API options
     * @returns {Promise<Object>} Response data
     */
    async _callOpenAIDirect(messages, options) {
        const response = await fetch(this.openaiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openaiApiKey}`
            },
            body: JSON.stringify({
                model: options.model || this.openaiModel,
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 2000,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorMsg = await this._parseErrorResponse(response);
            throw new Error(errorMsg || `API error: ${response.status}`);
        }
        
        return await response.json();
    },
    
    /**
     * Call OpenAI API
     * Uses backend proxy if available, otherwise direct API calls
     * 
     * @param {Array<Object>} messages - Chat messages array
     * @param {Object} options - API options (model, temperature, max_tokens)
     * @returns {Promise<string>} AI response content
     * @throws {Error} If API call fails or API key is missing
     */
    async callOpenAIAPI(messages, options = {}) {
        // Try backend proxy first
        if (this.hasBackend()) {
            try {
                const data = await this._callBackendProxy('/api/ai/openai', { messages, options });
                return data.choices?.[0]?.message?.content || '';
            } catch (error) {
                console.warn('Backend proxy failed, falling back to direct API:', error.message);
                // Fall through to direct API call
            }
        }
        
        // Fallback: Direct API call (requires user's API key)
        if (!this.openaiApiKey) {
            throw new Error(ERROR_MESSAGES.OPENAI_KEY_MISSING);
        }
        
        const data = await this._callOpenAIDirect(messages, options);
        return data.choices?.[0]?.message?.content || '';
    }
};

// Export
window.AIConfig = AIConfig;
