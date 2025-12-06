// Messaging System for School 2
// Chat with friends, AI tutor, and course instructors

const MessagingManager = {
    conversations: JSON.parse(localStorage.getItem('conversations') || '[]'),
    messages: JSON.parse(localStorage.getItem('messages') || '{}'),
    searchHistory: JSON.parse(localStorage.getItem('aiSearchHistory') || '[]'),
    
    // Conversation types
    ConversationType: {
        FRIEND: 'friend',
        AI_TUTOR: 'ai_tutor',
        COURSE_INSTRUCTOR: 'course_instructor'
    },
    
    // Get or create conversation
    getOrCreateConversation(participantEmail, type = this.ConversationType.FRIEND) {
        if (!user || !user.email) return null;
        
        const conversationId = type === this.ConversationType.FRIEND 
            ? `${user.email}_${participantEmail}`.split('@').join('_at_').replace(/[^a-zA-Z0-9_]/g, '_')
            : `${type}_${user.email}`.split('@').join('_at_').replace(/[^a-zA-Z0-9_]/g, '_');
        
        let conversation = this.conversations.find(c => c.id === conversationId);
        
        if (!conversation) {
            conversation = {
                id: conversationId,
                type: type,
                participantEmail: participantEmail,
                participantName: type === this.ConversationType.AI_TUTOR ? 'AI Tutor' 
                    : type === this.ConversationType.COURSE_INSTRUCTOR ? 'Course Instructor'
                    : UserProfileManager.getProfile(participantEmail)?.name || participantEmail,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                unreadCount: 0
            };
            this.conversations.push(conversation);
            this.saveConversations();
        }
        
        return conversation;
    },
    
    // Send message
    async sendMessage(conversationId, content, messageType = 'text') {
        if (!user || !user.email) return null;
        if (!content.trim()) return null;
        
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return null;
        
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId: conversationId,
            senderEmail: user.email,
            senderName: user.name,
            content: SecurityUtils.sanitizeText(content),
            type: messageType,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Add to messages
        if (!this.messages[conversationId]) {
            this.messages[conversationId] = [];
        }
        this.messages[conversationId].push(message);
        this.saveMessages();
        
        // Update conversation
        conversation.updatedAt = new Date().toISOString();
        this.saveConversations();
        
        // Handle AI tutor responses
        if (conversation.type === this.ConversationType.AI_TUTOR) {
            await this.handleAITutorResponse(conversationId, content);
        }
        
        // Handle course instructor responses (simulated)
        if (conversation.type === this.ConversationType.COURSE_INSTRUCTOR) {
            await this.handleInstructorResponse(conversationId, content);
        }
        
        return message;
    },
    
    // Handle AI tutor response
    async handleAITutorResponse(conversationId, userMessage) {
        // Save search to history for context
        this.searchHistory.push({
            query: userMessage,
            timestamp: Date.now()
        });
        this.searchHistory = this.searchHistory.slice(-50); // Keep last 50
        localStorage.setItem('aiSearchHistory', JSON.stringify(this.searchHistory));
        
        // Show typing indicator
        if (window.showAITyping) {
            window.showAITyping(conversationId);
        }
        
        try {
            // Get AI response using Groq API
            const response = await this.generateAIResponse(userMessage, conversationId);
            
            const aiMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                conversationId: conversationId,
                senderEmail: 'ai_tutor@school2.com',
                senderName: 'AI Tutor',
                content: response,
                type: 'text',
                timestamp: new Date().toISOString(),
                read: false
            };
            
            if (!this.messages[conversationId]) {
                this.messages[conversationId] = [];
            }
            this.messages[conversationId].push(aiMessage);
            this.saveMessages();
            
            // Trigger UI update
            if (window.updateChatMessages) {
                window.updateChatMessages(conversationId);
            }
        } catch (error) {
            console.error('Error getting AI response:', error);
            // Send error message
            const errorMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                conversationId: conversationId,
                senderEmail: 'ai_tutor@school2.com',
                senderName: 'AI Tutor',
                content: 'Sorry, I encountered an error. Please try again or check your API configuration.',
                type: 'text',
                timestamp: new Date().toISOString(),
                read: false
            };
            
            if (!this.messages[conversationId]) {
                this.messages[conversationId] = [];
            }
            this.messages[conversationId].push(errorMessage);
            this.saveMessages();
            
            if (window.updateChatMessages) {
                window.updateChatMessages(conversationId);
            }
        }
    },
    
    // Generate AI response using Groq API
    async generateAIResponse(userMessage, conversationId = null) {
        try {
            // Build context from user's learning progress and search history
            const completed = state.completedModules?.length || 0;
            const total = courses ? courses.reduce((sum, c) => sum + (c.modules_data?.length || 0), 0) : 0;
            const recentSearches = this.searchHistory.slice(0, 5).map(s => s.query).join(', ');
            
            // Build course context
            const courseContext = courses ? courses.map(c => ({
                title: c.title,
                modules: c.modules_data?.map(m => m.title) || []
            })).slice(0, 3) : [];
            
            const systemPrompt = `You are a friendly and helpful AI tutor for an online learning platform. 
Help students understand course content, find modules, prepare for quizzes, and track their progress.

Student Progress: ${completed} out of ${total} modules completed
Recent searches: ${recentSearches || 'None'}
Available courses: ${JSON.stringify(courseContext)}

Be conversational, encouraging, and helpful. Keep responses concise (2-3 sentences max). If asked about specific topics, reference relevant course modules.`;

            // Get conversation history if available
            const conversationHistory = conversationId ? this.getConversationHistory(conversationId) : [];
            
            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.slice(-5), // Last 5 messages for context
                { role: 'user', content: userMessage }
            ];
            
            const response = await AIConfig.callGroqAPI(messages, {
                temperature: 0.8,
                max_tokens: 300
            });
            
            return response.trim();
        } catch (error) {
            console.error('AI tutor error:', error);
            // Fallback to simple responses
            return this.generateFallbackResponse(userMessage);
        }
    },
    
    // Fallback response if API fails
    generateFallbackResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('module') || lowerMessage.includes('lesson')) {
            return `I can help you with course modules! Based on your progress, I recommend reviewing the modules you haven't completed yet. Would you like me to suggest which module to tackle next?`;
        }
        
        if (lowerMessage.includes('quiz') || lowerMessage.includes('test')) {
            return `Quizzes are a great way to test your understanding! Make sure you've reviewed the module content first. Need help preparing for a specific quiz?`;
        }
        
        if (lowerMessage.includes('certificate') || lowerMessage.includes('complete')) {
            const completed = state.completedModules?.length || 0;
            const total = courses ? courses.reduce((sum, c) => sum + (c.modules_data?.length || 0), 0) : 0;
            return `You've completed ${completed} out of ${total} modules. Keep going! Complete all modules and pass quizzes to earn your certificate.`;
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return `I'm here to help! I can assist with:\n• Understanding course content\n• Finding specific modules\n• Quiz preparation\n• Learning strategies\n\nWhat would you like help with?`;
        }
        
        return `I understand you're asking about "${userMessage}". Let me help you with that. Based on your learning progress, I'd suggest focusing on completing the current module and taking the quiz to reinforce your understanding. Is there a specific topic you'd like me to explain?`;
    },
    
    // Get conversation history for context
    getConversationHistory(conversationId = null) {
        if (!conversationId) return [];
        
        const messages = this.getMessages(conversationId) || [];
        return messages.slice(-10).map(msg => ({
            role: msg.senderEmail === user?.email ? 'user' : 'assistant',
            content: msg.content
        }));
    },
    
    // Handle instructor response (simulated)
    async handleInstructorResponse(conversationId, userMessage) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const instructorMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId: conversationId,
            senderEmail: 'instructor@school2.com',
            senderName: 'Course Instructor',
            content: `Thank you for your question! I'll get back to you within 24 hours. In the meantime, you might find the answer in Module ${state.currentModule || 1} of the course.`,
            type: 'text',
            timestamp: new Date().toISOString(),
            read: false
        };
        
        if (!this.messages[conversationId]) {
            this.messages[conversationId] = [];
        }
        this.messages[conversationId].push(instructorMessage);
        this.saveMessages();
        
        if (window.updateChatMessages) {
            window.updateChatMessages(conversationId);
        }
    },
    
    // Get messages for conversation
    getMessages(conversationId) {
        return this.messages[conversationId] || [];
    },
    
    // Mark messages as read
    markAsRead(conversationId) {
        if (this.messages[conversationId]) {
            this.messages[conversationId].forEach(msg => {
                if (msg.senderEmail !== user.email) {
                    msg.read = true;
                }
            });
            this.saveMessages();
        }
        
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.unreadCount = 0;
            this.saveConversations();
        }
    },
    
    // Get unread count
    getUnreadCount() {
        return this.conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    },
    
    // Save conversations
    saveConversations() {
        localStorage.setItem('conversations', JSON.stringify(this.conversations));
    },
    
    // Save messages
    saveMessages() {
        localStorage.setItem('messages', JSON.stringify(this.messages));
    },
    
    // Render chat list
    renderChatList() {
        const sortedConversations = [...this.conversations].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        if (sortedConversations.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                    <h3>No Conversations Yet</h3>
                    <p style="color: var(--text-light); margin-top: 1rem;">
                        Start a conversation with a friend, AI tutor, or course instructor!
                    </p>
                </div>
            `;
        }
        
        return `
            <div class="chat-list">
                ${sortedConversations.map(conv => {
                    const lastMessage = this.getMessages(conv.id).slice(-1)[0];
                    const lastMessageText = lastMessage 
                        ? (lastMessage.content.length > 50 ? lastMessage.content.substring(0, 50) + '...' : lastMessage.content)
                        : 'No messages yet';
                    const lastMessageTime = lastMessage 
                        ? new Date(lastMessage.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '';
                    
                    return `
                        <div class="chat-list-item" onclick="openChat('${conv.id}')">
                            <div class="chat-avatar">
                                ${conv.type === this.ConversationType.AI_TUTOR ? '🤖' :
                                  conv.type === this.ConversationType.COURSE_INSTRUCTOR ? '👨‍🏫' :
                                  UserProfileManager.getProfile(conv.participantEmail)?.profilePicture 
                                    ? `<img src="${SecurityUtils.escapeHTML(UserProfileManager.getProfile(conv.participantEmail).profilePicture)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
                                    : ''}
                                <div class="avatar-fallback" style="${conv.type === this.ConversationType.AI_TUTOR || conv.type === this.ConversationType.COURSE_INSTRUCTOR ? '' : 'display: none;'} display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)); color: white; font-size: 1.5rem;">
                                    ${conv.type === this.ConversationType.AI_TUTOR ? '🤖' :
                                      conv.type === this.ConversationType.COURSE_INSTRUCTOR ? '👨‍🏫' :
                                      conv.participantName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div class="chat-info">
                                <div class="chat-header-info">
                                    <strong>${SecurityUtils.safeRender(conv.participantName)}</strong>
                                    <span class="chat-time">${lastMessageTime}</span>
                                </div>
                                <p class="chat-preview">${SecurityUtils.safeRender(lastMessageText)}</p>
                            </div>
                            ${conv.unreadCount > 0 ? `<span class="chat-badge">${conv.unreadCount}</span>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // Render chat view
    renderChatView(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return '';
        
        const messages = this.getMessages(conversationId);
        
        return `
            <div class="chat-view-container">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar-small">
                            ${conversation.type === this.ConversationType.AI_TUTOR ? '🤖' :
                              conversation.type === this.ConversationType.COURSE_INSTRUCTOR ? '👨‍🏫' :
                              UserProfileManager.getProfile(conversation.participantEmail)?.profilePicture 
                                ? `<img src="${SecurityUtils.escapeHTML(UserProfileManager.getProfile(conversation.participantEmail).profilePicture)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
                                : ''}
                            <div class="avatar-fallback" style="${conversation.type === this.ConversationType.AI_TUTOR || conversation.type === this.ConversationType.COURSE_INSTRUCTOR ? '' : 'display: none;'} display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)); color: white; font-size: 1.25rem;">
                                ${conversation.type === this.ConversationType.AI_TUTOR ? '🤖' :
                                  conversation.type === this.ConversationType.COURSE_INSTRUCTOR ? '👨‍🏫' :
                                  conversation.participantName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <strong>${SecurityUtils.safeRender(conversation.participantName)}</strong>
                            ${conversation.type === this.ConversationType.AI_TUTOR ? '<span style="font-size: 0.75rem; color: var(--text-light);">AI Tutor</span>' : ''}
                            ${conversation.type === this.ConversationType.COURSE_INSTRUCTOR ? '<span style="font-size: 0.75rem; color: var(--text-light);">Course Instructor</span>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="chat-messages" id="chatMessages_${conversationId}">
                    ${messages.length === 0 
                        ? `<div class="chat-empty">
                            <p style="color: var(--text-light); text-align: center; padding: 2rem;">
                                No messages yet. Start the conversation!
                            </p>
                          </div>`
                        : messages.map(msg => {
                            const isOwn = msg.senderEmail === user.email;
                            return `
                                <div class="message-bubble ${isOwn ? 'message-own' : 'message-other'}">
                                    ${!isOwn ? `<div class="message-sender">${SecurityUtils.safeRender(msg.senderName)}</div>` : ''}
                                    <div class="message-content">${SecurityUtils.safeRender(msg.content)}</div>
                                    <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            `;
                        }).join('')}
                </div>
                
                <div class="chat-input-container">
                    <input type="text" 
                           id="chatInput_${conversationId}" 
                           class="chat-input" 
                           placeholder="Type a message..."
                           onkeypress="if(event.key==='Enter') sendChatMessage('${conversationId}')">
                    <button class="chat-send-btn" onclick="sendChatMessage('${conversationId}')">
                        ➤
                    </button>
                </div>
            </div>
        `;
    }
};

// Global functions
window.openChat = function(conversationId) {
    const modal = document.getElementById('chatModal');
    if (!modal) {
        const modalHTML = `
            <div id="chatModal" class="modal">
                <div class="modal-content" style="max-width: 600px; max-height: 90vh; display: flex; flex-direction: column;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                        <h2 class="modal-title">Chat</h2>
                        <button onclick="closeChat()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div id="chatContent" style="flex: 1; overflow-y: auto;"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    document.getElementById('chatContent').innerHTML = MessagingManager.renderChatView(conversationId);
    document.getElementById('chatModal').classList.add('show');
    
    // Scroll to bottom
    setTimeout(() => {
        const messagesContainer = document.getElementById(`chatMessages_${conversationId}`);
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 100);
    
    // Mark as read
    MessagingManager.markAsRead(conversationId);
};

window.closeChat = function() {
    document.getElementById('chatModal').classList.remove('show');
};

window.sendChatMessage = async function(conversationId) {
    const input = document.getElementById(`chatInput_${conversationId}`);
    if (!input || !input.value.trim()) return;
    
    const content = input.value;
    input.value = '';
    
    await MessagingManager.sendMessage(conversationId, content);
    
    // Update chat view
    document.getElementById(`chatMessages_${conversationId}`).innerHTML = MessagingManager.getMessages(conversationId).map(msg => {
        const isOwn = msg.senderEmail === user.email;
        return `
            <div class="message-bubble ${isOwn ? 'message-own' : 'message-other'}">
                ${!isOwn ? `<div class="message-sender">${SecurityUtils.safeRender(msg.senderName)}</div>` : ''}
                <div class="message-content">${SecurityUtils.safeRender(msg.content)}</div>
                <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    const messagesContainer = document.getElementById(`chatMessages_${conversationId}`);
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
};

window.openMessaging = function(friendEmail = null) {
    try {
        if (!user || !user.email) {
            alert('Please sign in to view messages');
            return;
        }
        
        let modal = document.getElementById('messagingModal');
        if (!modal) {
            const modalHTML = `
                <div id="messagingModal" class="modal">
                    <div class="modal-content" style="max-width: 800px; max-height: 90vh; display: flex; flex-direction: column;">
                        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                            <div>
                                <h2 class="modal-title">Messages</h2>
                                <p style="color: var(--text-light); font-size: 0.875rem; margin-top: 0.25rem;">
                                    Chat with friends, AI tutor, or course instructors
                                </p>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="startNewChat('ai_tutor')" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                    🤖 AI Tutor
                                </button>
                                <button onclick="startNewChat('instructor')" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                    👨‍🏫 Instructor
                                </button>
                                <button onclick="closeMessaging()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                            </div>
                        </div>
                        <div id="messagingContent" style="flex: 1; overflow-y: auto; padding: 1rem;">
                            ${MessagingManager.renderChatList()}
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById('messagingModal');
        } else {
            // Update chat list
            const content = document.getElementById('messagingContent');
            if (content) {
                content.innerHTML = MessagingManager.renderChatList();
            }
        }
        
        if (modal) {
            modal.classList.add('show');
            
            // If friendEmail provided, open chat directly
            if (friendEmail) {
                setTimeout(() => {
                    const conv = MessagingManager.getOrCreateConversation(friendEmail, MessagingManager.ConversationType.FRIEND);
                    if (conv && typeof openChat === 'function') {
                        closeMessaging();
                        openChat(conv.id);
                    }
                }, 100);
            }
        }
    } catch (error) {
        console.error('Error opening messaging:', error);
        alert('Unable to open messages. Please refresh the page.');
    }
};

window.closeMessaging = function() {
    document.getElementById('messagingModal').classList.remove('show');
};

window.startNewChat = function(type) {
    if (type === 'ai_tutor') {
        const conv = MessagingManager.getOrCreateConversation('ai_tutor@school2.com', MessagingManager.ConversationType.AI_TUTOR);
        closeMessaging();
        openChat(conv.id);
    } else if (type === 'instructor') {
        const courseId = state.currentCourseId || 'critical-thinking';
        const conv = MessagingManager.getOrCreateConversation(`instructor_${courseId}@school2.com`, MessagingManager.ConversationType.COURSE_INSTRUCTOR);
        closeMessaging();
        openChat(conv.id);
    }
};

window.updateChatMessages = function(conversationId) {
    const messagesContainer = document.getElementById(`chatMessages_${conversationId}`);
    if (messagesContainer) {
        messagesContainer.innerHTML = MessagingManager.getMessages(conversationId).map(msg => {
            const isOwn = msg.senderEmail === user.email;
            return `
                <div class="message-bubble ${isOwn ? 'message-own' : 'message-other'}">
                    ${!isOwn ? `<div class="message-sender">${SecurityUtils.safeRender(msg.senderName)}</div>` : ''}
                    <div class="message-content">${SecurityUtils.safeRender(msg.content)}</div>
                    <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
        }).join('');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
};

// Export
window.MessagingManager = MessagingManager;

