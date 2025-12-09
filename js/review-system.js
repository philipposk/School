// Review System for School Platform
// Course reviews and ratings - inspired by SalonApp

const ReviewManager = {
    reviews: JSON.parse(localStorage.getItem('course_reviews') || '[]'),
    
    // Add or update review
    async addReview(courseId, rating, comment, userId = null, userName = null) {
        if (!userId && user && user.email) {
            userId = user.email;
            userName = user.name || user.email;
        }
        
        if (!userId) {
            throw new Error('Please sign in to leave a review');
        }
        
        if (!rating || rating < 1 || rating > 5) {
            throw new Error('Please select a rating between 1 and 5 stars');
        }
        
        // Check if user already reviewed this course
        const existingIndex = this.reviews.findIndex(
            r => r.courseId === courseId && r.userId === userId
        );
        
        const review = {
            id: existingIndex >= 0 ? this.reviews[existingIndex].id : `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            courseId: courseId,
            userId: userId,
            userName: userName,
            rating: rating,
            comment: (SecurityUtils && SecurityUtils.sanitizeText) ? SecurityUtils.sanitizeText(comment || '') : (comment || '').replace(/<[^>]*>/g, '').trim(),
            createdAt: existingIndex >= 0 ? this.reviews[existingIndex].createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            helpfulCount: existingIndex >= 0 ? (this.reviews[existingIndex].helpfulCount || 0) : 0,
            isVisible: true,
            verifiedPurchase: false // Can be set to true if user completed course
        };
        
        if (existingIndex >= 0) {
            this.reviews[existingIndex] = review;
        } else {
            this.reviews.push(review);
        }
        
        this.saveReviews();
        
        // Try to save to Supabase if available
        await this.saveToSupabase(review);
        
        return review;
    },
    
    // Get reviews for a course
    getReviewsForCourse(courseId, options = {}) {
        let courseReviews = this.reviews.filter(r => r.courseId === courseId && r.isVisible);
        
        // Sort by helpful count, then by date
        if (options.sortBy === 'helpful') {
            courseReviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        } else if (options.sortBy === 'newest') {
            courseReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (options.sortBy === 'oldest') {
            courseReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (options.sortBy === 'rating') {
            courseReviews.sort((a, b) => b.rating - a.rating);
        } else {
            // Default: newest first
            courseReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        // Filter by rating if specified
        if (options.rating) {
            courseReviews = courseReviews.filter(r => r.rating === options.rating);
        }
        
        return courseReviews;
    },
    
    // Get user's review for a course
    getUserReview(courseId, userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return null;
        
        return this.reviews.find(r => r.courseId === courseId && r.userId === userId);
    },
    
    // Check if user has reviewed
    hasUserReviewed(courseId, userId = null) {
        return !!this.getUserReview(courseId, userId);
    },
    
    // Calculate average rating
    getAverageRating(courseId) {
        const courseReviews = this.getReviewsForCourse(courseId);
        if (courseReviews.length === 0) return 0;
        
        const sum = courseReviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / courseReviews.length).toFixed(1);
    },
    
    // Get rating distribution
    getRatingDistribution(courseId) {
        const courseReviews = this.getReviewsForCourse(courseId);
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        courseReviews.forEach(review => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });
        
        return distribution;
    },
    
    // Mark review as helpful
    markHelpful(reviewId, userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) return false;
        
        // Check if user already marked this helpful
        if (!review.helpfulUsers) {
            review.helpfulUsers = [];
        }
        
        if (review.helpfulUsers.includes(userId)) {
            // Unmark as helpful
            review.helpfulUsers = review.helpfulUsers.filter(id => id !== userId);
            review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
        } else {
            // Mark as helpful
            review.helpfulUsers.push(userId);
            review.helpfulCount = (review.helpfulCount || 0) + 1;
        }
        
        this.saveReviews();
        return true;
    },
    
    // Delete review
    deleteReview(reviewId, userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review || review.userId !== userId) {
            return false; // Can only delete own reviews
        }
        
        this.reviews = this.reviews.filter(r => r.id !== reviewId);
        this.saveReviews();
        return true;
    },
    
    // Save to Supabase
    async saveToSupabase(review) {
        try {
            if (typeof SupabaseManager !== 'undefined' && SupabaseManager.client) {
                const client = await SupabaseManager.init();
                if (!client) return;
                
                const { data, error } = await client
                    .from('course_reviews')
                    .upsert({
                        id: review.id,
                        course_id: review.courseId,
                        user_id: review.userId,
                        user_name: review.userName,
                        rating: review.rating,
                        comment: review.comment,
                        helpful_count: review.helpfulCount || 0,
                        is_visible: review.isVisible,
                        verified_purchase: review.verifiedPurchase,
                        created_at: review.createdAt,
                        updated_at: review.updatedAt
                    }, {
                        onConflict: 'id'
                    });
                
                if (error) {
                    console.warn('Failed to save review to Supabase:', error);
                }
            }
        } catch (error) {
            console.warn('Supabase save error:', error);
        }
    },
    
    // Load from Supabase
    async loadFromSupabase(courseId = null) {
        try {
            if (typeof SupabaseManager !== 'undefined' && SupabaseManager.client) {
                const client = await SupabaseManager.init();
                if (!client) return;
                
                let query = client.from('course_reviews').select('*');
                
                if (courseId) {
                    query = query.eq('course_id', courseId);
                }
                
                const { data, error } = await query.order('created_at', { ascending: false });
                
                if (error) {
                    console.warn('Failed to load reviews from Supabase:', error);
                    return;
                }
                
                if (data && data.length > 0) {
                    // Merge with local reviews
                    data.forEach(supabaseReview => {
                        const existingIndex = this.reviews.findIndex(r => r.id === supabaseReview.id);
                        if (existingIndex >= 0) {
                            // Update existing
                            this.reviews[existingIndex] = {
                                ...this.reviews[existingIndex],
                                ...supabaseReview,
                                courseId: supabaseReview.course_id,
                                userId: supabaseReview.user_id,
                                userName: supabaseReview.user_name,
                                helpfulCount: supabaseReview.helpful_count,
                                isVisible: supabaseReview.is_visible,
                                verifiedPurchase: supabaseReview.verified_purchase,
                                createdAt: supabaseReview.created_at,
                                updatedAt: supabaseReview.updated_at
                            };
                        } else {
                            // Add new
                            this.reviews.push({
                                id: supabaseReview.id,
                                courseId: supabaseReview.course_id,
                                userId: supabaseReview.user_id,
                                userName: supabaseReview.user_name,
                                rating: supabaseReview.rating,
                                comment: supabaseReview.comment,
                                helpfulCount: supabaseReview.helpful_count || 0,
                                isVisible: supabaseReview.is_visible,
                                verifiedPurchase: supabaseReview.verified_purchase,
                                createdAt: supabaseReview.created_at,
                                updatedAt: supabaseReview.updated_at
                            });
                        }
                    });
                    
                    this.saveReviews();
                }
            }
        } catch (error) {
            console.warn('Supabase load error:', error);
        }
    },
    
    // Save to localStorage
    saveReviews() {
        localStorage.setItem('course_reviews', JSON.stringify(this.reviews));
    },
    
    // Initialize - load from Supabase
    async init(courseId = null) {
        await this.loadFromSupabase(courseId);
    }
};

// Render review form
function renderReviewForm(courseId, existingReview = null) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'reviewModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>${existingReview ? 'Edit Review' : 'Write a Review'}</h2>
                <button class="close-btn" onclick="closeReviewModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="reviewForm" onsubmit="submitReview(event, '${courseId}')">
                    <div class="form-group">
                        <label>Your Rating</label>
                        <div class="star-rating" id="starRating">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <span class="star" data-rating="${star}" onclick="setRating(${star})">
                                    ${star <= (existingReview?.rating || 0) ? '★' : '☆'}
                                </span>
                            `).join('')}
                        </div>
                        <input type="hidden" id="reviewRating" name="rating" value="${existingReview?.rating || 0}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reviewComment">Your Review (Optional)</label>
                        <textarea 
                            id="reviewComment" 
                            name="comment" 
                            rows="5" 
                            placeholder="Share your experience with this course..."
                            maxlength="1000">${existingReview?.comment || ''}</textarea>
                        <div class="char-count">
                            <span id="charCount">${(existingReview?.comment || '').length}</span>/1000 characters
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeReviewModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">${existingReview ? 'Update Review' : 'Submit Review'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Character counter
    const commentField = document.getElementById('reviewComment');
    const charCount = document.getElementById('charCount');
    if (commentField && charCount) {
        commentField.addEventListener('input', (e) => {
            charCount.textContent = e.target.value.length;
        });
    }
    
    // Star rating interaction
    setupStarRating();
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('reviewRating');
    
    stars.forEach(star => {
        star.addEventListener('mouseenter', (e) => {
            const rating = parseInt(e.target.dataset.rating);
            highlightStars(rating);
        });
        
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.rating);
            setRating(rating);
        });
    });
    
    document.getElementById('starRating')?.addEventListener('mouseleave', () => {
        const currentRating = parseInt(ratingInput?.value || 0);
        highlightStars(currentRating);
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.style.color = '#ffc107';
        } else {
            star.textContent = '☆';
            star.style.color = '#ccc';
        }
    });
}

