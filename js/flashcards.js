// Flashcards & Spaced Repetition System
// Interactive flashcards with spaced repetition algorithm

const FlashcardManager = {
    decks: JSON.parse(localStorage.getItem('flashcard_decks') || '[]'),
    studySessions: JSON.parse(localStorage.getItem('flashcard_sessions') || '[]'),
    
    // Create flashcard deck for a module
    createDeck(courseId, moduleId, moduleTitle) {
        const deckId = `deck_${courseId}_${moduleId}`;
        
        let deck = this.decks.find(d => d.id === deckId);
        if (deck) return deck;
        
        deck = {
            id: deckId,
            courseId: courseId,
            moduleId: moduleId,
            title: `${moduleTitle} - Flashcards`,
            cards: [],
            createdAt: new Date().toISOString(),
            lastStudied: null,
            totalReviews: 0
        };
        
        this.decks.push(deck);
        this.saveDecks();
        return deck;
    },
    
    // Add card to deck
    addCard(deckId, front, back, tags = []) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) throw new Error('Deck not found');
        
        const card = {
            id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            front: SecurityUtils.sanitizeText(front),
            back: SecurityUtils.sanitizeText(back),
            tags: tags,
            createdAt: new Date().toISOString(),
            // Spaced repetition data
            easeFactor: 2.5, // SM-2 algorithm
            interval: 1, // days
            repetitions: 0,
            nextReview: new Date().toISOString(),
            lastReview: null
        };
        
        deck.cards.push(card);
        this.saveDecks();
        return card;
    },
    
    // Get cards due for review (spaced repetition)
    getCardsDueForReview(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return [];
        
        const now = new Date();
        return deck.cards.filter(card => {
            const nextReview = new Date(card.nextReview);
            return nextReview <= now;
        });
    },
    
    // Review a card (SM-2 algorithm)
    reviewCard(deckId, cardId, quality) {
        // Quality: 0-5 (0=blackout, 1=incorrect, 2=incorrect but remembered, 3=correct with difficulty, 4=correct, 5=perfect)
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return null;
        
        const card = deck.cards.find(c => c.id === cardId);
        if (!card) return null;
        
        const now = new Date();
        card.lastReview = now.toISOString();
        
        if (quality < 3) {
            // Incorrect - reset
            card.repetitions = 0;
            card.interval = 1;
        } else {
            // Correct - update using SM-2
            if (card.repetitions === 0) {
                card.interval = 1;
            } else if (card.repetitions === 1) {
                card.interval = 6;
            } else {
                card.interval = Math.round(card.interval * card.easeFactor);
            }
            
            card.repetitions += 1;
            
            // Update ease factor
            card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        }
        
        // Set next review date
        const nextReview = new Date(now);
        nextReview.setDate(nextReview.getDate() + card.interval);
        card.nextReview = nextReview.toISOString();
        
        deck.lastStudied = now.toISOString();
        deck.totalReviews += 1;
        
        this.saveDecks();
        return card;
    },
    
    // Get study session cards
    getStudySession(deckId, count = 20) {
        const dueCards = this.getCardsDueForReview(deckId);
        const deck = this.decks.find(d => d.id === deckId);
        
        if (!deck) return [];
        
        // Mix due cards with new cards
        const newCards = deck.cards.filter(c => !c.lastReview);
        const allCards = [...dueCards, ...newCards].slice(0, count);
        
        // Shuffle
        return allCards.sort(() => Math.random() - 0.5);
    },
    
    // Save decks
    saveDecks() {
        localStorage.setItem('flashcard_decks', JSON.stringify(this.decks));
    },
    
    // Get deck for module
    getDeckForModule(courseId, moduleId) {
        const deckId = `deck_${courseId}_${moduleId}`;
        return this.decks.find(d => d.id === deckId);
    },
    
    // Generate flashcards from module content (AI-powered)
    async generateFlashcardsFromModule(courseId, moduleId) {
        // This would use AI to extract key concepts and create flashcards
        // For now, returns empty array - can be enhanced with AI integration
        return [];
    }
};

window.FlashcardManager = FlashcardManager;
