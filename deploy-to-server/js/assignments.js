// Assignment System for School 2
// Upload assignments and AI grading

const AssignmentManager = {
    assignments: JSON.parse(localStorage.getItem('assignments') || '[]'),
    submissions: JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]'),
    
    // Get assignments for a module
    getAssignmentsForModule(moduleId) {
        return this.assignments.filter(a => a.moduleId === moduleId);
    },
    
    // Get user's submissions
    getUserSubmissions(userEmail = null) {
        if (!userEmail) userEmail = user ? user.email : null;
        if (!userEmail) return [];
        return this.submissions.filter(s => s.studentEmail === userEmail);
    },
    
    // Submit assignment
    async submitAssignment(assignmentId, submissionData) {
        if (!user || !user.email) {
            alert('Please sign in to submit assignments.');
            return false;
        }
        
        // Check if there's an existing submission (for resubmission)
        const existingSubmissionIndex = this.submissions.findIndex(s => 
            s.assignmentId === assignmentId && s.studentEmail === user.email
        );
        
        const isResubmission = existingSubmissionIndex !== -1;
        
        const submission = {
            id: isResubmission ? this.submissions[existingSubmissionIndex].id : `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            assignmentId: assignmentId,
            studentEmail: user.email,
            studentName: user.name,
            content: SecurityUtils.sanitizeText(submissionData.content || ''),
            fileUrl: submissionData.fileUrl || null,
            fileName: submissionData.fileName || null,
            submittedAt: new Date().toISOString(),
            status: 'submitted', // submitted, grading, graded, returned
            grade: null,
            feedback: null,
            gradedAt: null,
            isResubmission: isResubmission,
            previousGrade: isResubmission ? this.submissions[existingSubmissionIndex].grade : null
        };
        
        if (isResubmission) {
            // Update existing submission
            this.submissions[existingSubmissionIndex] = submission;
        } else {
            // Add new submission
            this.submissions.push(submission);
        }
        
        this.saveSubmissions();
        
        // Auto-grade with AI (simulated)
        await this.gradeAssignment(submission.id);
        
        return submission;
    },
    
    // Grade assignment with AI
    async gradeAssignment(submissionId) {
        const submission = this.submissions.find(s => s.id === submissionId);
        if (!submission) return;
        
        // Update status to grading
        submission.status = 'grading';
        this.saveSubmissions();
        
        // Simulate AI grading (in production, call OpenAI/Claude API)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate AI feedback using OpenAI
        const feedback = await this.generateAIFeedback(submission);
        const grade = this.extractGradeFromFeedback(feedback);
        
        submission.status = 'graded';
        submission.grade = grade;
        submission.feedback = feedback;
        submission.gradedAt = new Date().toISOString();
        
        this.saveSubmissions();
        
        // Trigger UI update
        if (window.updateAssignmentStatus) {
            window.updateAssignmentStatus(submissionId);
        }
    },
    
    // Generate AI feedback using OpenAI API
    async generateAIFeedback(submission) {
        const assignment = this.assignments.find(a => a.id === submission.assignmentId);
        const content = submission.content || '';
        
        try {
            // Get assignment context
            const assignmentContext = assignment ? {
                title: assignment.title,
                description: assignment.description,
                moduleId: assignment.moduleId
            } : {};
            
            // Find module content for context
            let moduleContent = '';
            if (assignment) {
                for (const course of courses) {
                    const module = course.modules_data?.find(m => m.id === assignment.moduleId);
                    if (module) {
                        moduleContent = module.subtitle || '';
                        break;
                    }
                }
            }
            
            const currentLang = window.i18n ? window.i18n.currentLanguage : 'en';
            const langInstruction = currentLang === 'el' ? 'Respond ONLY in Greek (Ελληνικά). Use Greek language for all feedback, comments, and explanations.' : 'Respond in English.';
            
            const systemPrompt = `You are an expert educator grading student assignments. Provide constructive, detailed feedback and assign a fair grade (0-100).

IMPORTANT: ${langInstruction}

Assignment: ${assignmentContext.title || 'General Assignment'}
Description: ${assignmentContext.description || 'N/A'}
Module Context: ${moduleContent || 'N/A'}

Student Submission:
${content}

Provide feedback in this format:
**Assignment Review**

**Strengths:**
[List 2-3 specific strengths]

**Areas for Improvement:**
[List 2-3 specific suggestions]

**Grade:** [Score out of 100]

**Overall Feedback:**
[1-2 sentence summary]

Be encouraging but honest. Focus on learning outcomes and understanding.`;

            const aiFeedback = await AIConfig.callOpenAIAPI([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Please grade this assignment and provide feedback:\n\n${content}` }
            ], {
                temperature: 0.7,
                max_tokens: 800
            });
            
            return aiFeedback.trim();
        } catch (error) {
            console.error('AI grading error:', error);
            // Fallback to basic feedback
            return this.generateFallbackFeedback(submission);
        }
    },
    
    // Fallback feedback if API fails
    generateFallbackFeedback(submission) {
        const content = submission.content || '';
        const wordCount = content.split(/\s+/).length;
        
        let feedback = `**Assignment Review**\n\n`;
        
        if (wordCount < 100) {
            feedback += `⚠️ Your submission is quite brief (${wordCount} words). Consider expanding your thoughts.\n\n`;
        } else if (wordCount > 500) {
            feedback += `✅ Good length (${wordCount} words). Well-developed response.\n\n`;
        } else {
            feedback += `✅ Adequate length (${wordCount} words).\n\n`;
        }
        
        const keywords = ['argument', 'logic', 'reasoning', 'evidence', 'conclusion', 'premise'];
        const foundKeywords = keywords.filter(kw => content.toLowerCase().includes(kw));
        
        if (foundKeywords.length > 0) {
            feedback += `**Strengths:**\n`;
            feedback += `- You've incorporated key concepts: ${foundKeywords.join(', ')}\n`;
            feedback += `- Shows understanding of course material\n\n`;
        }
        
        feedback += `**Suggestions for Improvement:**\n`;
        feedback += `- Provide more specific examples\n`;
        feedback += `- Connect concepts to real-world applications\n\n`;
        
        feedback += `**Overall:** Good effort! Keep practicing and applying the concepts you've learned.`;
        
        return feedback;
    },
    
    // Extract grade from AI feedback
    extractGradeFromFeedback(feedback) {
        // Try to extract grade from feedback (look for "Grade: XX" or "XX/100")
        const gradeMatch = feedback.match(/grade[:\s]+(\d+)/i) || feedback.match(/(\d+)\s*\/\s*100/i);
        if (gradeMatch) {
            return Math.min(100, Math.max(0, parseInt(gradeMatch[1])));
        }
        
        // Fallback: calculate based on content
        return this.calculateFallbackGrade(feedback);
    },
    
    // Calculate fallback grade
    calculateFallbackGrade(feedback) {
        const content = feedback.toLowerCase();
        let score = 70; // Base score
        
        // Positive indicators
        if (content.includes('excellent') || content.includes('outstanding')) score += 15;
        if (content.includes('good') || content.includes('well done')) score += 10;
        if (content.includes('strength')) score += 5;
        
        // Negative indicators
        if (content.includes('needs improvement') || content.includes('lacking')) score -= 10;
        if (content.includes('brief') || content.includes('short')) score -= 5;
        
        return Math.min(100, Math.max(0, Math.round(score)));
    },
    
    // Render assignment submission form
    renderSubmissionForm(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return '';
        
        // Check if there's an existing submission
        const existingSubmission = this.getUserSubmissions().find(s => s.assignmentId === assignmentId);
        const isResubmission = existingSubmission !== undefined;
        
        return `
            <div class="assignment-submission-form">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">${isResubmission ? (window.i18n ? window.i18n.t('resubmitAssignment') : 'Resubmit Assignment') : (window.i18n ? window.i18n.t('submitAssignment') : 'Submit Assignment')}: ${SecurityUtils.safeRender(assignment.title)}</h3>
                    <button type="button" 
                            class="btn btn-secondary" 
                            id="toggleModuleView_${assignmentId}"
                            onclick="toggleModuleContentView('${assignmentId}', ${assignment.moduleId})"
                            style="display: flex; align-items: center; gap: 0.5rem;">
                        <span>📖</span>
                        <span>${window.i18n ? window.i18n.t('viewModule') || 'View Module' : 'View Module'}</span>
                    </button>
                </div>
                ${isResubmission ? `
                    <div style="padding: 1rem; background: var(--hover-bg); border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid var(--secondary);">
                        <strong>${window.i18n ? window.i18n.t('previousSubmission') : 'Previous Submission'}:</strong>
                        ${existingSubmission.content ? `
                            <div style="margin-top: 0.5rem; white-space: pre-wrap; color: var(--text-light);">${SecurityUtils.safeRender(existingSubmission.content.substring(0, 200))}${existingSubmission.content.length > 200 ? '...' : ''}</div>
                        ` : existingSubmission.fileName ? `
                            <div style="margin-top: 0.5rem; color: var(--text-light);">📎 ${SecurityUtils.safeRender(existingSubmission.fileName)}</div>
                        ` : ''}
                        ${existingSubmission.grade !== null ? `<div style="margin-top: 0.5rem;"><strong>${window.i18n ? window.i18n.t('previousGrade') : 'Previous Grade'}:</strong> ${existingSubmission.grade}%</div>` : ''}
                    </div>
                ` : ''}
                <p style="color: var(--text-light); margin-bottom: 1.5rem;">
                    ${SecurityUtils.safeRender(assignment.description)}
                </p>
                
                <div class="form-group">
                    <label class="form-label">${window.i18n ? window.i18n.t('submissionMethod') : 'Submission Method'}</label>
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.75rem; border: 2px solid var(--border); border-radius: 8px; flex: 1; transition: all 0.2s;" 
                               onmouseover="this.style.borderColor='var(--secondary)'" 
                               onmouseout="this.style.borderColor='var(--border)'">
                            <input type="radio" 
                                   name="submissionMethod_${assignmentId}" 
                                   value="text" 
                                   id="methodText_${assignmentId}"
                                   checked
                                   onchange="toggleSubmissionMethod('${assignmentId}', 'text')"
                                   style="cursor: pointer;">
                            <span>📝 ${window.i18n ? window.i18n.t('writeText') : 'Write Text'}</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.75rem; border: 2px solid var(--border); border-radius: 8px; flex: 1; transition: all 0.2s;"
                               onmouseover="this.style.borderColor='var(--secondary)'" 
                               onmouseout="this.style.borderColor='var(--border)'">
                            <input type="radio" 
                                   name="submissionMethod_${assignmentId}" 
                                   value="file" 
                                   id="methodFile_${assignmentId}"
                                   onchange="toggleSubmissionMethod('${assignmentId}', 'file')"
                                   style="cursor: pointer;">
                            <span>📎 ${window.i18n ? window.i18n.t('uploadFile') : 'Upload File'}</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group" id="textSubmission_${assignmentId}">
                    <label class="form-label">${window.i18n ? window.i18n.t('yourAnswer') : 'Your Answer'}</label>
                    <textarea id="assignmentContent_${assignmentId}" 
                              class="form-input" 
                              rows="10" 
                              placeholder="${window.i18n ? window.i18n.t('writeText') + '...' : 'Write your assignment here...'}"
                              style="min-height: 200px;"></textarea>
                    <small style="color: var(--text-light);">
                        ${window.i18n ? window.i18n.t('minimumWords') : 'Minimum 200 words recommended'}
                    </small>
                </div>
                
                <div class="form-group" id="fileSubmission_${assignmentId}" style="display: none;">
                    <label class="form-label">${window.i18n ? window.i18n.t('chooseFile') : 'Choose File'}</label>
                    <div style="position: relative;">
                        <input type="file" 
                               id="assignmentFile_${assignmentId}" 
                               accept=".pdf,.doc,.docx,.txt,.rtf"
                               onchange="handleFileSelection('${assignmentId}', this)"
                               style="position: absolute; width: 0.1px; height: 0.1px; opacity: 0; overflow: hidden; z-index: -1;">
                        <button type="button" 
                                onclick="document.getElementById('assignmentFile_${assignmentId}').click()"
                                class="btn btn-secondary"
                                style="width: 100%; padding: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;">
                            <span>📎</span>
                            <span>${window.i18n ? window.i18n.t('chooseFile') : 'Choose File'}</span>
                        </button>
                        <div id="fileInfo_${assignmentId}" style="margin-top: 0.5rem; padding: 0.75rem; background: var(--hover-bg); border-radius: 8px; display: none;">
                            <span id="fileName_${assignmentId}" style="font-weight: 600;"></span>
                            <span id="fileSize_${assignmentId}" style="color: var(--text-light); margin-left: 0.5rem;"></span>
                            <button type="button" onclick="clearFileSelection('${assignmentId}')" style="margin-left: 1rem; background: var(--error); color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">${window.i18n ? window.i18n.t('remove') : 'Remove'}</button>
                        </div>
                    </div>
                    <small style="color: var(--text-light);">
                        ${window.i18n ? window.i18n.t('fileAccepted') : 'PDF, Word, or Text files accepted (Max 10MB)'}
                    </small>
                </div>
                
                <div class="btn-group">
                    <button type="button" class="btn btn-secondary" onclick="closeAssignmentSubmission()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="submitAssignment('${assignmentId}')">
                        ${isResubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
                    </button>
                </div>
            </div>
        `;
    },
    
    // Render assignment list
    renderAssignmentsList(moduleId = null) {
        const relevantAssignments = moduleId 
            ? this.getAssignmentsForModule(moduleId)
            : this.assignments;
        
        if (relevantAssignments.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                    <h3>No Assignments</h3>
                    <p style="color: var(--text-light); margin-top: 1rem;">
                        ${moduleId ? 'This module has no assignments yet.' : 'No assignments available.'}
                    </p>
                </div>
            `;
        }
        
        return `
            <div class="assignments-list">
                ${relevantAssignments.map(assignment => {
                    const submission = this.getUserSubmissions().find(s => s.assignmentId === assignment.id);
                    const status = submission ? submission.status : 'not_submitted';
                    const grade = submission ? submission.grade : null;
                    
                    return `
                        <div class="assignment-card">
                            <div class="assignment-header">
                                <h4>${SecurityUtils.safeRender(assignment.title)}</h4>
                                <span class="assignment-status-badge status-${status}">
                                    ${status === 'not_submitted' ? 'Not Submitted' :
                                      status === 'submitted' ? 'Submitted' :
                                      status === 'grading' ? 'Grading...' :
                                      status === 'graded' ? `Graded: ${grade}%` : status}
                                </span>
                            </div>
                            <p style="color: var(--text-light); margin: 0.5rem 0;">
                                ${SecurityUtils.safeRender(assignment.description)}
                            </p>
                            <div class="assignment-meta">
                                <span>Module ${assignment.moduleId}</span>
                                <span>Due: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
                            </div>
                            ${submission && submission.feedback ? `
                                <div class="assignment-feedback">
                                    <strong>Feedback:</strong>
                                    <div style="margin-top: 0.5rem; padding: 1rem; background: var(--hover-bg); border-radius: 8px; white-space: pre-wrap;">
                                        ${SecurityUtils.safeRender(submission.feedback)}
                                    </div>
                                </div>
                            ` : ''}
                            <div class="assignment-actions">
                                ${status === 'not_submitted' 
                                    ? `<button class="btn btn-primary" onclick="openAssignmentSubmission('${assignment.id}')">Submit Assignment</button>`
                                    : status === 'graded'
                                    ? `<div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-secondary" onclick="viewAssignmentSubmission('${submission.id}')">View Submission</button>
                                        <button class="btn btn-primary" onclick="openAssignmentSubmission('${assignment.id}')">Resubmit</button>
                                       </div>`
                                    : status === 'submitted' || status === 'grading'
                                    ? `<div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-secondary" onclick="viewAssignmentSubmission('${submission.id}')">View Submission</button>
                                        <button class="btn btn-primary" onclick="openAssignmentSubmission('${assignment.id}')">Resubmit</button>
                                       </div>`
                                    : `<button class="btn btn-secondary" disabled>${status === 'grading' ? 'Grading in progress...' : 'Submitted'}</button>`}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // Save assignments
    saveAssignments() {
        localStorage.setItem('assignments', JSON.stringify(this.assignments));
    },
    
    // Save submissions
    saveSubmissions() {
        localStorage.setItem('assignmentSubmissions', JSON.stringify(this.submissions));
    },
    
    // Initialize default assignments
    initDefaultAssignments() {
        if (this.assignments.length > 0) return; // Already initialized
        
        // Get courses from window or wait for them to be available
        const courses = window.courses || [];
        if (courses.length === 0) {
            // Courses not loaded yet, try again later
            setTimeout(() => this.initDefaultAssignments(), 1000);
            return;
        }
        
        // Create assignments for each module
        courses.forEach(course => {
            if (course.modules_data) {
                course.modules_data.forEach((module, index) => {
                    this.assignments.push({
                        id: `assign_${course.id}_${module.id}`,
                        courseId: course.id,
                        moduleId: module.id,
                        title: `Assignment: ${module.title}`,
                        description: `Complete this assignment to demonstrate your understanding of ${module.title}. Write a comprehensive response (minimum 200 words) explaining the key concepts and providing examples.`,
                        dueDate: null, // No due date
                        maxScore: 100,
                        createdAt: new Date().toISOString()
                    });
                });
            }
        });
        
        this.saveAssignments();
    }
};

// Initialize default assignments after a delay to ensure courses are loaded
setTimeout(() => {
    AssignmentManager.initDefaultAssignments();
}, 500);

// Global functions
window.openAssignments = function(moduleId = null) {
    const modal = document.getElementById('assignmentsModal');
    if (!modal) {
        const modalHTML = `
            <div id="assignmentsModal" class="modal">
                <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 class="modal-title">Assignments</h2>
                        <button onclick="closeAssignments()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div id="assignmentsContent"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    document.getElementById('assignmentsContent').innerHTML = AssignmentManager.renderAssignmentsList(moduleId);
    document.getElementById('assignmentsModal').classList.add('show');
};

window.closeAssignments = function() {
    document.getElementById('assignmentsModal').classList.remove('show');
};

window.openAssignmentSubmission = function(assignmentId) {
    const modal = document.getElementById('assignmentSubmissionModal');
    if (!modal) {
        const modalHTML = `
            <div id="assignmentSubmissionModal" class="modal">
                <div class="modal-content" id="assignmentModalContent" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--border);">
                        <h2 class="modal-title">Submit Assignment</h2>
                        <button onclick="closeAssignmentSubmission()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div id="assignmentSubmissionContent" style="padding: 1.5rem;"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Reset to single view
    const modalContent = document.getElementById('assignmentModalContent');
    modalContent.classList.remove('split-view');
    modalContent.style.maxWidth = '700px';
    modalContent.style.width = '90%';
    
    // Clear module content if it exists
    const modulePanel = document.getElementById('assignmentModuleContent');
    if (modulePanel) {
        modulePanel.remove();
    }
    
    document.getElementById('assignmentSubmissionContent').innerHTML = AssignmentManager.renderSubmissionForm(assignmentId);
    document.getElementById('assignmentSubmissionModal').classList.add('show');
};

window.closeAssignmentSubmission = function() {
    const modal = document.getElementById('assignmentSubmissionModal');
    if (modal) {
        modal.classList.remove('show');
        // Reset modal to single view
        const modalContent = document.getElementById('assignmentModalContent');
        if (modalContent) {
            modalContent.classList.remove('split-view');
            modalContent.style.maxWidth = '700px';
            modalContent.style.width = '90%';
        }
        // Clear module content
        const modulePanel = document.getElementById('assignmentModuleContent');
        if (modulePanel) {
            modulePanel.remove();
        }
    }
};

// Toggle module content view in assignment submission
window.toggleModuleContentView = async function(assignmentId, moduleId) {
    const modalContent = document.getElementById('assignmentModalContent');
    const toggleBtn = document.getElementById(`toggleModuleView_${assignmentId}`);
    const modulePanel = document.getElementById('assignmentModuleContent');
    
    if (modulePanel && modulePanel.style.display !== 'none') {
        // Hide module content - return to single view
        modalContent.classList.remove('split-view');
        modalContent.style.maxWidth = '700px';
        modalContent.style.width = '90%';
        modulePanel.remove();
        
        // Restore original structure
        const rightPanel = document.getElementById('assignmentSubmissionContent');
        if (rightPanel && rightPanel.parentNode) {
            const submissionHTML = rightPanel.innerHTML;
            rightPanel.parentNode.innerHTML = `
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--border);">
                    <h2 class="modal-title">Submit Assignment</h2>
                    <button onclick="closeAssignmentSubmission()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div id="assignmentSubmissionContent" style="padding: 1.5rem;">${submissionHTML}</div>
            `;
        }
        
        if (toggleBtn) {
            toggleBtn.innerHTML = '<span>📖</span><span>View Module</span>';
        }
    } else {
        // Show module content - switch to split view
        modalContent.classList.add('split-view');
        modalContent.style.maxWidth = '95%';
        modalContent.style.width = '95%';
        
        // Get current submission content
        const submissionContent = document.getElementById('assignmentSubmissionContent');
        const submissionHTML = submissionContent.innerHTML;
        
        // Create new structure with left and right panels
        const header = submissionContent.parentNode.querySelector('.modal-header');
        const newStructure = `
            ${header ? header.outerHTML : ''}
            <div id="assignmentModuleContent" class="modal-left-panel">
                <div class="loading"><div class="spinner"></div><p>Loading module content...</p></div>
            </div>
            <div id="assignmentSubmissionContent" class="modal-right-panel">
                ${submissionHTML}
            </div>
        `;
        
        submissionContent.parentNode.innerHTML = newStructure;
        
        // Update button
        const newToggleBtn = document.getElementById(`toggleModuleView_${assignmentId}`);
        if (newToggleBtn) {
            newToggleBtn.innerHTML = '<span>✕</span><span>Hide Module</span>';
        }
        
        // Load module content
        const leftPanel = document.getElementById('assignmentModuleContent');
        try {
            const response = await fetch(`course/modules/module${String(moduleId).padStart(2, '0')}.md`);
            if (!response.ok) {
                throw new Error('Module not found');
            }
            
            const markdown = await response.text();
            let html = marked.parse(markdown);
            
            // Get module info
            const assignment = AssignmentManager.assignments.find(a => a.id === assignmentId);
            const course = window.courses && window.courses.find(c => c.id === assignment.courseId);
            const module = course && course.modules_data ? course.modules_data.find(m => m.id === moduleId) : null;
            
            // Process markdown (remove answers, etc.)
            html = html.replace(/✓/g, '');
            html = html.replace(/\(Answer:.*?\)/gi, '');
            
            leftPanel.innerHTML = `
                <div style="position: sticky; top: 0; background: var(--bg); padding-bottom: 1rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem; z-index: 10;">
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">${module ? module.title : 'Module Content'}</h2>
                    ${module && module.subtitle ? `<p style="color: var(--text-light); margin: 0; font-size: 0.9rem;">${module.subtitle}</p>` : ''}
                </div>
                <div class="module-content" style="font-size: 0.9rem; line-height: 1.6;">
                    ${html}
                </div>
            `;
            
            // Highlight code blocks
            setTimeout(() => {
                leftPanel.querySelectorAll('pre code').forEach(block => {
                    if (typeof hljs !== 'undefined') {
                        hljs.highlightElement(block);
                    }
                });
            }, 100);
            
        } catch (error) {
            console.error('Error loading module:', error);
            leftPanel.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                    <p>Could not load module content.</p>
                    <p style="font-size: 0.875rem;">Error: ${error.message}</p>
                </div>
            `;
        }
    }
};

// Toggle between text and file submission methods
window.toggleSubmissionMethod = function(assignmentId, method) {
    const textDiv = document.getElementById(`textSubmission_${assignmentId}`);
    const fileDiv = document.getElementById(`fileSubmission_${assignmentId}`);
    const contentInput = document.getElementById(`assignmentContent_${assignmentId}`);
    const fileInput = document.getElementById(`assignmentFile_${assignmentId}`);
    
    if (method === 'text') {
        textDiv.style.display = 'block';
        fileDiv.style.display = 'none';
        if (contentInput) contentInput.required = true;
        if (fileInput) fileInput.required = false;
    } else {
        textDiv.style.display = 'none';
        fileDiv.style.display = 'block';
        if (contentInput) contentInput.required = false;
        if (fileInput) fileInput.required = true;
    }
};

// Handle file selection
window.handleFileSelection = function(assignmentId, input) {
    const file = input.files[0];
    const fileInfo = document.getElementById(`fileInfo_${assignmentId}`);
    const fileName = document.getElementById(`fileName_${assignmentId}`);
    const fileSize = document.getElementById(`fileSize_${assignmentId}`);
    
    if (file) {
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('File size exceeds 10MB limit. Please choose a smaller file.');
            input.value = '';
            fileInfo.style.display = 'none';
            return;
        }
        
        // Check file type
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            alert('File type not allowed. Please upload PDF, Word, or Text files only.');
            input.value = '';
            fileInfo.style.display = 'none';
            return;
        }
        
        fileName.textContent = file.name;
        fileSize.textContent = `(${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        fileInfo.style.display = 'block';
    } else {
        fileInfo.style.display = 'none';
    }
};

// Clear file selection
window.clearFileSelection = function(assignmentId) {
    const fileInput = document.getElementById(`assignmentFile_${assignmentId}`);
    const fileInfo = document.getElementById(`fileInfo_${assignmentId}`);
    if (fileInput) {
        fileInput.value = '';
    }
    if (fileInfo) {
        fileInfo.style.display = 'none';
    }
};

// Helper function to read file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

window.submitAssignment = async function(assignmentId) {
    const methodText = document.getElementById(`methodText_${assignmentId}`);
    const methodFile = document.getElementById(`methodFile_${assignmentId}`);
    const contentInput = document.getElementById(`assignmentContent_${assignmentId}`);
    const fileInput = document.getElementById(`assignmentFile_${assignmentId}`);
    
    const submissionMethod = methodText && methodText.checked ? 'text' : 'file';
    
    const submissionData = {
        content: '',
        fileUrl: null,
        fileName: null
    };
    
    if (submissionMethod === 'text') {
        if (!contentInput || !contentInput.value.trim()) {
            alert('Please write your assignment before submitting.');
            return;
        }
        submissionData.content = contentInput.value;
    } else {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert('Please choose a file to upload.');
            return;
        }
        
        const file = fileInput.files[0];
        submissionData.fileName = file.name;
        submissionData.fileUrl = `#file_${file.name}`;
        
        // Read file content as text for preview/storage
        try {
            const fileContent = await readFileAsText(file);
            submissionData.content = `[File Upload: ${file.name}]\n\nFile content preview:\n${fileContent.substring(0, 500)}...`;
        } catch (error) {
            submissionData.content = `[File Upload: ${file.name}]`;
        }
    }
    
    const submission = await AssignmentManager.submitAssignment(assignmentId, submissionData);
    
    if (submission) {
        alert('Assignment submitted! AI grading will begin shortly.');
        closeAssignmentSubmission();
        openAssignments();
    }
};

