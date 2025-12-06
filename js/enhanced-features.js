// Enhanced Features for School 2
// Theme System, UI Layouts, AI Search, Learning Prediction

// ========== VIEW MODE MANAGER ==========
// Controls HOW courses are displayed (Simple, Enhanced, 3D World, Universe)
const ViewModeManager = {
    modes: {
        'simple': {
            name: 'Simple',
            icon: '📄',
            description: 'Basic layout, no 3D effects'
        },
        'enhanced': {
            name: 'Enhanced',
            icon: '🎨',
            description: '3D hover effects and parallax'
        },
        '3d-world': {
            name: '3D World',
            icon: '🌍',
            description: 'Game-like 3D exploration'
        },
        'universe': {
            name: 'Universe',
            icon: '🌌',
            description: 'Galaxy view - courses as countries on a planet'
        }
    },
    
    currentMode: 'enhanced',
    
    init() {
        const saved = localStorage.getItem('viewMode') || 'enhanced';
        this.setMode(saved);
    },
    
    setMode(modeName) {
        if (!this.modes[modeName]) return;
        
        const previousMode = this.currentMode;
        this.currentMode = modeName;
        localStorage.setItem('viewMode', modeName);
        
        document.body.setAttribute('data-view-mode', modeName);
        
        // Handle mode changes
        if (previousMode !== modeName) {
            // Destroy 3D world if switching away from it
            if (previousMode === '3d-world' && typeof ThreeDWorld !== 'undefined') {
                ThreeDWorld.destroy();
            }
            
            // Reload courses view if switching to/from 3D world or universe
            if (modeName === '3d-world' || previousMode === '3d-world' || 
                modeName === 'universe' || previousMode === 'universe') {
                setTimeout(() => {
                    if (typeof showCourses === 'function') {
                        showCourses();
                    }
                }, 100);
            }
            
            // Destroy universe view if switching away from it
            if (previousMode === 'universe' && typeof UniverseView !== 'undefined') {
                UniverseView.destroy();
            }
        }
    },
    
    getCurrentMode() {
        return this.currentMode;
    }
};

// ========== VISUAL THEME MANAGER ==========
// Controls COLORS and STYLING (can apply on top of any view mode)
const ThemeManager = {
    themes: {
        'default': {
            name: 'Default',
            icon: '🎨',
            colors: { primary: '#667eea', secondary: '#764ba2', accent: '#48bb78' }
        },
        'liquid-glass': {
            name: 'Liquid Glass',
            icon: '✨',
            colors: { primary: '#00d4ff', secondary: '#0099cc', accent: '#00ffcc' },
            style: 'backdrop-filter: blur(10px); background: rgba(0, 212, 255, 0.1);'
        },
        'instagram': {
            name: 'Instagram Style',
            icon: '📷',
            colors: { primary: '#E1306C', secondary: '#F56040', accent: '#FCAF45' },
            gradient: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)'
        },
        'minimal': {
            name: 'Minimal',
            icon: '⚪',
            colors: { primary: '#2d3748', secondary: '#4a5568', accent: '#718096' }
        },
        'luxury': {
            name: 'Luxury',
            icon: '👑',
            colors: { primary: '#d4af37', secondary: '#b8941f', accent: '#f4d03f' },
            gradient: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)'
        },
        'nature': {
            name: 'Nature',
            icon: '🌿',
            colors: { primary: '#48bb78', secondary: '#38a169', accent: '#2f855a' }
        },
        'cyber': {
            name: 'Cyber',
            icon: '💻',
            colors: { primary: '#00ff88', secondary: '#00cc6a', accent: '#00ff00' },
            style: 'background: #0a0a0a; color: #00ff88;'
        }
    },
    
    currentTheme: 'default',
    
    init() {
        const saved = localStorage.getItem('visualTheme') || 'default';
        this.setTheme(saved);
    },
    
    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        this.currentTheme = themeName;
        localStorage.setItem('visualTheme', themeName);
        this.applyTheme();
    },
    
    applyTheme() {
        const theme = this.themes[this.currentTheme];
        const root = document.documentElement;
        
        root.style.setProperty('--theme-primary', theme.colors.primary);
        root.style.setProperty('--theme-secondary', theme.colors.secondary);
        root.style.setProperty('--theme-accent', theme.colors.accent);
        
        if (theme.gradient) {
            root.style.setProperty('--theme-gradient', theme.gradient);
        }
        
        // Apply theme-specific styles
        if (theme.style) {
            document.body.setAttribute('data-theme-style', this.currentTheme);
        } else {
            // Remove any existing theme style attribute
            document.body.removeAttribute('data-theme-style');
        }
        
        // Apply inline styles if provided
        if (theme.style) {
            const styleId = 'theme-custom-style';
            let styleEl = document.getElementById(styleId);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = `body[data-theme-style="${this.currentTheme}"] { ${theme.style} }`;
        }
    }
};

