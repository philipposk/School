// Search & Discovery System for School Platform
// Full-text search across courses, modules, and content

const SearchManager = {
    searchIndex: null,
    searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    
    // Initialize search index
    init() {
        this.buildSearchIndex();
    },
    
    // Build searchable index from all courses and modules
    buildSearchIndex() {
        if (!courses || courses.length === 0) {
            this.searchIndex = [];
            return;
        }
        
        const index = [];
        
        courses.forEach(course => {
            // Index course
            index.push({
                type: 'course',
                id: course.id,
                title: course.title || '',
                description: course.description || '',
                content: `${course.title || ''} ${course.description || ''}`.toLowerCase(),
                courseId: course.id,
                url: `#course-${course.id}`
            });
            
            // Index modules
            if (course.modules_data && Array.isArray(course.modules_data)) {
                course.modules_data.forEach(module => {
                    index.push({
                        type: 'module',
                        id: module.id,
                        title: module.title || '',
                        description: module.description || '',
                        content: `${module.title || ''} ${module.description || ''}`.toLowerCase(),
                        courseId: course.id,
                        courseTitle: course.title || '',
                        url: `#course-${course.id}-module-${module.id}`
                    });
                });
            }
        });
        
        this.searchIndex = index;
    },
    
    // Perform search
    search(query, options = {}) {
        if (!query || query.trim().length < 2) {
            return { results: [], query: query };
        }
        
        const searchQuery = query.toLowerCase().trim();
        const searchTerms = searchQuery.split(/\s+/);
        
        // Save to history
        this.addToHistory(searchQuery);
        
        // Score and rank results
        const scoredResults = this.searchIndex.map(item => {
            let score = 0;
            const itemContent = item.content || '';
            
            // Exact phrase match (highest score)
            if (itemContent.includes(searchQuery)) {
                score += 100;
            }
            
            // Title match (high score)
            const titleLower = (item.title || '').toLowerCase();
            if (titleLower.includes(searchQuery)) {
                score += 50;
            }
            
            // Individual term matches
            searchTerms.forEach(term => {
                if (itemContent.includes(term)) {
                    score += 10;
                }
                if (titleLower.includes(term)) {
                    score += 20;
                }
            });
            
            // Type boost (courses rank higher)
            if (item.type === 'course') {
                score += 5;
            }
            
            return { ...item, score };
        }).filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);
        
        // Apply filters
        let filteredResults = scoredResults;
        
        if (options.type) {
            filteredResults = filteredResults.filter(r => r.type === options.type);
        }
        
        if (options.courseId) {
            filteredResults = filteredResults.filter(r => r.courseId === options.courseId);
        }
        
        // Limit results
        const limit = options.limit || 20;
        const results = filteredResults.slice(0, limit);
        
        return {
            query: searchQuery,
            results: results,
            total: scoredResults.length,
            filtered: filteredResults.length
        };
    },
    
    // Add to search history
    addToHistory(query) {
        if (!query || query.trim().length < 2) return;
        
        const trimmed = query.trim().toLowerCase();
        
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(h => h.query !== trimmed);
        
        // Add to beginning
        this.searchHistory.unshift({
            query: trimmed,
            timestamp: Date.now()
        });
        
        // Keep last 20
        this.searchHistory = this.searchHistory.slice(0, 20);
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    },
    
    // Get search suggestions
    getSuggestions(query) {
        if (!query || query.trim().length < 1) {
            // Return recent searches
            return this.searchHistory.slice(0, 5).map(h => h.query);
        }
        
        const searchQuery = query.toLowerCase().trim();
        const suggestions = new Set();
        
        // Add matching history items
        this.searchHistory.forEach(h => {
            if (h.query.startsWith(searchQuery)) {
                suggestions.add(h.query);
            }
        });
        
        // Add matching course/module titles
        this.searchIndex.forEach(item => {
            const title = (item.title || '').toLowerCase();
            if (title.includes(searchQuery) && title.length < 50) {
                suggestions.add(item.title);
            }
        });
        
        return Array.from(suggestions).slice(0, 8);
    },
    
    // Get popular searches
    getPopularSearches() {
        // Could be enhanced with analytics
        return [
            'web development',
            'ios development',
            'finance',
            'critical thinking',
            'javascript',
            'swift',
            'react',
            'python'
        ];
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        if (typeof courses !== 'undefined') {
            SearchManager.init();
        }
    });
}

window.SearchManager = SearchManager;
