// Video Player System for School Platform
// YouTube embedding with progress tracking

const VideoPlayer = {
    // Embed YouTube video
    embedYouTube(videoId, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }
        
        if (!videoId) {
            container.innerHTML = '<p style="color: var(--text-light); padding: 2rem; text-align: center;">Video not available</p>';
            return;
        }
        
        const width = options.width || '100%';
        const height = options.height || '500';
        const autoplay = options.autoplay ? '1' : '0';
        const controls = options.controls !== false ? '1' : '0';
        const modestbranding = options.modestbranding !== false ? '1' : '0';
        const rel = options.showRelated ? '1' : '0';
        const enablejsapi = '1'; // Enable API for progress tracking
        
        // Create responsive wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';
        wrapper.style.cssText = 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 8px;';
        
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&controls=${controls}&modestbranding=${modestbranding}&rel=${rel}&enablejsapi=${enablejsapi}`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.id = `youtube-player-${videoId}`;
        
        wrapper.appendChild(iframe);
        container.innerHTML = '';
        container.appendChild(wrapper);
        
        // Track video progress if user is logged in
        if (user && user.email && options.trackProgress !== false) {
            this.trackVideoProgress(videoId, containerId);
        }
    },
    
    // Track video progress (saves to localStorage and Supabase)
    async trackVideoProgress(videoId, containerId) {
        // This would require YouTube IFrame API for actual progress tracking
        // For now, we'll track when video is viewed
        const progressKey = `video_progress_${videoId}`;
        const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
        
        if (!progress.viewed) {
            progress.viewed = true;
            progress.viewedAt = new Date().toISOString();
            progress.completed = false;
            localStorage.setItem(progressKey, JSON.stringify(progress));
            
            // Save to Supabase if available
            if (typeof SupabaseManager !== 'undefined' && state.currentCourseId && state.currentModule) {
                try {
                    const client = await SupabaseManager.init();
                    if (client && user && user.email) {
                        await client
                            .from('user_progress')
                            .upsert({
                                user_id: user.email,
                                course_id: state.currentCourseId,
                                module_id: `video_${videoId}`,
                                completed: false,
                                progress_percentage: 0
                            });
                    }
                } catch (error) {
                    console.warn('Failed to save video progress to Supabase:', error);
                }
            }
        }
    },
    
    // Mark video as completed
    async markVideoCompleted(videoId) {
        const progressKey = `video_progress_${videoId}`;
        const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
        progress.completed = true;
        progress.completedAt = new Date().toISOString();
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        // Save to Supabase
        if (typeof SupabaseManager !== 'undefined' && state.currentCourseId && state.currentModule) {
            try {
                const client = await SupabaseManager.init();
                if (client && user && user.email) {
                    await client
                        .from('user_progress')
                        .upsert({
                            user_id: user.email,
                            course_id: state.currentCourseId,
                            module_id: `video_${videoId}`,
                            completed: true,
                            progress_percentage: 100,
                            completed_at: new Date().toISOString()
                        });
                }
            } catch (error) {
                console.warn('Failed to save video completion to Supabase:', error);
            }
        }
    },
    
    // Check if video is completed
    isVideoCompleted(videoId) {
        const progressKey = `video_progress_${videoId}`;
        const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
        return progress.completed === true;
    },
    
    // Get video progress
    getVideoProgress(videoId) {
        const progressKey = `video_progress_${videoId}`;
        return JSON.parse(localStorage.getItem(progressKey) || '{}');
    }
};

// Render video in module
function renderVideoInModule(videoId, moduleId) {
    if (!videoId) return '';
    
    const containerId = `video-container-${moduleId}`;
    return `
        <div class="module-video-section">
            <h3>📹 Video Lesson</h3>
            <div id="${containerId}" class="video-container"></div>
            <div class="video-actions" style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;">
                <button class="btn btn-secondary" onclick="markVideoComplete('${videoId}')" id="completeVideoBtn-${videoId}">
                    ${VideoPlayer.isVideoCompleted(videoId) ? '✓ Video Completed' : 'Mark as Complete'}
                </button>
                <span style="color: var(--text-light); font-size: 0.9rem;">
                    ${VideoPlayer.isVideoCompleted(videoId) ? 'Completed' : 'In Progress'}
                </span>
            </div>
        </div>
    `;
}

function markVideoComplete(videoId) {
    VideoPlayer.markVideoCompleted(videoId);
    const btn = document.getElementById(`completeVideoBtn-${videoId}`);
    if (btn) {
        btn.textContent = '✓ Video Completed';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-success');
    }
    
    // Update progress
    if (typeof updateProgress === 'function') {
        updateProgress();
    }
}

// Global functions
window.VideoPlayer = VideoPlayer;
window.renderVideoInModule = renderVideoInModule;
window.markVideoComplete = markVideoComplete;

