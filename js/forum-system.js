// Discussion Forum System for School Platform
// Per-course and per-module forums with threaded comments

const ForumManager = {
    threads: JSON.parse(localStorage.getItem('forum_threads') || '[]'),
    posts: JSON.parse(localStorage.getItem('forum_posts') || '[]'),
    
    // Create new thread
    createThread(courseId, moduleId, title, content, userId = null, userName = null) {
        if (!userId && user && user.email) {
            userId = user.email;
            userName = user.name || user.email;
        }
        
        if (!userId) {
            throw new Error('Please sign in to create a discussion');
        }
        
        if (!title || title.trim().length < 3) {
            throw new Error('Thread title must be at least 3 characters');
        }
        
        if (!content || content.trim().length < 10) {
            throw new Error('Thread content must be at least 10 characters');
        }
        
        const thread = {
            id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            courseId: courseId,
            moduleId: moduleId || null, // null = course-level forum
            title: SecurityUtils.sanitizeText(title.trim()),
            authorId: userId,
            authorName: userName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            postCount: 1,
            viewCount: 0,
            upvotes: 0,
            isPinned: false,
            isLocked: false
        };
        
        this.threads.push(thread);
        this.saveThreads();
        
        // Create first post (OP)
        const post = {
            id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            threadId: thread.id,
            authorId: userId,
            authorName: userName,
            content: SecurityUtils.sanitizeText(content.trim()),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            upvotes: 0,
            isAnswer: false,
            parentPostId: null // null = top-level post
        };
        
        this.posts.push(post);
        this.savePosts();
        
        // Save to Supabase
        this.saveToSupabase(thread, post);
        
        return thread;
    },
    
    // Add reply to thread
    addReply(threadId, content, parentPostId = null, userId = null, userName = null) {
        if (!userId && user && user.email) {
            userId = user.email;
            userName = user.name || user.email;
        }
        
        if (!userId) {
            throw new Error('Please sign in to reply');
        }
        
        if (!content || content.trim().length < 3) {
            throw new Error('Reply must be at least 3 characters');
        }
        
        const thread = this.threads.find(t => t.id === threadId);
        if (!thread) {
            throw new Error('Thread not found');
        }
        
        if (thread.isLocked) {
            throw new Error('This thread is locked');
        }
        
        const post = {
            id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            threadId: threadId,
            authorId: userId,
            authorName: userName,
            content: SecurityUtils.sanitizeText(content.trim()),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            upvotes: 0,
            isAnswer: false,
            parentPostId: parentPostId // null = reply to thread, otherwise reply to post
        };
        
        this.posts.push(post);
        this.savePosts();
        
        // Update thread
        thread.postCount = (thread.postCount || 0) + 1;
        thread.updatedAt = new Date().toISOString();
        this.saveThreads();
        
        // Save to Supabase
        this.savePostToSupabase(post);
        
        return post;
    },
    
    // Get threads for course/module
    getThreads(courseId, moduleId = null, options = {}) {
        let threads = this.threads.filter(t => t.courseId === courseId);
        
        if (moduleId !== null) {
            threads = threads.filter(t => t.moduleId === moduleId);
        } else {
            // Course-level threads only
            threads = threads.filter(t => t.moduleId === null);
        }
        
        // Sort
        if (options.sortBy === 'newest') {
            threads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (options.sortBy === 'oldest') {
            threads.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (options.sortBy === 'popular') {
            threads.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        } else if (options.sortBy === 'recent') {
            threads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
            // Default: pinned first, then by recent activity
            threads.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
        }
        
        return threads;
    },
    
    // Get posts for thread
    getPosts(threadId) {
        const threadPosts = this.posts.filter(p => p.threadId === threadId);
        
        // Sort: top-level posts first, then replies nested
        const topLevelPosts = threadPosts.filter(p => !p.parentPostId);
        const replies = threadPosts.filter(p => p.parentPostId);
        
        // Sort top-level by upvotes, then date
        topLevelPosts.sort((a, b) => {
            if (b.isAnswer && !a.isAnswer) return 1;
            if (a.isAnswer && !b.isAnswer) return -1;
            return (b.upvotes || 0) - (a.upvotes || 0);
        });
        
        // Build nested structure
        const nestedPosts = topLevelPosts.map(post => {
            const postReplies = replies.filter(r => r.parentPostId === post.id);
            postReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            return {
                ...post,
                replies: postReplies
            };
        });
        
        return nestedPosts;
    },
    
    // Upvote thread or post
    upvote(threadId, postId = null, userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        if (postId) {
            const post = this.posts.find(p => p.id === postId);
            if (!post) return false;
            
            if (!post.upvoters) post.upvoters = [];
            
            if (post.upvoters.includes(userId)) {
                // Remove upvote
                post.upvoters = post.upvoters.filter(id => id !== userId);
                post.upvotes = Math.max(0, (post.upvotes || 0) - 1);
            } else {
                // Add upvote
                post.upvoters.push(userId);
                post.upvotes = (post.upvotes || 0) + 1;
            }
            
            this.savePosts();
            return true;
        } else {
            const thread = this.threads.find(t => t.id === threadId);
            if (!thread) return false;
            
            if (!thread.upvoters) thread.upvoters = [];
            
            if (thread.upvoters.includes(userId)) {
                thread.upvoters = thread.upvoters.filter(id => id !== userId);
                thread.upvotes = Math.max(0, (thread.upvotes || 0) - 1);
            } else {
                thread.upvoters.push(userId);
                thread.upvotes = (thread.upvotes || 0) + 1;
            }
            
            this.saveThreads();
            return true;
        }
    },
    
    // Mark post as answer
    markAsAnswer(postId, userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        const post = this.posts.find(p => p.id === postId);
        if (!post) return false;
        
        // Check if user is thread author
        const thread = this.threads.find(t => t.id === post.threadId);
        if (!thread || thread.authorId !== userId) {
            throw new Error('Only the thread author can mark an answer');
        }
        
        // Unmark other answers in this thread
        this.posts.filter(p => p.threadId === post.threadId).forEach(p => {
            p.isAnswer = false;
        });
        
        // Mark this post as answer
        post.isAnswer = true;
        this.savePosts();
        
        return true;
    },
    
    // Delete thread or post
    deleteThread(threadId, userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        const thread = this.threads.find(t => t.id === threadId);
        if (!thread || thread.authorId !== userId) {
            return false; // Can only delete own threads
        }
        
        // Delete thread and all posts
        this.threads = this.threads.filter(t => t.id !== threadId);
        this.posts = this.posts.filter(p => p.threadId !== threadId);
        
        this.saveThreads();
        this.savePosts();
        return true;
    },
    
    deletePost(postId, userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        const post = this.posts.find(p => p.id === postId);
        if (!post || post.authorId !== userId) {
            return false; // Can only delete own posts
        }
        
        // Delete post and all replies
        this.posts = this.posts.filter(p => p.id !== postId && p.parentPostId !== postId);
        
        // Update thread post count
        const thread = this.threads.find(t => t.id === post.threadId);
        if (thread) {
            thread.postCount = Math.max(0, (thread.postCount || 0) - 1);
            this.saveThreads();
        }
        
        this.savePosts();
        return true;
    },
    
    // Save to Supabase
    async saveToSupabase(thread, post) {
        try {
            if (typeof SupabaseManager !== 'undefined' && SupabaseManager.client) {
                const client = await SupabaseManager.init();
                if (!client) return;
                
                // Save thread
                await client.from('forum_threads').upsert({
                    id: thread.id,
                    course_id: thread.courseId,
                    module_id: thread.moduleId,
                    title: thread.title,
                    author_id: thread.authorId,
                    author_name: thread.authorName,
                    post_count: thread.postCount,
                    view_count: thread.viewCount,
                    upvotes: thread.upvotes,
                    is_pinned: thread.isPinned,
                    is_locked: thread.isLocked,
                    created_at: thread.createdAt,
                    updated_at: thread.updatedAt
                });
                
                // Save post
                await client.from('forum_posts').upsert({
                    id: post.id,
                    thread_id: post.threadId,
                    author_id: post.authorId,
                    author_name: post.authorName,
                    content: post.content,
                    upvotes: post.upvotes,
                    is_answer: post.isAnswer,
                    parent_post_id: post.parentPostId,
                    created_at: post.createdAt,
                    updated_at: post.updatedAt
                });
            }
        } catch (error) {
            console.warn('Failed to save to Supabase:', error);
        }
    },
    
    async savePostToSupabase(post) {
        try {
            if (typeof SupabaseManager !== 'undefined' && SupabaseManager.client) {
                const client = await SupabaseManager.init();
                if (!client) return;
                
                await client.from('forum_posts').upsert({
                    id: post.id,
                    thread_id: post.threadId,
                    author_id: post.authorId,
                    author_name: post.authorName,
                    content: post.content,
                    upvotes: post.upvotes,
                    is_answer: post.isAnswer,
                    parent_post_id: post.parentPostId,
                    created_at: post.createdAt,
                    updated_at: post.updatedAt
                });
            }
        } catch (error) {
            console.warn('Failed to save post to Supabase:', error);
        }
    },
    
    // Load from Supabase
    async loadFromSupabase(courseId = null) {
        try {
            if (typeof SupabaseManager !== 'undefined' && SupabaseManager.client) {
                const client = await SupabaseManager.init();
                if (!client) return;
                
                let threadsQuery = client.from('forum_threads').select('*');
                if (courseId) {
                    threadsQuery = threadsQuery.eq('course_id', courseId);
                }
                
                const { data: threads, error: threadsError } = await threadsQuery.order('created_at', { ascending: false });
                
                if (!threadsError && threads && threads.length > 0) {
                    threads.forEach(supabaseThread => {
                        const existingIndex = this.threads.findIndex(t => t.id === supabaseThread.id);
                        if (existingIndex >= 0) {
                            this.threads[existingIndex] = {
                                ...this.threads[existingIndex],
                                ...supabaseThread,
                                courseId: supabaseThread.course_id,
                                moduleId: supabaseThread.module_id,
                                authorId: supabaseThread.author_id,
                                authorName: supabaseThread.author_name,
                                postCount: supabaseThread.post_count,
                                viewCount: supabaseThread.view_count,
                                isPinned: supabaseThread.is_pinned,
                                isLocked: supabaseThread.is_locked,
                                createdAt: supabaseThread.created_at,
                                updatedAt: supabaseThread.updated_at
                            };
                        } else {
                            this.threads.push({
                                id: supabaseThread.id,
                                courseId: supabaseThread.course_id,
                                moduleId: supabaseThread.module_id,
                                title: supabaseThread.title,
                                authorId: supabaseThread.author_id,
                                authorName: supabaseThread.author_name,
                                postCount: supabaseThread.post_count,
                                viewCount: supabaseThread.view_count,
                                upvotes: supabaseThread.upvotes,
                                isPinned: supabaseThread.is_pinned,
                                isLocked: supabaseThread.is_locked,
                                createdAt: supabaseThread.created_at,
                                updatedAt: supabaseThread.updated_at
                            });
                        }
                    });
                    this.saveThreads();
                }
                
                // Load posts
                let postsQuery = client.from('forum_posts').select('*');
                if (courseId) {
                    // Get thread IDs for this course
                    const courseThreadIds = this.threads.filter(t => t.courseId === courseId).map(t => t.id);
                    if (courseThreadIds.length > 0) {
                        postsQuery = postsQuery.in('thread_id', courseThreadIds);
                    } else {
                        return; // No threads, no posts
                    }
                }
                
                const { data: posts, error: postsError } = await postsQuery.order('created_at', { ascending: true });
                
                if (!postsError && posts && posts.length > 0) {
                    posts.forEach(supabasePost => {
                        const existingIndex = this.posts.findIndex(p => p.id === supabasePost.id);
                        if (existingIndex >= 0) {
                            this.posts[existingIndex] = {
                                ...this.posts[existingIndex],
                                ...supabasePost,
                                threadId: supabasePost.thread_id,
                                authorId: supabasePost.author_id,
                                authorName: supabasePost.author_name,
                                isAnswer: supabasePost.is_answer,
                                parentPostId: supabasePost.parent_post_id,
                                createdAt: supabasePost.created_at,
                                updatedAt: supabasePost.updated_at
                            };
                        } else {
                            this.posts.push({
                                id: supabasePost.id,
                                threadId: supabasePost.thread_id,
                                authorId: supabasePost.author_id,
                                authorName: supabasePost.author_name,
                                content: supabasePost.content,
                                upvotes: supabasePost.upvotes,
                                isAnswer: supabasePost.is_answer,
                                parentPostId: supabasePost.parent_post_id,
                                createdAt: supabasePost.created_at,
                                updatedAt: supabasePost.updated_at
                            });
                        }
                    });
                    this.savePosts();
                }
            }
        } catch (error) {
            console.warn('Supabase load error:', error);
        }
    },
    
    // Save to localStorage
    saveThreads() {
        localStorage.setItem('forum_threads', JSON.stringify(this.threads));
    },
    
    savePosts() {
        localStorage.setItem('forum_posts', JSON.stringify(this.posts));
    },
    
    // Initialize
    async init(courseId = null) {
        await this.loadFromSupabase(courseId);
    }
};

// Render forum UI
function renderForum(courseId, moduleId = null, containerId = 'forumContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    ForumManager.init(courseId).then(() => {
        const threads = ForumManager.getThreads(courseId, moduleId, { sortBy: 'recent' });
        const forumTitle = moduleId ? `Module ${moduleId} Discussion` : 'Course Discussion';
        
        container.innerHTML = `
            <div class="forum-section">
                <div class="forum-header">
                    <h2>💬 ${forumTitle}</h2>
                    <button class="btn btn-primary" onclick="openNewThreadForm('${courseId}', '${moduleId || ''}')">
                        + New Discussion
                    </button>
                </div>
                
                <div class="forum-filters">
                    <select id="forumSort" onchange="filterForumThreads('${courseId}', '${moduleId || ''}')">
                        <option value="recent">Recent Activity</option>
                        <option value="newest">Newest First</option>
                        <option value="popular">Most Popular</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
                
                <div class="forum-threads" id="forumThreads">
                    ${threads.length === 0 
                        ? '<div class="no-threads">No discussions yet. Be the first to start one!</div>'
                        : threads.map(thread => renderThreadCard(thread)).join('')
                    }
                </div>
            </div>
        `;
    });
}

