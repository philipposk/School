// Instructor Dashboard System
// Course creation, management, and analytics for instructors

const InstructorDashboard = {
    currentView: 'dashboard', // dashboard, create-course, edit-course, students, analytics
    currentCourseId: null,
    courses: JSON.parse(localStorage.getItem('instructor_courses') || '[]'),
    
    // Check if user is instructor
    isInstructor(userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        // Check localStorage first
        const instructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        if (instructors.includes(userId)) return true;
        
        // Check Supabase
        // For now, we'll use localStorage. Can be enhanced with Supabase roles
        return false;
    },
    
    // Make user an instructor
    async makeInstructor(userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        const instructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        if (!instructors.includes(userId)) {
            instructors.push(userId);
            localStorage.setItem('instructors', JSON.stringify(instructors));
        }
        
        // Save to Supabase if available
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    await client.from('profiles').upsert({
                        id: userId,
                        is_instructor: true
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to save instructor status to Supabase:', error);
        }
        
        return true;
    },
    
    // Create new course
    createCourse(courseData) {
        if (!this.isInstructor()) {
            throw new Error('Only instructors can create courses');
        }
        
        const course = {
            id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            instructorId: user.email,
            instructorName: user.name || user.email,
            title: SecurityUtils.sanitizeText(courseData.title),
            description: SecurityUtils.sanitizeText(courseData.description),
            subtitle: SecurityUtils.sanitizeText(courseData.subtitle || ''),
            category: courseData.category || 'general',
            price: courseData.price || 0,
            isFree: courseData.price === 0 || courseData.isFree === true,
            thumbnail: courseData.thumbnail || '',
            level: courseData.level || 'Beginner',
            duration: courseData.duration || '8 weeks',
            modules: courseData.modules || 8,
            modules_data: courseData.modules_data || [],
            isPublished: courseData.isPublished || false,
            isApproved: false,
            approvalStatus: 'pending',
            adminNotes: '',
            approvedBy: null,
            approvedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            enrollmentCount: 0,
            rating: 0,
            reviewCount: 0
        };
        
        this.courses.push(course);
        this.saveCourses();
        
        // Save to Supabase
        this.saveCourseToSupabase(course);
        
        return course;
    },
    
    // Update course
    updateCourse(courseId, updates) {
        const courseIndex = this.courses.findIndex(c => c.id === courseId);
        if (courseIndex === -1) {
            throw new Error('Course not found');
        }
        
        const course = this.courses[courseIndex];
        if (course.instructorId !== user.email && !this.isInstructor()) {
            throw new Error('You can only edit your own courses');
        }
        
        // Update fields
        if (updates.title !== undefined) course.title = SecurityUtils.sanitizeText(updates.title);
        if (updates.description !== undefined) course.description = SecurityUtils.sanitizeText(updates.description);
        if (updates.subtitle !== undefined) course.subtitle = SecurityUtils.sanitizeText(updates.subtitle);
        if (updates.category !== undefined) course.category = updates.category;
        if (updates.price !== undefined) {
            course.price = updates.price;
            course.isFree = updates.price === 0;
        }
        if (updates.thumbnail !== undefined) course.thumbnail = updates.thumbnail;
        if (updates.level !== undefined) course.level = updates.level;
        if (updates.duration !== undefined) course.duration = updates.duration;
        if (updates.modules !== undefined) course.modules = updates.modules;
        if (updates.modules_data !== undefined) course.modules_data = updates.modules_data;
        if (updates.isPublished !== undefined) course.isPublished = updates.isPublished;
        if (updates.isApproved !== undefined) course.isApproved = updates.isApproved;
        if (updates.approvalStatus !== undefined) course.approvalStatus = updates.approvalStatus;
        if (updates.adminNotes !== undefined) course.adminNotes = updates.adminNotes;
        if (updates.approvedBy !== undefined) course.approvedBy = updates.approvedBy;
        if (updates.approvedAt !== undefined) course.approvedAt = updates.approvedAt;
        
        course.updatedAt = new Date().toISOString();
        
        this.courses[courseIndex] = course;
        this.saveCourses();
        
        // Save to Supabase
        this.saveCourseToSupabase(course);
        
        return course;
    },
    
    // Delete course
    deleteCourse(courseId) {
        const courseIndex = this.courses.findIndex(c => c.id === courseId);
        if (courseIndex === -1) {
            throw new Error('Course not found');
        }
        
        const course = this.courses[courseIndex];
        if (course.instructorId !== user.email && !this.isInstructor()) {
            throw new Error('You can only delete your own courses');
        }
        
        this.courses.splice(courseIndex, 1);
        this.saveCourses();
        
        // Delete from Supabase
        this.deleteCourseFromSupabase(courseId);
        
        return true;
    },
    
    // Get instructor's courses
    getInstructorCourses(instructorId = null) {
        if (!instructorId && user && user.email) {
            instructorId = user.email;
        }
        if (!instructorId) return [];
        
        return this.courses.filter(c => c.instructorId === instructorId);
    },
    
    // Get course analytics
    async getCourseAnalytics(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return null;
        
        // Get enrollment count from Supabase
        let enrollmentCount = course.enrollmentCount || 0;
        let completionRate = 0;
        let averageRating = course.rating || 0;
        
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    // Get enrollments (users who started the course)
                    const { data: enrollments } = await client
                        .from('user_progress')
                        .select('user_id')
                        .eq('course_id', courseId);
                    
                    if (enrollments) {
                        enrollmentCount = new Set(enrollments.map(e => e.user_id)).size;
                    }
                    
                    // Get completion rate
                    const { data: completions } = await client
                        .from('user_progress')
                        .select('completed')
                        .eq('course_id', courseId);
                    
                    if (completions && completions.length > 0) {
                        const completed = completions.filter(c => c.completed === true).length;
                        completionRate = Math.round((completed / completions.length) * 100);
                    }
                    
                    // Get average rating
                    const { data: reviews } = await client
                        .from('course_reviews')
                        .select('rating')
                        .eq('course_id', courseId);
                    
                    if (reviews && reviews.length > 0) {
                        const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
                        averageRating = (totalRating / reviews.length).toFixed(1);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to fetch analytics from Supabase:', error);
        }
        
        return {
            enrollmentCount,
            completionRate,
            averageRating,
            reviewCount: course.reviewCount || 0,
            modules: course.modules || 0,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        };
    },
    
    // Get student list for course
    async getCourseStudents(courseId) {
        const students = [];
        
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    const { data: progress } = await client
                        .from('user_progress')
                        .select('*')
                        .eq('course_id', courseId);
                    
                    if (progress) {
                        // Group by user_id and get latest progress
                        const userProgress = {};
                        progress.forEach(p => {
                            if (!userProgress[p.user_id] || new Date(p.updated_at) > new Date(userProgress[p.user_id].updated_at)) {
                                userProgress[p.user_id] = p;
                            }
                        });
                        
                        // Get user profiles
                        for (const userId in userProgress) {
                            const { data: profile } = await client
                                .from('profiles')
                                .select('*')
                                .eq('id', userId)
                                .single();
                            
                            students.push({
                                userId: userId,
                                userName: profile?.name || userId,
                                email: userId,
                                progress: userProgress[userId].progress_percentage || 0,
                                completed: userProgress[userId].completed || false,
                                lastActivity: userProgress[userId].updated_at
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to fetch students from Supabase:', error);
        }
        
        return students;
    },
    
    // Save course to Supabase
    async saveCourseToSupabase(course) {
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (!client) return;
                
                await client.from('courses').upsert({
                    id: course.id,
                    instructor_id: course.instructorId,
                    instructor_name: course.instructorName,
                    title: course.title,
                    description: course.description,
                    subtitle: course.subtitle,
                    category: course.category,
                    price: course.price,
                    is_free: course.isFree,
                    thumbnail: course.thumbnail,
                    level: course.level,
                    duration: course.duration,
                    modules: course.modules,
                    modules_data: course.modules_data,
                    is_published: course.isPublished,
                    is_approved: course.isApproved || false,
                    approval_status: course.approvalStatus || 'pending',
                    admin_notes: course.adminNotes || null,
                    approved_by: course.approvedBy || null,
                    approved_at: course.approvedAt || null,
                    enrollment_count: course.enrollmentCount,
                    rating: course.rating,
                    review_count: course.reviewCount,
                    created_at: course.createdAt,
                    updated_at: course.updatedAt
                });
            }
        } catch (error) {
            console.warn('Failed to save course to Supabase:', error);
        }
    },
    
    // Delete course from Supabase
    async deleteCourseFromSupabase(courseId) {
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (!client) return;
                
                await client.from('courses').delete().eq('id', courseId);
            }
        } catch (error) {
            console.warn('Failed to delete course from Supabase:', error);
        }
    },
    
    // Load courses from Supabase
    async loadCoursesFromSupabase(instructorId = null) {
        if (!instructorId && user && user.email) {
            instructorId = user.email;
        }
        if (!instructorId) return;
        
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (!client) return;
                
                let query = client.from('courses').select('*');
                if (instructorId) {
                    query = query.eq('instructor_id', instructorId);
                }
                
                const { data: courses, error } = await query.order('created_at', { ascending: false });
                
                if (!error && courses && courses.length > 0) {
                    courses.forEach(supabaseCourse => {
                        const existingIndex = this.courses.findIndex(c => c.id === supabaseCourse.id);
                        const course = {
                            id: supabaseCourse.id,
                            instructorId: supabaseCourse.instructor_id,
                            instructorName: supabaseCourse.instructor_name,
                            title: supabaseCourse.title,
                            description: supabaseCourse.description,
                            subtitle: supabaseCourse.subtitle,
                            category: supabaseCourse.category,
                            price: supabaseCourse.price,
                            isFree: supabaseCourse.is_free,
                            thumbnail: supabaseCourse.thumbnail,
                            level: supabaseCourse.level,
                            duration: supabaseCourse.duration,
                            modules: supabaseCourse.modules,
                            modules_data: supabaseCourse.modules_data,
                            isPublished: supabaseCourse.is_published,
                            isApproved: supabaseCourse.is_approved,
                            approvalStatus: supabaseCourse.approval_status,
                            adminNotes: supabaseCourse.admin_notes,
                            approvedBy: supabaseCourse.approved_by,
                            approvedAt: supabaseCourse.approved_at,
                            enrollmentCount: supabaseCourse.enrollment_count,
                            rating: supabaseCourse.rating,
                            reviewCount: supabaseCourse.review_count,
                            createdAt: supabaseCourse.created_at,
                            updatedAt: supabaseCourse.updated_at
                        };
                        
                        if (existingIndex >= 0) {
                            this.courses[existingIndex] = course;
                        } else {
                            this.courses.push(course);
                        }
                    });
                    this.saveCourses();
                }
            }
        } catch (error) {
            console.warn('Failed to load courses from Supabase:', error);
        }
    },
    
    // Save to localStorage
    saveCourses() {
        localStorage.setItem('instructor_courses', JSON.stringify(this.courses));
    },
    
    // Initialize
    async init() {
        if (this.isInstructor()) {
            await this.loadCoursesFromSupabase();
        }
    }
};

