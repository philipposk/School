# AI Integration Information

## Current Status

### ❌ AI Search Assistant
**Status**: NOT connected to a real AI API
**Current Implementation**: Keyword-based search
**Console Error**: The "Unsupported domain for continue button" error is likely from browser autofill/autocomplete features, not an AI API issue.

**How it works now:**
- Searches course titles, descriptions, and module content
- Uses simple keyword matching
- Provides basic natural language query understanding (e.g., "quiz" → shows quizzes)

**To connect to a real AI API:**
1. Sign up for OpenAI API or Anthropic Claude API
2. Get an API key
3. Update `js/enhanced-features.js` → `AISearchAssistant.search()` function
4. Replace keyword search with API call
5. Add API key securely (use environment variables or secure backend)

### ✅ AI Tutor (Messaging)
**Status**: Simulated responses (not connected to real API)
**Location**: `js/messaging.js` → `MessagingManager.generateAIResponse()`

**Current Implementation:**
- Provides contextual responses based on keywords
- Uses search history for context
- Simulates AI-like responses

**To connect to a real AI API:**
1. Same steps as AI Search Assistant
2. Update `MessagingManager.handleAITutorResponse()` function
3. Call OpenAI/Claude API with conversation history
4. Include RAG (Retrieval Augmented Generation) for course content context

### ✅ AI Assignment Grading
**Status**: Simulated grading (not connected to real API)
**Location**: `js/assignments.js` → `AssignmentManager.generateAIFeedback()`

**Current Implementation:**
- Analyzes word count
- Checks for key concepts (keyword matching)
- Generates feedback based on basic criteria
- Calculates score based on simple rules

**To connect to a real AI API:**
1. Use OpenAI GPT-4 or Claude for grading
2. Provide assignment rubric and student submission
3. Ask AI to grade and provide feedback
4. Update `AssignmentManager.gradeAssignment()` function

## Recommended AI Services

### For Search & Chat:
- **OpenAI GPT-4**: Best for general purpose
- **Anthropic Claude**: Better for longer context
- **Google Gemini**: Good alternative

### For Grading:
- **OpenAI GPT-4**: Excellent for detailed feedback
- **Claude**: Good for structured grading
- **Custom fine-tuned model**: Best for specific rubrics

## Implementation Example

### Example: Connect AI Search to OpenAI

```javascript
async search(query) {
    const apiKey = 'YOUR_API_KEY'; // Store securely!
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful learning assistant. Help users find course content.'
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            max_tokens: 500
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}
```

## Security Considerations

⚠️ **IMPORTANT**: Never expose API keys in frontend code!
- Use a backend proxy server
- Store keys in environment variables
- Implement rate limiting
- Add authentication

## Cost Considerations

- **OpenAI GPT-4**: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)
- **Claude**: Similar pricing
- **Free tier**: Limited requests per month

## Next Steps

1. **Set up backend API** (Node.js/Express or Python/Flask)
2. **Create API endpoints** for:
   - AI search
   - AI tutor chat
   - AI grading
3. **Store API keys securely** (environment variables)
4. **Implement rate limiting** to control costs
5. **Add error handling** for API failures
6. **Cache responses** to reduce API calls

## Testing Without API

The current simulated implementations allow you to:
- Test UI/UX
- Develop features
- Demo the application
- Develop without API costs

When ready for production, replace simulated functions with real API calls.