function renderThreadCard(thread) {
    const timeAgo = getTimeAgo(new Date(thread.createdAt));
    const isOwnThread = user && user.email === thread.authorId;
    
    return `
        <div class="forum-thread-card" onclick="openThread('${thread.id}')">
            <div class="thread-header">
                <div class="thread-title-section">
                    ${thread.isPinned ? '<span class="pinned-badge">📌 Pinned</span>' : ''}
                    <h3 class="thread-title">${SecurityUtils.escapeHTML(thread.title)}</h3>
                </div>
                <div class="thread-meta">
                    <span class="thread-author">${thread.authorName || 'Anonymous'}</span>
                    <span class="thread-date">${timeAgo}</span>
                </div>
            </div>
            <div class="thread-stats">
                <span>💬 ${thread.postCount || 0} replies</span>
                <span>👁️ ${thread.viewCount || 0} views</span>
                <span>👍 ${thread.upvotes || 0} upvotes</span>
            </div>
            ${isOwnThread ? `
                <div class="thread-actions">
                    <button class="btn-small" onclick="event.stopPropagation(); deleteThread('${thread.id}')">Delete</button>
                </div>
            ` : ''}
        </div>
    `;
}

function renderThreadView(threadId) {
    const thread = ForumManager.threads.find(t => t.id === threadId);
    if (!thread) {
        alert('Thread not found');
        return;
    }
    
    // Increment view count
    thread.viewCount = (thread.viewCount || 0) + 1;
    ForumManager.saveThreads();
    
    const posts = ForumManager.getPosts(threadId);
    
    const container = document.getElementById('forumContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="forum-thread-view">
            <div class="thread-view-header">
                <button class="btn btn-secondary" onclick="renderForum('${thread.courseId}', '${thread.moduleId || ''}')">
                    ← Back to Discussions
                </button>
                <h2>${SecurityUtils.escapeHTML(thread.title)}</h2>
                <div class="thread-view-meta">
                    <span>By ${thread.authorName || 'Anonymous'}</span>
                    <span>•</span>
                    <span>${getTimeAgo(new Date(thread.createdAt))}</span>
                    <span>•</span>
                    <span>${thread.postCount || 0} replies</span>
                </div>
            </div>
            
            <div class="thread-posts" id="threadPosts">
                ${posts.map(post => renderPost(post, thread)).join('')}
            </div>
            
            <div class="reply-section">
                <h3>Add a Reply</h3>
                <textarea id="replyContent" rows="4" placeholder="Write your reply..."></textarea>
                <div class="reply-actions">
                    <button class="btn btn-primary" onclick="submitReply('${threadId}')">Post Reply</button>
                </div>
            </div>
        </div>
    `;
}

function renderPost(post, thread) {
    const timeAgo = getTimeAgo(new Date(post.createdAt));
    const isOwnPost = user && user.email === post.authorId;
    const isThreadAuthor = user && user.email === thread.authorId;
    const hasUpvoted = post.upvoters && post.upvoters.includes(user?.email);
    
    return `
        <div class="forum-post ${post.isAnswer ? 'answer-post' : ''}" data-post-id="${post.id}">
            ${post.isAnswer ? '<div class="answer-badge">✓ Accepted Answer</div>' : ''}
            <div class="post-header">
                <div class="post-author">
                    <strong>${post.authorName || 'Anonymous'}</strong>
                    <span class="post-date">${timeAgo}</span>
                </div>
                <div class="post-actions">
                    <button class="upvote-btn ${hasUpvoted ? 'upvoted' : ''}" onclick="event.stopPropagation(); upvotePost('${post.id}')">
                        👍 ${post.upvotes || 0}
                    </button>
                    ${isThreadAuthor && !post.isAnswer ? `
                        <button class="btn-small" onclick="event.stopPropagation(); markAsAnswer('${post.id}')">Mark as Answer</button>
                    ` : ''}
                    ${isOwnPost ? `
                        <button class="btn-small" onclick="event.stopPropagation(); deletePost('${post.id}', '${post.threadId}')">Delete</button>
                    ` : ''}
                </div>
            </div>
            <div class="post-content">
                ${SecurityUtils.escapeHTML(post.content).replace(/\n/g, '<br>')}
            </div>
            ${post.replies && post.replies.length > 0 ? `
                <div class="post-replies">
                    ${post.replies.map(reply => renderPost(reply, thread)).join('')}
                </div>
            ` : ''}
            <div class="post-reply-btn">
                <button class="btn-small" onclick="event.stopPropagation(); showReplyForm('${post.id}', '${post.threadId}')">Reply</button>
            </div>
        </div>
    `;
}

function openThread(threadId) {
    renderThreadView(threadId);
}

function openNewThreadForm(courseId, moduleId) {
    if (!user || !user.email) {
        alert('Please sign in to create a discussion');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'newThreadModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Start New Discussion</h2>
                <button class="close-btn" onclick="closeNewThreadModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="newThreadForm" onsubmit="submitNewThread(event, '${courseId}', '${moduleId || ''}')">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="threadTitle" placeholder="What's your question or topic?" required minlength="3">
                    </div>
                    <div class="form-group">
                        <label>Content</label>
                        <textarea id="threadContent" rows="6" placeholder="Describe your question or start the discussion..." required minlength="10"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeNewThreadModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Post Discussion</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-scroll to modal
    setTimeout(() => {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function submitNewThread(event, courseId, moduleId) {
    event.preventDefault();
    
    const title = document.getElementById('threadTitle').value.trim();
    const content = document.getElementById('threadContent').value.trim();
    
    try {
        const thread = ForumManager.createThread(courseId, moduleId || null, title, content);
        closeNewThreadModal();
        
        // Refresh forum
        renderForum(courseId, moduleId || null);
        
        // Open the new thread
        setTimeout(() => {
            openThread(thread.id);
        }, 100);
    } catch (error) {
        alert(error.message || 'Failed to create discussion');
    }
}

function submitReply(threadId, parentPostId = null) {
    const contentInput = document.getElementById('replyContent');
    if (!contentInput) return;
    
    const content = contentInput.value.trim();
    
    if (!content) {
        alert('Please write a reply');
        return;
    }
    
    try {
        ForumManager.addReply(threadId, content, parentPostId);
        contentInput.value = '';
        
        // Refresh thread view
        renderThreadView(threadId);
    } catch (error) {
        alert(error.message || 'Failed to post reply');
    }
}

function showReplyForm(postId, threadId) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    const existingForm = postElement.querySelector('.inline-reply-form');
    if (existingForm) {
        existingForm.remove();
        return;
    }
    
    const form = document.createElement('div');
    form.className = 'inline-reply-form';
    form.innerHTML = `
        <textarea id="replyToPost-${postId}" rows="3" placeholder="Write your reply..."></textarea>
        <div style="margin-top: 0.5rem;">
            <button class="btn btn-primary" onclick="submitReplyToPost('${postId}', '${threadId}')">Post Reply</button>
            <button class="btn btn-secondary" onclick="this.closest('.inline-reply-form').remove()">Cancel</button>
        </div>
    `;
    
    const replyBtn = postElement.querySelector('.post-reply-btn');
    if (replyBtn) {
        replyBtn.appendChild(form);
    }
}

function submitReplyToPost(postId, threadId) {
    const contentInput = document.getElementById(`replyToPost-${postId}`);
    if (!contentInput) return;
    
    const content = contentInput.value.trim();
    
    if (!content) {
        alert('Please write a reply');
        return;
    }
    
    try {
        ForumManager.addReply(threadId, content, postId);
        renderThreadView(threadId);
    } catch (error) {
        alert(error.message || 'Failed to post reply');
    }
}

function upvotePost(postId) {
    if (!user || !user.email) {
        alert('Please sign in to upvote');
        return;
    }
    
    ForumManager.upvote(null, postId);
    renderThreadView(ForumManager.posts.find(p => p.id === postId)?.threadId);
}

function upvoteThread(threadId) {
    if (!user || !user.email) {
        alert('Please sign in to upvote');
        return;
    }
    
    ForumManager.upvote(threadId);
    renderForum(ForumManager.threads.find(t => t.id === threadId)?.courseId);
}

function markAsAnswer(postId) {
    try {
        ForumManager.markAsAnswer(postId);
        const threadId = ForumManager.posts.find(p => p.id === postId)?.threadId;
        if (threadId) {
            renderThreadView(threadId);
        }
    } catch (error) {
        alert(error.message || 'Failed to mark as answer');
    }
}

function deleteThread(threadId) {
    if (!confirm('Are you sure you want to delete this discussion?')) {
        return;
    }
    
    const thread = ForumManager.threads.find(t => t.id === threadId);
    if (ForumManager.deleteThread(threadId)) {
        if (thread) {
            renderForum(thread.courseId, thread.moduleId);
        }
    }
}

function deletePost(postId, threadId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    if (ForumManager.deletePost(postId)) {
        renderThreadView(threadId);
    }
}

function filterForumThreads(courseId, moduleId) {
    const sortBy = document.getElementById('forumSort')?.value || 'recent';
    const threads = ForumManager.getThreads(courseId, moduleId || null, { sortBy });
    
    const threadsContainer = document.getElementById('forumThreads');
    if (threadsContainer) {
        threadsContainer.innerHTML = threads.length === 0 
            ? '<div class="no-threads">No discussions match your filter.</div>'
            : threads.map(thread => renderThreadCard(thread)).join('');
    }
}

function closeNewThreadModal() {
    const modal = document.getElementById('newThreadModal');
    if (modal) {
        modal.remove();
    }
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

// Global functions
window.ForumManager = ForumManager;
window.renderForum = renderForum;
window.openThread = openThread;
window.openNewThreadForm = openNewThreadForm;
window.submitNewThread = submitNewThread;
window.submitReply = submitReply;
window.upvotePost = upvotePost;
window.upvoteThread = upvoteThread;
window.markAsAnswer = markAsAnswer;
window.deleteThread = deleteThread;
window.deletePost = deletePost;
window.filterForumThreads = filterForumThreads;
window.closeNewThreadModal = closeNewThreadModal;