// Render instructor dashboard
function renderInstructorDashboard() {
    if (!InstructorDashboard.isInstructor()) {
        // Show "Become an Instructor" option
        const container = document.getElementById('instructorDashboard');
        if (!container) return;
        
        container.innerHTML = `
            <div class="instructor-onboarding">
                <h2>🎓 Become an Instructor</h2>
                <p>Create and manage your own courses on the platform.</p>
                <button class="btn btn-primary" onclick="becomeInstructor()">Become an Instructor</button>
            </div>
        `;
        return;
    }
    
    const container = document.getElementById('instructorDashboard');
    if (!container) return;
    
    const courses = InstructorDashboard.getInstructorCourses();
    
    container.innerHTML = `
        <div class="instructor-dashboard">
            <div class="dashboard-header">
                <h1>🎓 Instructor Dashboard</h1>
                <button class="btn btn-primary" onclick="openCreateCourseForm()">
                    + Create New Course
                </button>
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-value">${courses.length}</div>
                    <div class="stat-label">Total Courses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${courses.filter(c => c.isPublished).length}</div>
                    <div class="stat-label">Published</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${courses.length > 0 ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1) : '0'}</div>
                    <div class="stat-label">Avg Rating</div>
                </div>
            </div>
            
            <div class="courses-list">
                <h2>My Courses</h2>
                ${courses.length === 0 
                    ? '<div class="no-courses"><p>You haven\'t created any courses yet.</p><button class="btn btn-primary" onclick="openCreateCourseForm()">Create Your First Course</button></div>'
                    : courses.map(course => renderCourseCard(course)).join('')
                }
            </div>
        </div>
    `;
}