// ========== UI LAYOUT MANAGER ==========
const UILayoutManager = {
    layouts: {
        'default': {
            name: 'Default',
            icon: '📋',
            description: 'Traditional grid layout'
        },
        'beauty-card': {
            name: 'Beauty Card',
            icon: '💎',
            description: 'Instagram-style large cards with images'
        },
        'feed': {
            name: 'Feed Layout',
            icon: '📱',
            description: 'Social media-style scrolling feed'
        },
        'sidebar': {
            name: 'Sidebar',
            icon: '📑',
            description: 'Sidebar navigation layout'
        },
        'modern': {
            name: 'Modern',
            icon: '⚡',
            description: 'Minimalist with bottom navigation'
        }
    },
    
    currentLayout: 'default',
    
    init() {
        const saved = localStorage.getItem('uiLayout') || 'default';
        this.setLayout(saved);
    },
    
    setLayout(layoutName) {
        if (!this.layouts[layoutName]) return;
        this.currentLayout = layoutName;
        localStorage.setItem('uiLayout', layoutName);
        document.body.setAttribute('data-layout', layoutName);
    },
    
    renderCourses(layoutName) {
        const layout = layoutName || this.currentLayout;
        
        switch(layout) {
            case 'beauty-card':
                return this.renderBeautyCardLayout();
            case 'feed':
                return this.renderFeedLayout();
            case 'sidebar':
                return this.renderSidebarLayout();
            case 'modern':
                return this.renderModernLayout();
            default:
                return null; // Use default rendering
        }
    },
    
    renderBeautyCardLayout() {
        // Instagram-style large cards
        const coursesList = window.getTranslatedCourses ? window.getTranslatedCourses() : (window.courses || []);
        return `
            <div class="beauty-card-grid">
                ${coursesList.map(course => `
                    <div class="beauty-card" onclick="loadCourse('${course.id}')">
                        <div class="beauty-card-image" style="background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));">
                            <div class="beauty-card-icon">${course.icon}</div>
                        </div>
                        <div class="beauty-card-content">
                            <h2>${course.title}</h2>
                            <p>${course.description}</p>
                            <div class="beauty-card-meta">
                                <span>${course.modules} modules</span>
                                <span>${course.duration}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderFeedLayout() {
        // Social media feed style
        const coursesList = window.getTranslatedCourses ? window.getTranslatedCourses() : (window.courses || []);
        return `
            <div class="feed-container">
                ${coursesList.map(course => `
                    <div class="feed-item" onclick="loadCourse('${course.id}')">
                        <div class="feed-header">
                            <div class="feed-avatar">${course.icon}</div>
                            <div class="feed-info">
                                <strong>${course.title}</strong>
                                <span>${course.level}</span>
                            </div>
                        </div>
                        <div class="feed-content">
                            <p>${course.description}</p>
                        </div>
                        <div class="feed-footer">
                            <span>📚 ${course.modules} modules</span>
                            <span>⏱️ ${course.duration}</span>
                            <button class="feed-action-btn">Start Learning</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderSidebarLayout() {
        // Sidebar navigation
        const coursesList = window.getTranslatedCourses ? window.getTranslatedCourses() : (window.courses || []);
        return `
            <div class="sidebar-layout-container">
                <aside class="sidebar-nav">
                    <h3>Courses</h3>
                    <ul>
                        ${coursesList.map(course => `
                            <li onclick="loadCourse('${course.id}')">
                                <span class="nav-icon">${course.icon}</span>
                                <span>${course.title}</span>
                            </li>
                        `).join('')}
                    </ul>
                </aside>
                <main class="sidebar-content">
                    <!-- Content will be loaded here -->
                </main>
            </div>
        `;
    },
    
    renderModernLayout() {
        // Modern minimalist
        const coursesList = window.getTranslatedCourses ? window.getTranslatedCourses() : (window.courses || []);
        return `
            <div class="modern-grid">
                ${coursesList.map(course => `
                    <div class="modern-card" onclick="loadCourse('${course.id}')">
                        <div class="modern-card-header">
                            <span class="modern-icon">${course.icon}</span>
                            <span class="modern-badge">${course.level}</span>
                        </div>
                        <h3>${course.title}</h3>
                        <p>${course.description}</p>
                        <div class="modern-footer">
                            <span>${course.modules} modules</span>
                            <button class="modern-btn">→</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// ========== AI SEARCH ASSISTANT ==========
const AISearchAssistant = {
    searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    
    async search(query) {
        if (!query.trim()) return [];
        
        // Save to history
        this.searchHistory.unshift({ query, timestamp: Date.now() });
        this.searchHistory = this.searchHistory.slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        
        // Build course content context for AI
        const coursesList = window.getTranslatedCourses ? window.getTranslatedCourses() : (window.courses || []);
        const courseContext = coursesList.map(c => ({
            title: c.title,
            description: c.description,
            modules: c.modules_data.map(m => ({ title: m.title, subtitle: m.subtitle }))
        })).slice(0, 3); // Limit context size
        
        try {
            // Use Groq API for fast AI-powered search
            const systemPrompt = `You are a helpful learning assistant. Help users find relevant course content. 
Available courses: ${JSON.stringify(courseContext)}
User progress: ${state.completedModules?.length || 0} modules completed.

Respond with a JSON array of relevant results. Each result should have: type ("course", "module", or "action"), title, description, and action (optional).
If the query is about quizzes, include an action result with type "action" and title "View All Quizzes".
If the query is about progress, include an action result with type "action" and title "View Progress".`;
            
            const aiResponse = await AIConfig.callGroqAPI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ], { max_tokens: 500 });
            
            // Try to parse AI response as JSON, fallback to keyword search
            try {
                const aiResults = JSON.parse(aiResponse);
                if (Array.isArray(aiResults) && aiResults.length > 0) {
                    // Map AI results to actual course/module actions
                    return this.mapAIResultsToActions(aiResults);
                }
            } catch (e) {
                console.log('AI response not JSON, using keyword search');
            }
        } catch (error) {
            console.error('AI search error:', error);
            // Fallback to keyword search
        }
        
        // Fallback: Perform intelligent keyword search
        return this.keywordSearch(query);
    },
    
    keywordSearch(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        const coursesList = window.getTranslatedCourses ? window.getTranslatedCourses() : (window.courses || []);
        const queryWords = lowerQuery.split(' ').filter(w => w.length > 2); // Filter out short words
        
        // Intelligent course search - matches multiple words
        coursesList.forEach(course => {
            const courseText = `${course.title} ${course.description} ${course.level}`.toLowerCase();
            const matchScore = queryWords.reduce((score, word) => {
                return score + (courseText.includes(word) ? 1 : 0);
            }, 0);
            
            if (matchScore > 0 || course.title.toLowerCase().includes(lowerQuery) ||
                course.description.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'course',
                    title: course.title,
                    description: `${course.description} (${course.modules} modules, ${course.duration})`,
                    action: () => loadCourse(course.id),
                    score: matchScore
                });
            }
            
            // Search modules with better matching
            if (course.modules_data) {
                course.modules_data.forEach(module => {
                    const moduleText = `${module.title} ${module.subtitle}`.toLowerCase();
                    const moduleMatchScore = queryWords.reduce((score, word) => {
                        return score + (moduleText.includes(word) ? 1 : 0);
                    }, 0);
                    
                    if (moduleMatchScore > 0 || module.title.toLowerCase().includes(lowerQuery) ||
                        module.subtitle.toLowerCase().includes(lowerQuery)) {
                        results.push({
                            type: 'module',
                            title: `${course.title} - ${module.title}`,
                            description: module.subtitle,
                            action: () => {
                                loadCourse(course.id);
                                setTimeout(() => loadModule(module.id), 100);
                            },
                            score: moduleMatchScore
                        });
                    }
                });
            }
        });
        
        // Sort by relevance score
        results.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        // Natural language queries with better understanding
        if (lowerQuery.includes('quiz') || lowerQuery.includes('test') || lowerQuery.includes('assessment')) {
            results.unshift({
                type: 'action',
                title: 'View All Quizzes',
                description: 'See all available quizzes',
                action: () => showQuizzes()
            });
        }
        
        if (lowerQuery.includes('progress') || lowerQuery.includes('completed') || lowerQuery.includes('how many') || lowerQuery.includes('my progress')) {
            const completed = state.completedModules?.length || 0;
            const total = coursesList.reduce((sum, c) => sum + (c.modules_data?.length || 0), 0);
            results.unshift({
                type: 'action',
                title: 'View Progress',
                description: `You've completed ${completed} out of ${total} modules`,
                action: () => showProgress()
            });
        }
        
        if (lowerQuery.includes('certificate') || lowerQuery.includes('certification')) {
            results.unshift({
                type: 'action',
                title: 'View Certificates',
                description: 'See your earned certificates',
                action: () => {
                    if (typeof viewCertificates === 'function') viewCertificates();
                }
            });
        }
        
        return results.slice(0, 10); // Limit to top 10 results
    },
    
    mapAIResultsToActions(aiResults) {
        const results = [];
        
        aiResults.forEach(result => {
            if (result.type === 'course') {
                const course = courses.find(c => 
                    c.title.toLowerCase().includes(result.title.toLowerCase())
                );
                if (course) {
                    results.push({
                        type: 'course',
                        title: course.title,
                        description: result.description || course.description,
                        action: () => loadCourse(course.id)
                    });
                }
            } else if (result.type === 'module') {
                // Find matching module
                for (const course of courses) {
                    const module = course.modules_data.find(m => 
                        m.title.toLowerCase().includes(result.title.toLowerCase()) ||
                        result.title.toLowerCase().includes(m.title.toLowerCase())
                    );
                    if (module) {
                        results.push({
                            type: 'module',
                            title: `${course.title} - ${module.title}`,
                            description: result.description || module.subtitle,
                            action: () => {
                                loadCourse(course.id);
                                setTimeout(() => loadModule(module.id), 100);
                            }
                        });
                        break;
                    }
                }
            } else if (result.type === 'action') {
                results.push({
                    type: 'action',
                    title: result.title,
                    description: result.description,
                    action: result.action || (() => {})
                });
            }
        });
        
        return results;
    },
    
    renderSearchModal() {
        return `
            <div id="aiSearchModal" class="modal">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2 class="modal-title">🔍 AI Search Assistant</h2>
                        <button onclick="closeAISearch()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div class="search-input-container">
                        <input type="text" id="aiSearchInput" class="form-input" placeholder="Search courses, modules, or ask a question..." 
                               style="width: 100%; padding: 1rem; font-size: 1rem;" 
                               autocomplete="off" 
                               data-lpignore="true"
                               data-form-type="other">
                        <button onclick="performAISearch()" class="btn btn-primary">Search</button>
                    </div>
                    <div id="searchResults" style="margin-top: 1rem; max-height: 400px; overflow-y: auto;">
                        <p style="color: var(--text-light); text-align: center; padding: 2rem;">
                            Try searching for: "modules about logic", "quizzes I haven't completed", or course names
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
};

// ========== LEARNING POTENTIAL PREDICTOR ==========
const LearningPotentialPredictor = {
    calculatePotential() {
        const completed = state.completedModules.length;
        const totalModules = courses.reduce((sum, c) => sum + c.modules_data.length, 0);
        const completionRate = totalModules > 0 ? (completed / totalModules) * 100 : 0;
        
        // Get average quiz score
        const quizScores = Object.values(state.quizScores);
        const avgScore = quizScores.length > 0
            ? quizScores.reduce((sum, q) => sum + (q.score / q.total * 100), 0) / quizScores.length
            : 0;
        
        // Calculate potential percentage
        const basePotential = completionRate;
        const qualityBonus = avgScore * 0.3; // Quality of learning matters
        const currentPotential = Math.min(100, basePotential + qualityBonus);
        
        // Predict future potential based on current trajectory
        const studyStreak = this.calculateStudyStreak();
        const streakBonus = Math.min(20, studyStreak * 2);
        const predictedPotential = Math.min(100, currentPotential + streakBonus);
        
        return {
            current: Math.round(currentPotential),
            predicted: Math.round(predictedPotential),
            completionRate: Math.round(completionRate),
            avgScore: Math.round(avgScore),
            studyStreak,
            message: this.getMotivationalMessage(currentPotential, predictedPotential)
        };
    },
    
    calculateStudyStreak() {
        const lastStudyDate = localStorage.getItem('lastStudyDate');
        if (!lastStudyDate) return 0;
        
        const today = new Date().toDateString();
        const lastDate = new Date(parseInt(lastStudyDate)).toDateString();
        const daysDiff = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
        
        return daysDiff <= 1 ? parseInt(localStorage.getItem('studyStreak') || '0') + 1 : 0;
    },
    
    getMotivationalMessage(current, predicted) {
        if (current < 30) {
            return "You're just getting started! Keep learning to unlock your full potential.";
        } else if (current < 50) {
            return "Great progress! You're building a solid foundation.";
        } else if (current < 70) {
            return "Excellent work! You're more than halfway to your full potential.";
        } else if (current < 90) {
            return "Outstanding! You're approaching mastery level.";
        } else {
            return "Incredible! You're near your full potential. Keep pushing!";
        }
    },
    
    renderPredictionModal() {
        const prediction = this.calculatePotential();
        
        return `
            <div id="predictionModal" class="modal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2 class="modal-title">🎯 Your Learning Potential</h2>
                        <button onclick="closePrediction()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 3rem; font-weight: bold; color: var(--theme-primary); margin-bottom: 1rem;">
                            ${prediction.current}%
                        </div>
                        <p style="font-size: 1.2rem; color: var(--text-light); margin-bottom: 2rem;">
                            Current Potential Reached
                        </p>
                        <div style="background: var(--hover-bg); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Predicted Potential:</span>
                                <strong>${prediction.predicted}%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Completion Rate:</span>
                                <strong>${prediction.completionRate}%</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Average Quiz Score:</span>
                                <strong>${prediction.avgScore}%</strong>
                            </div>
                        </div>
                        <p style="color: var(--text); font-style: italic;">
                            ${prediction.message}
                        </p>
                        <div style="margin-top: 2rem;">
                            <div style="background: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: var(--theme-primary); height: 100%; width: ${prediction.current}%; transition: width 0.3s;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Global functions
window.openAISearch = function() {
    const modal = document.getElementById('aiSearchModal');
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', AISearchAssistant.renderSearchModal());
    }
    document.getElementById('aiSearchModal').classList.add('show');
    document.getElementById('aiSearchInput').focus();
    
    // Scroll to courses section smoothly
    setTimeout(() => {
        const coursesSection = document.getElementById('coursesSection');
        if (coursesSection) {
            coursesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
};

window.closeAISearch = function() {
    document.getElementById('aiSearchModal').classList.remove('show');
};

window.performAISearch = async function() {
    const query = document.getElementById('aiSearchInput').value;
    if (!query.trim()) return;
    
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">🔍 Searching...</p>';
    
    try {
        const results = await AISearchAssistant.search(query);
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">No results found. Try different keywords.</p>';
            return;
        }
        
        resultsContainer.innerHTML = results.map((result, idx) => `
        <div class="search-result-item" onclick="executeSearchAction(${idx}); closeAISearch();" 
             style="padding: 1rem; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; transition: background 0.2s;"
             onmouseover="this.style.background='var(--hover-bg)'" 
             onmouseout="this.style.background='transparent'">
            <strong>${result.title}</strong>
            <p style="color: var(--text-light); margin-top: 0.5rem; font-size: 0.9rem;">${result.description}</p>
        </div>
    `).join('');
    
    // Store results globally for action execution
    window.currentSearchResults = results;
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `<p style="color: var(--error); text-align: center; padding: 2rem;">
            Error: ${error.message || 'Search failed'}. Using keyword search instead.
        </p>`;
        // Fallback to keyword search
        const fallbackResults = AISearchAssistant.keywordSearch(query);
        if (fallbackResults.length > 0) {
            resultsContainer.innerHTML = fallbackResults.map((result, idx) => `
                <div class="search-result-item" onclick="executeSearchAction(${idx}); closeAISearch();" 
                     style="padding: 1rem; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; transition: background 0.2s;"
                     onmouseover="this.style.background='var(--hover-bg)'" 
                     onmouseout="this.style.background='transparent'">
                    <strong>${result.title}</strong>
                    <p style="color: var(--text-light); margin-top: 0.5rem; font-size: 0.9rem;">${result.description}</p>
                </div>
            `).join('');
            window.currentSearchResults = fallbackResults;
        }
    }
};

window.openPrediction = function() {
    try {
        // Ensure courses are shown first
        if (typeof showCourses === 'function') {
            showCourses();
        }
        
        let modal = document.getElementById('predictionModal');
        if (!modal) {
            document.body.insertAdjacentHTML('beforeend', LearningPotentialPredictor.renderPredictionModal());
            modal = document.getElementById('predictionModal');
        } else {
            // Update modal content
            const newContent = LearningPotentialPredictor.renderPredictionModal();
            modal.outerHTML = newContent;
            modal = document.getElementById('predictionModal');
        }
        if (modal) {
            modal.classList.add('show');
            
            // Scroll window to center to ensure modal is visible
            // Since modals are fixed and centered, we need to scroll the page to show center area
            setTimeout(() => {
                const scrollPosition = window.scrollY;
                const viewportHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                
                // Calculate center position
                const centerPosition = (documentHeight - viewportHeight) / 2;
                
                // Only scroll if we're not already near the center
                if (Math.abs(scrollPosition - centerPosition) > viewportHeight / 4) {
                    window.scrollTo({ 
                        top: centerPosition, 
                        behavior: 'smooth' 
                    });
                }
            }, 150);
        }
    } catch (error) {
        console.error('Error opening prediction modal:', error);
        alert('Unable to open Learning Potential. Please try again.');
    }
};

window.closePrediction = function() {
    document.getElementById('predictionModal').classList.remove('show');
};

window.executeSearchAction = function(idx) {
    if (window.currentSearchResults && window.currentSearchResults[idx]) {
        window.currentSearchResults[idx].action();
    }
};

// ========== 3D EFFECTS MANAGER ==========
const ThreeDEffectsManager = {
    enabled: true,
    mouseTracking: true,
    parallax: true,
    scrollReveal: true,
    
    init() {
        if (!this.enabled) return;
        
        this.initMouseTracking();
        this.initParallax();
        this.initScrollReveal();
        this.initSmoothScroll();
    },
    
    // Mouse tracking for 3D card tilting (like KASANÉ)
    initMouseTracking() {
        if (!this.mouseTracking) return;
        
        const cards = document.querySelectorAll('.course-card, .beauty-card, .modern-card, .feed-item, .certificate-card, .friend-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (!card.matches(':hover')) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) translateZ(20px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    },
    
    // Parallax scrolling effects
    initParallax() {
        if (!this.parallax) return;
        
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-section, .page-header, header');
            
            parallaxElements.forEach((el, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                el.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
            
            // Parallax for cards based on scroll position
            const cards = document.querySelectorAll('.course-card, .beauty-card, .modern-card');
            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const cardTop = rect.top;
                const cardCenter = cardTop + rect.height / 2;
                const scrollProgress = (windowHeight - cardCenter) / windowHeight;
                
                if (scrollProgress > -0.5 && scrollProgress < 1.5) {
                    const depth = Math.sin(scrollProgress * Math.PI) * 20;
                    const rotation = (scrollProgress - 0.5) * 5;
                    card.style.transform = `translateZ(${depth}px) rotateX(${rotation}deg)`;
                }
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    },
    
    // Scroll reveal animations
    initScrollReveal() {
        if (!this.scrollReveal) return;
        
        const revealElements = document.querySelectorAll('.course-card, .beauty-card, .modern-card, .feed-item');
        
        // Add scroll-reveal class to elements
        revealElements.forEach(el => {
            el.classList.add('scroll-reveal-3d');
        });
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => revealObserver.observe(el));
    },
    
    // Smooth scroll behavior
    initSmoothScroll() {
        // Add smooth scroll to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },
    
    // Enable/disable 3D effects
    toggle(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this.init();
        } else {
            // Remove all 3D transforms
            document.querySelectorAll('.course-card, .beauty-card, .modern-card').forEach(card => {
                card.style.transform = '';
            });
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    ViewModeManager.init();
    ThemeManager.init();
    UILayoutManager.init();
    ThreeDEffectsManager.init();
});

// Re-initialize 3D effects when content changes
window.addEventListener('load', () => {
    setTimeout(() => {
        ThreeDEffectsManager.init();
    }, 100);
});