window.viewAssignmentSubmission = function(submissionId) {
    const submission = AssignmentManager.submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const assignment = AssignmentManager.assignments.find(a => a.id === submission.assignmentId);
    
    // Easter egg animation sequence
    const easterEggContainer = document.createElement('div');
    easterEggContainer.className = 'easter-egg-modal';
    easterEggContainer.innerHTML = `
        <div class="easter-egg-gif-container">
            <img src="https://media.giphy.com/media/l0MYC0LajVbo5eX4s/giphy.gif" alt="Submission animation" style="width: 100%; height: auto;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27400%27%3E%3Crect fill=%27%23f0f0f0%27 width=%27400%27 height=%27400%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 font-size=%2740%27%3E📝%3C/text%3E%3C/svg%3E';">
        </div>
        <div class="easter-egg-3d-modal" id="easterEgg3DModal">
            <div style="text-align: center; padding: 2rem;">
                <h2 style="margin: 0;">${window.i18n ? window.i18n.t('loadingSubmission') : 'Loading Submission...'}</h2>
            </div>
        </div>
    `;
    document.body.appendChild(easterEggContainer);
    
    // Start 3D modal opening animation
    const modal3D = document.getElementById('easterEgg3DModal');
    
    // After modal starts opening, close it before fully opening
    setTimeout(() => {
        modal3D.classList.add('closing');
        
        // After closing animation, show character with message
        setTimeout(() => {
            easterEggContainer.innerHTML = `
                <div class="easter-egg-character">
                    <div class="easter-egg-character-emoji">😅</div>
                    <div class="easter-egg-message">${window.i18n ? window.i18n.t('oopsMyBad') : 'Oops my bad!'}</div>
                    <div class="easter-egg-subtitle">${window.i18n ? window.i18n.t('heresYourSubmission') : 'Here\'s your actual submission...'}</div>
                </div>
            `;
            
            // After showing the character, show actual submission
            setTimeout(() => {
                easterEggContainer.remove();
                
                // Show actual submission modal
                const modal = document.createElement('div');
                modal.className = 'modal show';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <h2 class="modal-title">${window.i18n ? window.i18n.t('assignment') + ' ' + window.i18n.t('yourSubmission') : 'Assignment Submission'}</h2>
                            <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>
                        <div style="padding: 1rem 0;">
                            <h3>${SecurityUtils.safeRender(assignment?.title || (window.i18n ? window.i18n.t('assignment') : 'Assignment'))}</h3>
                            <div style="margin: 1rem 0; padding: 1rem; background: var(--hover-bg); border-radius: 8px;">
                                <strong>${window.i18n ? window.i18n.t('yourSubmission') : 'Your Submission'}:</strong>
                                ${submission.content ? `
                                    <div style="margin-top: 0.5rem; white-space: pre-wrap;">${SecurityUtils.safeRender(submission.content)}</div>
                                ` : submission.fileName ? `
                                    <div style="margin-top: 0.5rem;">
                                        <span style="font-size: 1.2rem; margin-right: 0.5rem;">📎</span>
                                        <strong>${SecurityUtils.safeRender(submission.fileName)}</strong>
                                    </div>
                                ` : '<div style="margin-top: 0.5rem; color: var(--text-light);">No content submitted</div>'}
                            </div>
                            ${submission.grade !== null ? `
                                <div style="margin: 1rem 0; padding: 1rem; background: var(--hover-bg); border-radius: 8px;">
                                    <strong>Grade: ${submission.grade}%</strong>
                                </div>
                            ` : ''}
                            ${submission.feedback ? `
                                <div style="margin: 1rem 0;">
                                    <strong>Feedback:</strong>
                                    <div style="margin-top: 0.5rem; padding: 1rem; background: var(--hover-bg); border-radius: 8px; white-space: pre-wrap;">
                                        ${SecurityUtils.safeRender(submission.feedback)}
                                    </div>
                                </div>
                            ` : ''}
                            ${submission.submittedAt ? `
                                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--text-light); font-size: 0.875rem;">
                                    Submitted: ${new Date(submission.submittedAt).toLocaleString()}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }, 2000); // Show character for 2 seconds
        }, 500); // Close animation duration
    }, 400); // Start closing after 400ms (before fully opening)
};

window.AssignmentManager = AssignmentManager;