function renderCourseCard(course) {
    return `
        <div class="course-card">
            <div class="course-card-header">
                <div class="course-info">
                    <h3>${SecurityUtils.escapeHTML(course.title)}</h3>
                    <p class="course-meta">
                        ${course.approvalStatus === 'approved' 
                            ? '<span class="badge badge-success">✅ Approved</span>' 
                            : course.approvalStatus === 'rejected' 
                            ? '<span class="badge badge-danger">❌ Rejected</span>' 
                            : '<span class="badge badge-warning">⏳ Pending Approval</span>'}
                        ${course.isPublished ? '<span class="badge badge-info">Published</span>' : '<span class="badge badge-secondary">Draft</span>'}
                        <span>•</span>
                        <span>${course.modules || 0} modules</span>
                        <span>•</span>
                        <span>${course.enrollmentCount || 0} students</span>
                        ${course.rating > 0 ? `<span>•</span><span>⭐ ${course.rating.toFixed(1)}</span>` : ''}
                    </p>
                    ${course.approvalStatus === 'rejected' && course.adminNotes ? `
                        <div class="rejection-notice">
                            <strong>Rejection Reason:</strong> ${SecurityUtils.escapeHTML(course.adminNotes)}
                        </div>
                    ` : ''}
                </div>
                <div class="course-actions">
                    <button class="btn btn-secondary" onclick="editCourse('${course.id}')">Edit</button>
                    <button class="btn btn-secondary" onclick="viewCourseStudents('${course.id}')">Students</button>
                    <button class="btn btn-secondary" onclick="viewCourseAnalytics('${course.id}')">Analytics</button>
                    <button class="btn btn-danger" onclick="deleteCourseConfirm('${course.id}')">Delete</button>
                </div>
            </div>
            <div class="course-description">
                ${SecurityUtils.escapeHTML(course.description || '').substring(0, 200)}${course.description && course.description.length > 200 ? '...' : ''}
            </div>
        </div>
    `;
}

