// Admin Dashboard System
// Course approval, user management, and admin actions

const AdminDashboard = {
    // Check if user is admin
    isAdmin(userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        // Check localStorage first
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        if (admins.includes(userId)) return true;
        
        // Check Supabase
        // For now, we'll use localStorage. Can be enhanced with Supabase roles
        return false;
    },
    
    // Make user an admin
    async makeAdmin(userId = null) {
        if (!userId && user && user.email) {
            userId = user.email;
        }
        if (!userId) return false;
        
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        if (!admins.includes(userId)) {
            admins.push(userId);
            localStorage.setItem('admins', JSON.stringify(admins));
        }
        
        // Save to Supabase if available
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    await client.from('profiles').upsert({
                        id: userId,
                        is_admin: true
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to save admin status to Supabase:', error);
        }
        
        // Log admin action
        this.logAdminAction('make_admin', userId, `Made ${userId} an admin`);
        
        return true;
    },
    
    // Get pending courses (awaiting approval)
    async getPendingCourses() {
        let pendingCourses = [];
        
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    const { data: courses, error } = await client
                        .from('courses')
                        .select('*')
                        .eq('approval_status', 'pending')
                        .order('created_at', { ascending: false });
                    
                    if (!error && courses) {
                        pendingCourses = courses.map(c => ({
                            id: c.id,
                            instructorId: c.instructor_id,
                            instructorName: c.instructor_name,
                            title: c.title,
                            description: c.description,
                            subtitle: c.subtitle,
                            category: c.category,
                            price: c.price,
                            isFree: c.is_free,
                            thumbnail: c.thumbnail,
                            level: c.level,
                            duration: c.duration,
                            modules: c.modules,
                            modules_data: c.modules_data,
                            isPublished: c.is_published,
                            isApproved: c.is_approved,
                            approvalStatus: c.approval_status,
                            adminNotes: c.admin_notes,
                            approvedBy: c.approved_by,
                            approvedAt: c.approved_at,
                            createdAt: c.created_at,
                            updatedAt: c.updated_at
                        }));
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to fetch pending courses from Supabase:', error);
        }
        
        // Also check localStorage courses
        if (typeof InstructorDashboard !== 'undefined') {
            const localCourses = InstructorDashboard.courses || [];
            const localPending = localCourses.filter(c => 
                c.approvalStatus === 'pending' || (!c.isApproved && c.isPublished)
            );
            pendingCourses = [...pendingCourses, ...localPending];
        }
        
        return pendingCourses;
    },
    
    // Approve course
    async approveCourse(courseId, adminNotes = '') {
        if (!this.isAdmin()) {
            throw new Error('Only admins can approve courses');
        }
        
        const updates = {
            isApproved: true,
            approvalStatus: 'approved',
            adminNotes: adminNotes,
            approvedBy: user.email,
            approvedAt: new Date().toISOString()
        };
        
        // Update in Supabase
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    await client.from('courses').update({
                        is_approved: true,
                        approval_status: 'approved',
                        admin_notes: adminNotes,
                        approved_by: user.email,
                        approved_at: new Date().toISOString()
                    }).eq('id', courseId);
                }
            }
        } catch (error) {
            console.warn('Failed to approve course in Supabase:', error);
        }
        
        // Update in InstructorDashboard if exists
        if (typeof InstructorDashboard !== 'undefined') {
            try {
                InstructorDashboard.updateCourse(courseId, updates);
            } catch (error) {
                console.warn('Failed to update course in InstructorDashboard:', error);
            }
        }
        
        // Log admin action
        this.logAdminAction('approve_course', courseId, `Approved course: ${courseId}`);
        
        return true;
    },
    
    // Reject course
    async rejectCourse(courseId, adminNotes = '') {
        if (!this.isAdmin()) {
            throw new Error('Only admins can reject courses');
        }
        
        if (!adminNotes || adminNotes.trim().length < 10) {
            throw new Error('Please provide a reason for rejection (at least 10 characters)');
        }
        
        const updates = {
            isApproved: false,
            approvalStatus: 'rejected',
            adminNotes: adminNotes,
            approvedBy: user.email,
            approvedAt: new Date().toISOString()
        };
        
        // Update in Supabase
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    await client.from('courses').update({
                        is_approved: false,
                        approval_status: 'rejected',
                        admin_notes: adminNotes,
                        approved_by: user.email,
                        approved_at: new Date().toISOString()
                    }).eq('id', courseId);
                }
            }
        } catch (error) {
            console.warn('Failed to reject course in Supabase:', error);
        }
        
        // Update in InstructorDashboard if exists
        if (typeof InstructorDashboard !== 'undefined') {
            try {
                InstructorDashboard.updateCourse(courseId, updates);
            } catch (error) {
                console.warn('Failed to update course in InstructorDashboard:', error);
            }
        }
        
        // Log admin action
        this.logAdminAction('reject_course', courseId, `Rejected course: ${courseId}. Reason: ${adminNotes}`);
        
        return true;
    },
    
    // Log admin action
    async logAdminAction(actionType, targetId, notes = '') {
        if (!this.isAdmin()) return;
        
        const action = {
            adminId: user.email,
            actionType: actionType,
            targetId: targetId,
            notes: notes,
            createdAt: new Date().toISOString()
        };
        
        // Save to Supabase
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    await client.from('admin_actions').insert({
                        admin_id: user.email,
                        action_type: actionType,
                        target_id: targetId,
                        notes: notes
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to log admin action to Supabase:', error);
        }
        
        // Save to localStorage
        const actions = JSON.parse(localStorage.getItem('admin_actions') || '[]');
        actions.push(action);
        localStorage.setItem('admin_actions', JSON.stringify(actions.slice(-100))); // Keep last 100
    },
    
    // Get admin actions log
    async getAdminActions(limit = 50) {
        const actions = [];
        
        try {
            if (typeof SupabaseManager !== 'undefined') {
                const client = await SupabaseManager.init();
                if (client) {
                    const { data, error } = await client
                        .from('admin_actions')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(limit);
                    
                    if (!error && data) {
                        return data.map(a => ({
                            id: a.id,
                            adminId: a.admin_id,
                            actionType: a.action_type,
                            targetId: a.target_id,
                            notes: a.notes,
                            createdAt: a.created_at
                        }));
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to fetch admin actions from Supabase:', error);
        }
        
        // Fallback to localStorage
        const localActions = JSON.parse(localStorage.getItem('admin_actions') || '[]');
        return localActions.slice(-limit).reverse();
    }
};

// Render admin dashboard
function renderAdminDashboard() {
    if (!AdminDashboard.isAdmin()) {
        const container = document.getElementById('adminDashboard');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-onboarding">
                <h2>🔐 Admin Access Required</h2>
                <p>You need admin privileges to access this dashboard.</p>
                <p style="color: var(--text-light); font-size: 0.9rem;">Contact an existing admin to grant you access.</p>
            </div>
        `;
        return;
    }
    
    const container = document.getElementById('adminDashboard');
    if (!container) return;
    
    AdminDashboard.getPendingCourses().then(pendingCourses => {
        container.innerHTML = `
            <div class="admin-dashboard">
                <div class="dashboard-header">
                    <h1>🔐 Admin Dashboard</h1>
                    <div class="admin-tabs">
                        <button class="tab-btn active" onclick="showAdminTab('pending')">Pending Courses (${pendingCourses.length})</button>
                        <button class="tab-btn" onclick="showAdminTab('users')">User Management</button>
                        <button class="tab-btn" onclick="showAdminTab('actions')">Action Log</button>
                    </div>
                </div>
                
                <div id="adminContent" class="admin-content">
                    ${renderPendingCoursesTab(pendingCourses)}
                </div>
            </div>
        `;
    });
}

function renderPendingCoursesTab(pendingCourses) {
    if (pendingCourses.length === 0) {
        return `
            <div class="admin-tab-content" id="tab-pending">
                <div class="no-pending">
                    <h2>✅ No Pending Courses</h2>
                    <p>All courses have been reviewed.</p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="admin-tab-content" id="tab-pending">
            <h2>Pending Course Approvals (${pendingCourses.length})</h2>
            <div class="pending-courses-list">
                ${pendingCourses.map(course => renderPendingCourseCard(course)).join('')}
            </div>
        </div>
    `;
}

function renderPendingCourseCard(course) {
    return `
        <div class="pending-course-card">
            <div class="course-preview">
                <h3>${SecurityUtils.escapeHTML(course.title)}</h3>
                <p class="course-instructor">By: ${SecurityUtils.escapeHTML(course.instructorName || course.instructorId)}</p>
                <p class="course-description">${SecurityUtils.escapeHTML(course.description || '').substring(0, 200)}${course.description && course.description.length > 200 ? '...' : ''}</p>
                <div class="course-meta">
                    <span>📚 ${course.modules || 0} modules</span>
                    <span>•</span>
                    <span>${course.level || 'Beginner'}</span>
                    <span>•</span>
                    <span>${course.isFree ? 'Free' : `$${course.price}`}</span>
                    <span>•</span>
                    <span>Created: ${new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="course-actions-admin">
                <div class="approval-form">
                    <textarea id="adminNotes-${course.id}" rows="3" placeholder="Add notes (required for rejection)"></textarea>
                    <div class="approval-buttons">
                        <button class="btn btn-success" onclick="approveCourse('${course.id}')">✅ Approve</button>
                        <button class="btn btn-danger" onclick="rejectCourse('${course.id}')">❌ Reject</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    if (tabName === 'pending') {
        AdminDashboard.getPendingCourses().then(pendingCourses => {
            content.innerHTML = renderPendingCoursesTab(pendingCourses);
        });
    } else if (tabName === 'users') {
        content.innerHTML = renderUsersTab();
    } else if (tabName === 'actions') {
        AdminDashboard.getAdminActions().then(actions => {
            content.innerHTML = renderActionsTab(actions);
        });
    }
}

function renderUsersTab() {
    return `
        <div class="admin-tab-content" id="tab-users">
            <h2>User Management</h2>
            <div class="user-management">
                <div class="make-admin-section">
                    <h3>Make User Admin</h3>
                    <div class="form-group">
                        <input type="email" id="newAdminEmail" placeholder="User email address">
                        <button class="btn btn-primary" onclick="makeUserAdmin()">Make Admin</button>
                    </div>
                </div>
                <div class="make-instructor-section">
                    <h3>Make User Instructor</h3>
                    <div class="form-group">
                        <input type="email" id="newInstructorEmail" placeholder="User email address">
                        <button class="btn btn-primary" onclick="makeUserInstructor()">Make Instructor</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderActionsTab(actions) {
    return `
        <div class="admin-tab-content" id="tab-actions">
            <h2>Admin Action Log</h2>
            <div class="actions-list">
                ${actions.length === 0 
                    ? '<div class="no-actions"><p>No actions logged yet.</p></div>'
                    : actions.map(action => `
                        <div class="action-item">
                            <div class="action-header">
                                <span class="action-type">${action.actionType}</span>
                                <span class="action-date">${new Date(action.createdAt).toLocaleString()}</span>
                            </div>
                            <div class="action-details">
                                <p><strong>Admin:</strong> ${SecurityUtils.escapeHTML(action.adminId)}</p>
                                <p><strong>Target:</strong> ${SecurityUtils.escapeHTML(action.targetId || 'N/A')}</p>
                                ${action.notes ? `<p><strong>Notes:</strong> ${SecurityUtils.escapeHTML(action.notes)}</p>` : ''}
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
}

function approveCourse(courseId) {
    const notesInput = document.getElementById(`adminNotes-${courseId}`);
    const notes = notesInput ? notesInput.value.trim() : '';
    
    AdminDashboard.approveCourse(courseId, notes).then(() => {
        alert('Course approved successfully!');
        renderAdminDashboard();
    }).catch(error => {
        alert(error.message || 'Failed to approve course');
    });
}

function rejectCourse(courseId) {
    const notesInput = document.getElementById(`adminNotes-${courseId}`);
    const notes = notesInput ? notesInput.value.trim() : '';
    
    if (!notes || notes.length < 10) {
        alert('Please provide a reason for rejection (at least 10 characters)');
        return;
    }
    
    if (!confirm('Are you sure you want to reject this course?')) {
        return;
    }
    
    AdminDashboard.rejectCourse(courseId, notes).then(() => {
        alert('Course rejected.');
        renderAdminDashboard();
    }).catch(error => {
        alert(error.message || 'Failed to reject course');
    });
}

function makeUserAdmin() {
    const email = document.getElementById('newAdminEmail').value.trim();
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    if (confirm(`Make ${email} an admin?`)) {
        AdminDashboard.makeAdmin(email).then(() => {
            alert('User is now an admin');
            document.getElementById('newAdminEmail').value = '';
        }).catch(error => {
            alert(error.message || 'Failed to make user admin');
        });
    }
}

function makeUserInstructor() {
    const email = document.getElementById('newInstructorEmail').value.trim();
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    if (confirm(`Make ${email} an instructor?`)) {
        if (typeof InstructorDashboard !== 'undefined') {
            InstructorDashboard.makeInstructor(email).then(() => {
                alert('User is now an instructor');
                document.getElementById('newInstructorEmail').value = '';
            }).catch(error => {
                alert(error.message || 'Failed to make user instructor');
            });
        } else {
            alert('InstructorDashboard not available');
        }
    }
}

function openAdminDashboard() {
    if (!user || !user.email) {
        alert('Please sign in first');
        return;
    }
    
    // Hide main content and show admin dashboard
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <div class="admin-dashboard-container">
            <div id="adminDashboard"></div>
        </div>
    `;
    
    // Initialize and render dashboard
    if (typeof AdminDashboard !== 'undefined') {
        renderAdminDashboard();
    }
}

// Global functions
window.AdminDashboard = AdminDashboard;
window.renderAdminDashboard = renderAdminDashboard;
window.showAdminTab = showAdminTab;
window.approveCourse = approveCourse;
window.rejectCourse = rejectCourse;
window.makeUserAdmin = makeUserAdmin;
window.makeUserInstructor = makeUserInstructor;
window.openAdminDashboard = openAdminDashboard;

