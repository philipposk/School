// Enhanced AI Features for School Platform
// Course-aware AI tutor, module summaries, flashcards, quiz explanations, study plans

const AIEnhanced = {
    // Enhanced AI Tutor with deep course context
    async generateEnhancedTutorResponse(userMessage, conversationId = null, currentCourse = null, currentModule = null) {
        try {
            // Get comprehensive context
            const context = this.buildCourseContext(currentCourse, currentModule);
            
            // Get user's learning history
            const learningHistory = this.getLearningHistory();
            
            // Build enhanced system prompt
            const systemPrompt = this.buildEnhancedSystemPrompt(context, learningHistory, currentCourse, currentModule);
            
            // Get conversation history
            const conversationHistory = conversationId ? MessagingManager.getConversationHistory(conversationId) : [];
            
            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.slice(-8), // More context
                { role: 'user', content: userMessage }
            ];
            
            const response = await AIConfig.callGroqAPI(messages, {
                temperature: 0.7,
                max_tokens: 500 // Longer, more detailed responses
            });
            
            return response.trim();
        } catch (error) {
            console.error('Enhanced AI tutor error:', error);
            return this.generateFallbackResponse(userMessage, currentCourse, currentModule);
        }
    },
    
    // Build comprehensive course context
    buildCourseContext(courseId, moduleId) {
        const context = {
            currentCourse: null,
            currentModule: null,
            completedModules: [],
            quizScores: {},
            strengths: [],
            gaps: []
        };
        
        if (courseId && courses) {
            const course = courses.find(c => c.id === courseId);
            if (course) {
                context.currentCourse = {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    modules: course.modules_data?.map(m => ({
                        id: m.id,
                        title: m.title,
                        subtitle: m.subtitle
                    })) || []
                };
                
                if (moduleId) {
                    const module = course.modules_data?.find(m => m.id === moduleId);
                    if (module) {
                        context.currentModule = {
                            id: module.id,
                            title: module.title,
                            subtitle: module.subtitle
                        };
                    }
                }
            }
        }
        
        // Get completed modules
        if (state && state.completedModules) {
            context.completedModules = state.completedModules.filter(key => key.startsWith(courseId + '-'));
        }
        
        // Get quiz scores
        if (state && state.quizScores) {
            Object.entries(state.quizScores).forEach(([key, score]) => {
                if (key.startsWith(courseId + '-')) {
                    context.quizScores[key] = score;
                }
            });
        }
        
        // Calculate strengths and gaps
        if (context.quizScores) {
            Object.entries(context.quizScores).forEach(([key, scoreData]) => {
                const score = scoreData.score / scoreData.total;
                if (score >= 0.9) {
                    context.strengths.push(key);
                } else if (score < 0.7) {
                    context.gaps.push(key);
                }
            });
        }
        
        return context;
    },
    
    // Get learning history
    getLearningHistory() {
        return {
            totalModulesCompleted: state?.completedModules?.length || 0,
            totalQuizzesTaken: Object.keys(state?.quizScores || {}).length,
            averageQuizScore: this.calculateAverageScore(),
            currentStreak: LearnerAnalytics?.streaks?.currentStreak || 0,
            studyTime: LearnerAnalytics ? Object.values(LearnerAnalytics.timeTracking).reduce((sum, time) => sum + time, 0) / 1000 / 60 : 0 // minutes
        };
    },
    
    // Calculate average quiz score
    calculateAverageScore() {
        if (!state || !state.quizScores) return 0;
        
        const scores = Object.values(state.quizScores);
        if (scores.length === 0) return 0;
        
        const total = scores.reduce((sum, s) => sum + (s.score / s.total), 0);
        return Math.round((total / scores.length) * 100);
    },
    
    // Build enhanced system prompt
    buildEnhancedSystemPrompt(context, learningHistory, currentCourse, currentModule) {
        let prompt = `You are an expert AI tutor for an online learning platform. You provide personalized, contextual help based on the student's current course, progress, and learning history.

STUDENT PROFILE:
- Total modules completed: ${learningHistory.totalModulesCompleted}
- Quizzes taken: ${learningHistory.totalQuizzesTaken}
- Average quiz score: ${learningHistory.averageQuizScore}%
- Current learning streak: ${learningHistory.currentStreak} days
- Total study time: ${Math.round(learningHistory.studyTime)} minutes

`;
        
        if (context.currentCourse) {
            prompt += `CURRENT COURSE: ${context.currentCourse.title}
${context.currentCourse.description || ''}

`;
            
            if (context.currentModule) {
                prompt += `CURRENT MODULE: ${context.currentModule.title}
${context.currentModule.subtitle || ''}

`;
            }
            
            if (context.completedModules.length > 0) {
                prompt += `COMPLETED MODULES: ${context.completedModules.length} modules in this course\n`;
            }
            
            if (context.strengths.length > 0) {
                prompt += `STRENGTHS: Student excels in ${context.strengths.length} topics\n`;
            }
            
            if (context.gaps.length > 0) {
                prompt += `AREAS TO IMPROVE: ${context.gaps.length} topics need more practice\n`;
            }
        }
        
        prompt += `
INSTRUCTIONS:
- Provide clear, step-by-step explanations
- Use examples relevant to the current course
- Reference specific modules when helpful
- Encourage and motivate based on their progress
- If they're struggling, suggest reviewing previous modules
- If they're excelling, challenge them with advanced concepts
- Keep responses conversational but informative (3-5 sentences)
- Ask follow-up questions to ensure understanding

Be helpful, encouraging, and adapt your teaching style to their learning level.`;

        return prompt;
    },
    
    // Generate AI-powered module summary
    async generateModuleSummary(courseId, moduleId) {
        try {
            const course = courses?.find(c => c.id === courseId);
            if (!course) return null;
            
            const module = course.modules_data?.find(m => m.id === moduleId);
            if (!module) return null;
            
            // Get module content if available
            const moduleContent = await this.getModuleContent(courseId, moduleId);
            
            const prompt = `Summarize this learning module in 3-4 key points that a student should remember. Be concise and focus on the most important concepts.

Module Title: ${module.title}
Module Subtitle: ${module.subtitle || ''}
${moduleContent ? `\nModule Content Preview:\n${moduleContent.substring(0, 500)}...` : ''}

Provide a structured summary with:
1. Main concept (1 sentence)
2. Key takeaways (2-3 bullet points)
3. Why it matters (1 sentence)
4. What to practice next (1 sentence)`;

            const messages = [
                { role: 'system', content: 'You are an expert educational content summarizer. Create clear, concise summaries that help students understand and remember key concepts.' },
                { role: 'user', content: prompt }
            ];
            
            const summary = await AIConfig.callGroqAPI(messages, {
                temperature: 0.5,
                max_tokens: 300
            });
            
            return {
                moduleId: moduleId,
                moduleTitle: module.title,
                summary: summary.trim(),
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating module summary:', error);
            return null;
        }
    },
    
    // Get module content (placeholder - would load actual content)
    async getModuleContent(courseId, moduleId) {
        // In real implementation, this would fetch the actual module markdown/content
        // For now, return null
        return null;
    },
    
    // Generate flashcards from course content
    async generateFlashcardsFromModule(courseId, moduleId, count = 10) {
        try {
            const course = courses?.find(c => c.id === courseId);
            if (!course) return [];
            
            const module = course.modules_data?.find(m => m.id === moduleId);
            if (!module) return [];
            
            const prompt = `Generate ${count} high-quality flashcards for this learning module. Each flashcard should have:
- Front: A clear question or concept
- Back: A concise, accurate answer

Module: ${module.title}
${module.subtitle ? `Subtitle: ${module.subtitle}` : ''}

Format your response as JSON array:
[
  {"front": "Question or concept", "back": "Answer"},
  ...
]

Focus on the most important concepts that students need to remember.`;

            const messages = [
                { role: 'system', content: 'You are an expert at creating educational flashcards. Generate clear, concise flashcards that help with active recall and spaced repetition.' },
                { role: 'user', content: prompt }
            ];
            
            const response = await AIConfig.callGroqAPI(messages, {
                temperature: 0.7,
                max_tokens: 1000
            });
            
            // Parse JSON response
            try {
                const flashcards = JSON.parse(response.trim());
                if (Array.isArray(flashcards)) {
                    // Add to FlashcardManager
                    const deck = FlashcardManager.createDeck(courseId, moduleId, module.title);
                    flashcards.forEach(card => {
                        FlashcardManager.addCard(deck.id, card.front, card.back);
                    });
                    return flashcards;
                }
            } catch (parseError) {
                console.warn('Failed to parse flashcards JSON, trying to extract manually');
                // Fallback: try to extract flashcards from text
                return this.extractFlashcardsFromText(response);
            }
            
            return [];
        } catch (error) {
            console.error('Error generating flashcards:', error);
            return [];
        }
    },
    
    // Extract flashcards from text (fallback)
    extractFlashcardsFromText(text) {
        const flashcards = [];
        const lines = text.split('\n').filter(l => l.trim());
        
        let currentCard = null;
        lines.forEach(line => {
            if (line.includes('Front:') || line.includes('front:')) {
                currentCard = { front: line.replace(/Front:|front:/i, '').trim(), back: '' };
            } else if (line.includes('Back:') || line.includes('back:')) {
                if (currentCard) {
                    currentCard.back = line.replace(/Back:|back:/i, '').trim();
                    flashcards.push(currentCard);
                    currentCard = null;
                }
            } else if (currentCard && !currentCard.back) {
                currentCard.back += ' ' + line.trim();
            }
        });
        
        return flashcards;
    },
    
    // Generate quiz explanation
    async generateQuizExplanation(question, userAnswer, correctAnswer, isCorrect) {
        try {
            const prompt = `Explain why the answer to this quiz question is correct or incorrect. Help the student understand the concept.

Question: ${question}
${isCorrect ? `Student's Answer (CORRECT): ${userAnswer}` : `Student's Answer (INCORRECT): ${userAnswer}\nCorrect Answer: ${correctAnswer}`}

Provide:
1. Why the ${isCorrect ? 'answer is correct' : 'answer is incorrect'}
2. The key concept being tested
3. A brief explanation of the correct answer
4. A tip for remembering this concept

Be encouraging and educational.`;

            const messages = [
                { role: 'system', content: 'You are an expert tutor explaining quiz answers. Help students understand concepts, not just memorize answers.' },
                { role: 'user', content: prompt }
            ];
            
            const explanation = await AIConfig.callGroqAPI(messages, {
                temperature: 0.6,
                max_tokens: 300
            });
            
            return {
                question: question,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                explanation: explanation.trim(),
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating quiz explanation:', error);
            return null;
        }
    },
    
    // Generate personalized study plan
    async generateStudyPlan(userGoals = null) {
        try {
            const goals = userGoals || OnboardingManager.userGoals || [];
            const learningHistory = this.getLearningHistory();
            const courseProgress = LearnerAnalytics?.getCourseProgress() || [];
            
            const prompt = `Create a personalized 4-week study plan for this student based on their goals and progress.

STUDENT GOALS:
${goals.length > 0 ? goals.map(g => `- ${typeof g === 'string' ? g : JSON.stringify(g)}`).join('\n') : '- General learning'}

CURRENT PROGRESS:
- Modules completed: ${learningHistory.totalModulesCompleted}
- Average quiz score: ${learningHistory.averageQuizScore}%
- Study streak: ${learningHistory.currentStreak} days

COURSE PROGRESS:
${courseProgress.map(cp => `- ${cp.courseTitle}: ${cp.progress}% (${cp.completed}/${cp.total} modules)`).join('\n') || '- No courses started yet'}

Create a structured 4-week plan with:
1. Weekly goals (what to complete each week)
2. Daily study recommendations (30-60 min sessions)
3. Focus areas based on their progress
4. Milestone checkpoints
5. Tips for staying motivated

Format as a clear, actionable plan.`;

            const messages = [
                { role: 'system', content: 'You are an expert learning coach. Create personalized, achievable study plans that help students reach their goals.' },
                { role: 'user', content: prompt }
            ];
            
            const plan = await AIConfig.callGroqAPI(messages, {
                temperature: 0.7,
                max_tokens: 800
            });
            
            return {
                plan: plan.trim(),
                goals: goals,
                duration: '4 weeks',
                generatedAt: new Date().toISOString(),
                startDate: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating study plan:', error);
            return null;
        }
    },
    
    // Fallback response
    generateFallbackResponse(userMessage, currentCourse, currentModule) {
        if (currentModule) {
            return `I'm here to help with "${currentModule.title}"! Based on your progress, I'd recommend reviewing the module content and taking the quiz to test your understanding. What specific part would you like help with?`;
        }
        
        if (currentCourse) {
            return `I can help you with "${currentCourse.title}"! Would you like me to explain a specific concept, help you prepare for a quiz, or suggest which module to study next?`;
        }
        
        return `I'm here to help with your learning! What would you like to know more about?`;
    }
};

window.AIEnhanced = AIEnhanced;