function setRating(rating) {
    const ratingInput = document.getElementById('reviewRating');
    if (ratingInput) {
        ratingInput.value = rating;
        highlightStars(rating);
    }
}

async function submitReview(event, courseId) {
    event.preventDefault();
    
    if (!user || !user.email) {
        alert('Please sign in to leave a review');
        return;
    }
    
    const rating = parseInt(document.getElementById('reviewRating').value);
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (!rating || rating < 1 || rating > 5) {
        alert('Please select a rating');
        return;
    }
    
    try {
        await ReviewManager.addReview(courseId, rating, comment);
        closeReviewModal();
        
        // Refresh reviews display
        if (window.refreshCourseReviews) {
            window.refreshCourseReviews(courseId);
        }
        
        alert('Thank you for your review!');
    } catch (error) {
        alert(error.message || 'Failed to submit review');
    }
}

function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.remove();
    }
}

// Render reviews display
function renderReviews(courseId, containerId = 'reviewsContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const reviews = ReviewManager.getReviewsForCourse(courseId);
    const averageRating = ReviewManager.getAverageRating(courseId);
    const distribution = ReviewManager.getRatingDistribution(courseId);
    const totalReviews = reviews.length;
    const userReview = ReviewManager.getUserReview(courseId);
    
    container.innerHTML = `
        <div class="reviews-section">
            <div class="reviews-header">
                <div class="reviews-summary">
                    <div class="average-rating">
                        <span class="rating-number">${averageRating}</span>
                        <div class="stars-display">
                            ${renderStars(parseFloat(averageRating))}
                        </div>
                        <span class="review-count">${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}</span>
                    </div>
                    
                    <div class="rating-distribution">
                        ${[5, 4, 3, 2, 1].map(rating => {
                            const count = distribution[rating] || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews * 100).toFixed(0) : 0;
                            return `
                                <div class="rating-bar-row">
                                    <span class="rating-label">${rating}★</span>
                                    <div class="rating-bar">
                                        <div class="rating-bar-fill" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="rating-count">${count}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="reviews-actions">
                    ${userReview 
                        ? `<button class="btn btn-secondary" onclick="openEditReview('${courseId}')">Edit Your Review</button>`
                        : `<button class="btn btn-primary" onclick="openReviewForm('${courseId}')">Write a Review</button>`
                    }
                </div>
            </div>
            
            <div class="reviews-filters">
                <select id="reviewSort" onchange="filterReviews('${courseId}')">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating">Highest Rating</option>
                    <option value="helpful">Most Helpful</option>
                </select>
                
                <select id="reviewRatingFilter" onchange="filterReviews('${courseId}')">
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>
            
            <div class="reviews-list" id="reviewsList">
                ${reviews.length === 0 
                    ? '<div class="no-reviews">No reviews yet. Be the first to review this course!</div>'
                    : reviews.map(review => renderReviewCard(review)).join('')
                }
            </div>
        </div>
    `;
}

function renderReviewCard(review) {
    const isOwnReview = user && user.email === review.userId;
    const timeAgo = getTimeAgo(new Date(review.createdAt));
    const isEdited = review.updatedAt !== review.createdAt;
    
    return `
        <div class="review-card" data-review-id="${review.id}">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-name">
                        ${review.userName || 'Anonymous'}
                        ${review.verifiedPurchase ? '<span class="verified-badge">✓ Verified Purchase</span>' : ''}
                    </div>
                    <div class="review-date">${timeAgo}${isEdited ? ' (edited)' : ''}</div>
                </div>
                <div class="review-rating">
                    ${renderStars(review.rating)}
                </div>
            </div>
            
            ${review.comment ? `
                <div class="review-comment">${(SecurityUtils && SecurityUtils.escapeHTML) ? SecurityUtils.escapeHTML(review.comment) : review.comment.replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[m]))}</div>
            ` : ''}
            
            <div class="review-footer">
                <button class="helpful-btn" onclick="toggleHelpful('${review.id}')">
                    👍 Helpful (${review.helpfulCount || 0})
                </button>
                ${isOwnReview ? `
                    <button class="delete-review-btn" onclick="deleteReview('${review.id}', '${review.courseId}')">Delete</button>
                ` : ''}
            </div>
        </div>
    `;
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star filled">★</span>';
    }
    
    if (hasHalfStar) {
        stars += '<span class="star half">★</span>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star">☆</span>';
    }
    
    return stars;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
    return `${Math.floor(seconds / 31536000)} years ago`;
}

function filterReviews(courseId) {
    const sortBy = document.getElementById('reviewSort')?.value || 'newest';
    const ratingFilter = document.getElementById('reviewRatingFilter')?.value || '';
    
    const reviews = ReviewManager.getReviewsForCourse(courseId, {
        sortBy: sortBy,
        rating: ratingFilter ? parseInt(ratingFilter) : null
    });
    
    const reviewsList = document.getElementById('reviewsList');
    if (reviewsList) {
        reviewsList.innerHTML = reviews.length === 0 
            ? '<div class="no-reviews">No reviews match your filters.</div>'
            : reviews.map(review => renderReviewCard(review)).join('');
    }
}

function toggleHelpful(reviewId) {
    if (!user || !user.email) {
        alert('Please sign in to mark reviews as helpful');
        return;
    }
    
    ReviewManager.markHelpful(reviewId);
    
    // Refresh reviews display
    const reviewCard = document.querySelector(`[data-review-id="${reviewId}"]`);
    if (reviewCard) {
        const review = ReviewManager.reviews.find(r => r.id === reviewId);
        if (review) {
            const helpfulBtn = reviewCard.querySelector('.helpful-btn');
            if (helpfulBtn) {
                helpfulBtn.textContent = `👍 Helpful (${review.helpfulCount || 0})`;
            }
        }
    }
}

function deleteReview(reviewId, courseId) {
    if (!confirm('Are you sure you want to delete your review?')) {
        return;
    }
    
    if (ReviewManager.deleteReview(reviewId)) {
        if (window.refreshCourseReviews) {
            window.refreshCourseReviews(courseId);
        } else {
            renderReviews(courseId);
        }
    }
}

function openReviewForm(courseId) {
    if (!user || !user.email) {
        alert('Please sign in to leave a review');
        return;
    }
    
    renderReviewForm(courseId);
}

function openEditReview(courseId) {
    const userReview = ReviewManager.getUserReview(courseId);
    if (userReview) {
        renderReviewForm(courseId, userReview);
    }
}

// Global functions
window.ReviewManager = ReviewManager;
window.renderReviews = renderReviews;
window.openReviewForm = openReviewForm;
window.openEditReview = openEditReview;
window.refreshCourseReviews = function(courseId) {
    renderReviews(courseId);
};