function becomeInstructor() {
    if (!user || !user.email) {
        alert('Please sign in first');
        return;
    }
    
    if (confirm('Become an instructor? You\'ll be able to create and manage courses.')) {
        InstructorDashboard.makeInstructor().then(() => {
            renderInstructorDashboard();
        });
    }
}

function openCreateCourseForm() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'createCourseModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2>Create New Course</h2>
                <button class="close-btn" onclick="closeCreateCourseModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="createCourseForm" onsubmit="submitCreateCourse(event)">
                    <div class="form-group">
                        <label>Course Title *</label>
                        <input type="text" id="courseTitle" placeholder="e.g., Introduction to Python" required>
                    </div>
                    <div class="form-group">
                        <label>Subtitle</label>
                        <input type="text" id="courseSubtitle" placeholder="A brief description">
                    </div>
                    <div class="form-group">
                        <label>Description *</label>
                        <textarea id="courseDescription" rows="5" placeholder="Describe what students will learn..." required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Category</label>
                            <select id="courseCategory">
                                <option value="general">General</option>
                                <option value="programming">Programming</option>
                                <option value="design">Design</option>
                                <option value="business">Business</option>
                                <option value="science">Science</option>
                                <option value="language">Language</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Level</label>
                            <select id="courseLevel">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Duration</label>
                            <input type="text" id="courseDuration" placeholder="e.g., 8 weeks" value="8 weeks">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Price ($)</label>
                            <input type="number" id="coursePrice" min="0" step="0.01" value="0" placeholder="0 for free">
                        </div>
                        <div class="form-group">
                            <label>Number of Modules</label>
                            <input type="number" id="courseModules" min="1" value="8">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Thumbnail URL (optional)</label>
                        <input type="url" id="courseThumbnail" placeholder="https://example.com/image.jpg">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeCreateCourseModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Course</button>
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

function submitCreateCourse(event) {
    event.preventDefault();
    
    const courseData = {
        title: document.getElementById('courseTitle').value.trim(),
        subtitle: document.getElementById('courseSubtitle').value.trim(),
        description: document.getElementById('courseDescription').value.trim(),
        category: document.getElementById('courseCategory').value,
        level: document.getElementById('courseLevel').value,
        duration: document.getElementById('courseDuration').value.trim(),
        price: parseFloat(document.getElementById('coursePrice').value) || 0,
        modules: parseInt(document.getElementById('courseModules').value) || 8,
        thumbnail: document.getElementById('courseThumbnail').value.trim(),
        isPublished: false
    };
    
    try {
        const course = InstructorDashboard.createCourse(courseData);
        closeCreateCourseModal();
        
        // Open course editor
        editCourse(course.id);
    } catch (error) {
        alert(error.message || 'Failed to create course');
    }
}

function closeCreateCourseModal() {
    const modal = document.getElementById('createCourseModal');
    if (modal) {
        modal.remove();
    }
}

function editCourse(courseId) {
    const course = InstructorDashboard.courses.find(c => c.id === courseId);
    if (!course) {
        alert('Course not found');
        return;
    }
    
    InstructorDashboard.currentView = 'edit-course';
    InstructorDashboard.currentCourseId = courseId;
    
    renderCourseEditor(course);
}

function renderCourseEditor(course) {
    const container = document.getElementById('instructorDashboard');
    if (!container) return;
    
    container.innerHTML = `
        <div class="course-editor">
            <div class="editor-header">
                <button class="btn btn-secondary" onclick="renderInstructorDashboard()">← Back to Dashboard</button>
                <h1>Edit Course: ${SecurityUtils.escapeHTML(course.title)}</h1>
                <div class="editor-actions">
                    <button class="btn ${course.isPublished ? 'btn-warning' : 'btn-success'}" onclick="toggleCoursePublish('${course.id}')">
                        ${course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                </div>
            </div>
            
            <div class="editor-tabs">
                <button class="tab-btn active" onclick="showEditorTab('details')">Course Details</button>
                <button class="tab-btn" onclick="showEditorTab('modules')">Modules</button>
                <button class="tab-btn" onclick="showEditorTab('students')">Students</button>
                <button class="tab-btn" onclick="showEditorTab('analytics')">Analytics</button>
            </div>
            
            <div id="editorContent" class="editor-content">
                ${renderCourseDetailsTab(course)}
            </div>
        </div>
    `;
}

function renderCourseDetailsTab(course) {
    return `
        <div class="editor-tab-content" id="tab-details">
            <form id="editCourseForm" onsubmit="saveCourseDetails(event, '${course.id}')">
                <div class="form-group">
                    <label>Course Title *</label>
                    <input type="text" id="editTitle" value="${SecurityUtils.escapeHTML(course.title)}" required>
                </div>
                <div class="form-group">
                    <label>Subtitle</label>
                    <input type="text" id="editSubtitle" value="${SecurityUtils.escapeHTML(course.subtitle || '')}">
                </div>
                <div class="form-group">
                    <label>Description *</label>
                    <textarea id="editDescription" rows="6" required>${SecurityUtils.escapeHTML(course.description || '')}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="editCategory">
                            <option value="general" ${course.category === 'general' ? 'selected' : ''}>General</option>
                            <option value="programming" ${course.category === 'programming' ? 'selected' : ''}>Programming</option>
                            <option value="design" ${course.category === 'design' ? 'selected' : ''}>Design</option>
                            <option value="business" ${course.category === 'business' ? 'selected' : ''}>Business</option>
                            <option value="science" ${course.category === 'science' ? 'selected' : ''}>Science</option>
                            <option value="language" ${course.category === 'language' ? 'selected' : ''}>Language</option>
                            <option value="other" ${course.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Level</label>
                        <select id="editLevel">
                            <option value="Beginner" ${course.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                            <option value="Intermediate" ${course.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                            <option value="Advanced" ${course.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" id="editDuration" value="${SecurityUtils.escapeHTML(course.duration || '8 weeks')}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Price ($)</label>
                        <input type="number" id="editPrice" min="0" step="0.01" value="${course.price || 0}">
                    </div>
                    <div class="form-group">
                        <label>Thumbnail URL</label>
                        <input type="url" id="editThumbnail" value="${SecurityUtils.escapeHTML(course.thumbnail || '')}">
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
}

function showEditorTab(tabName) {
    const course = InstructorDashboard.courses.find(c => c.id === InstructorDashboard.currentCourseId);
    if (!course) return;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('editorContent');
    if (!content) return;
    
    if (tabName === 'details') {
        content.innerHTML = renderCourseDetailsTab(course);
    } else if (tabName === 'modules') {
        content.innerHTML = renderModulesTab(course);
    } else if (tabName === 'students') {
        renderStudentsTab(course);
    } else if (tabName === 'analytics') {
        renderAnalyticsTab(course);
    }
}

function renderModulesTab(course) {
    const modules = course.modules_data || [];
    
    return `
        <div class="editor-tab-content" id="tab-modules">
            <div class="modules-editor">
                <div class="modules-list">
                    ${modules.length === 0 
                        ? '<div class="no-modules"><p>No modules yet. Add your first module below.</p></div>'
                        : modules.map((module, index) => renderModuleEditorItem(module, index)).join('')
                    }
                </div>
                <button class="btn btn-primary" onclick="addNewModule('${course.id}')">+ Add Module</button>
            </div>
        </div>
    `;
}

function renderModuleEditorItem(module, index) {
    return `
        <div class="module-editor-item">
            <div class="module-editor-header">
                <h3>Module ${module.id}: ${SecurityUtils.escapeHTML(module.title || 'Untitled')}</h3>
                <div class="module-actions">
                    <button class="btn-small" onclick="editModuleDetails('${InstructorDashboard.currentCourseId}', ${index})">Edit</button>
                    <button class="btn-small btn-danger" onclick="deleteModule('${InstructorDashboard.currentCourseId}', ${index})">Delete</button>
                </div>
            </div>
            <div class="module-editor-content">
                <p><strong>Subtitle:</strong> ${SecurityUtils.escapeHTML(module.subtitle || '')}</p>
                ${module.videoId ? `<p><strong>Video:</strong> YouTube ID: ${module.videoId}</p>` : '<p>No video</p>'}
            </div>
        </div>
    `;
}

function addNewModule(courseId) {
    const course = InstructorDashboard.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const modules = course.modules_data || [];
    const newModule = {
        id: modules.length + 1,
        title: `Module ${modules.length + 1}`,
        subtitle: '',
        videoId: null
    };
    
    modules.push(newModule);
    InstructorDashboard.updateCourse(courseId, { modules_data: modules });
    
    // Refresh modules tab
    showEditorTab('modules');
}

function editModuleDetails(courseId, moduleIndex) {
    const course = InstructorDashboard.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const module = course.modules_data[moduleIndex];
    if (!module) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'editModuleModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Edit Module ${module.id}</h2>
                <button class="close-btn" onclick="closeEditModuleModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editModuleForm" onsubmit="saveModuleDetails(event, '${courseId}', ${moduleIndex})">
                    <div class="form-group">
                        <label>Module Title *</label>
                        <input type="text" id="moduleTitle" value="${SecurityUtils.escapeHTML(module.title || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Subtitle</label>
                        <input type="text" id="moduleSubtitle" value="${SecurityUtils.escapeHTML(module.subtitle || '')}">
                    </div>
                    <div class="form-group">
                        <label>YouTube Video ID (optional)</label>
                        <input type="text" id="moduleVideoId" value="${module.videoId || ''}" placeholder="e.g., dQw4w9WgXcQ">
                        <small>Just the video ID, not the full URL</small>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeEditModuleModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Module</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function saveModuleDetails(event, courseId, moduleIndex) {
    event.preventDefault();
    
    const course = InstructorDashboard.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const modules = course.modules_data || [];
    const module = modules[moduleIndex];
    
    module.title = document.getElementById('moduleTitle').value.trim();
    module.subtitle = document.getElementById('moduleSubtitle').value.trim();
    const videoId = document.getElementById('moduleVideoId').value.trim();
    module.videoId = videoId || null;
    
    InstructorDashboard.updateCourse(courseId, { modules_data: modules });
    
    closeEditModuleModal();
    showEditorTab('modules');
}

function closeEditModuleModal() {
    const modal = document.getElementById('editModuleModal');
    if (modal) {
        modal.remove();
    }
}

function deleteModule(courseId, moduleIndex) {
    if (!confirm('Delete this module?')) return;
    
    const course = InstructorDashboard.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const modules = course.modules_data || [];
    modules.splice(moduleIndex, 1);
    
    // Renumber modules
    modules.forEach((m, i) => {
        m.id = i + 1;
    });
    
    InstructorDashboard.updateCourse(courseId, { modules_data: modules });
    showEditorTab('modules');
}

function saveCourseDetails(event, courseId) {
    event.preventDefault();
    
    const updates = {
        title: document.getElementById('editTitle').value.trim(),
        subtitle: document.getElementById('editSubtitle').value.trim(),
        description: document.getElementById('editDescription').value.trim(),
        category: document.getElementById('editCategory').value,
        level: document.getElementById('editLevel').value,
        duration: document.getElementById('editDuration').value.trim(),
        price: parseFloat(document.getElementById('editPrice').value) || 0,
        thumbnail: document.getElementById('editThumbnail').value.trim()
    };
    
    try {
        InstructorDashboard.updateCourse(courseId, updates);
        alert('Course updated successfully!');
        
        // Refresh editor
        const course = InstructorDashboard.courses.find(c => c.id === courseId);
        if (course) {
            renderCourseEditor(course);
        }
    } catch (error) {
        alert(error.message || 'Failed to update course');
    }
}

function toggleCoursePublish(courseId) {
    const course = InstructorDashboard.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const newStatus = !course.isPublished;
    
    if (newStatus && (!course.modules_data || course.modules_data.length === 0)) {
        alert('Please add at least one module before publishing');
        return;
    }
    
    // If publishing, set status to pending approval
    if (newStatus && course.approvalStatus !== 'approved') {
        InstructorDashboard.updateCourse(courseId, { 
            isPublished: newStatus,
            approvalStatus: 'pending',
            isApproved: false
        });
        alert('Course submitted for admin approval. You will be notified once it\'s reviewed.');
    } else {
        InstructorDashboard.updateCourse(courseId, { isPublished: newStatus });
    }
    
    // Refresh editor
    renderCourseEditor(InstructorDashboard.courses.find(c => c.id === courseId));
}

async function renderStudentsTab(course) {
    const content = document.getElementById('editorContent');
    if (!content) return;
    
    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading students...</p></div>';
    
    const students = await InstructorDashboard.getCourseStudents(course.id);
    
    content.innerHTML = `
        <div class="editor-tab-content" id="tab-students">
            <h2>Enrolled Students (${students.length})</h2>
            ${students.length === 0 
                ? '<div class="no-data"><p>No students enrolled yet.</p></div>'
                : `
                    <table class="students-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>Last Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => `
                                <tr>
                                    <td>${SecurityUtils.escapeHTML(student.userName)}</td>
                                    <td>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${student.progress}%"></div>
                                        </div>
                                        <span>${student.progress}%</span>
                                    </td>
                                    <td>${student.completed ? '<span class="badge badge-success">Completed</span>' : '<span class="badge badge-warning">In Progress</span>'}</td>
                                    <td>${new Date(student.lastActivity).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `
            }
        </div>
    `;
}

async function renderAnalyticsTab(course) {
    const content = document.getElementById('editorContent');
    if (!content) return;
    
    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading analytics...</p></div>';
    
    const analytics = await InstructorDashboard.getCourseAnalytics(course.id);
    
    content.innerHTML = `
        <div class="editor-tab-content" id="tab-analytics">
            <h2>Course Analytics</h2>
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="analytics-value">${analytics.enrollmentCount}</div>
                    <div class="analytics-label">Total Enrollments</div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-value">${analytics.completionRate}%</div>
                    <div class="analytics-label">Completion Rate</div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-value">${analytics.averageRating}</div>
                    <div class="analytics-label">Average Rating</div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-value">${analytics.reviewCount}</div>
                    <div class="analytics-label">Total Reviews</div>
                </div>
            </div>
            <div class="analytics-info">
                <p><strong>Created:</strong> ${new Date(course.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> ${new Date(course.updatedAt).toLocaleDateString()}</p>
                <p><strong>Modules:</strong> ${analytics.modules}</p>
            </div>
        </div>
    `;
}

function viewCourseStudents(courseId) {
    editCourse(courseId);
    setTimeout(() => {
        showEditorTab('students');
    }, 100);
}

function viewCourseAnalytics(courseId) {
    editCourse(courseId);
    setTimeout(() => {
        showEditorTab('analytics');
    }, 100);
}

function deleteCourseConfirm(courseId) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        return;
    }
    
    try {
        InstructorDashboard.deleteCourse(courseId);
        renderInstructorDashboard();
    } catch (error) {
        alert(error.message || 'Failed to delete course');
    }
}

// Global functions
window.InstructorDashboard = InstructorDashboard;
window.renderInstructorDashboard = renderInstructorDashboard;
window.becomeInstructor = becomeInstructor;
window.openCreateCourseForm = openCreateCourseForm;
window.submitCreateCourse = submitCreateCourse;
window.closeCreateCourseModal = closeCreateCourseModal;
window.editCourse = editCourse;
window.showEditorTab = showEditorTab;
window.saveCourseDetails = saveCourseDetails;
window.toggleCoursePublish = toggleCoursePublish;
window.addNewModule = addNewModule;
window.editModuleDetails = editModuleDetails;
window.saveModuleDetails = saveModuleDetails;
window.closeEditModuleModal = closeEditModuleModal;
window.deleteModule = deleteModule;
window.viewCourseStudents = viewCourseStudents;
window.viewCourseAnalytics = viewCourseAnalytics;
window.deleteCourseConfirm = deleteCourseConfirm;

