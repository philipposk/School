// Certificate System for School 2

const CertificateManager = {
    certificates: JSON.parse(localStorage.getItem('certificates') || '[]'),
    
    generateCertificate(courseId, courseTitle) {
        const certificate = {
            id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            courseId: courseId,
            courseTitle: courseTitle,
            studentName: user ? user.name : 'Student',
            studentEmail: user ? user.email : '',
            issueDate: new Date().toISOString(),
            certificateNumber: `CT-${Date.now()}`,
            verified: true
        };
        
        this.certificates.push(certificate);
        localStorage.setItem('certificates', JSON.stringify(this.certificates));
        return certificate;
    },
    
    checkCourseCompletion(courseId) {
        const course = courses.find(c => c.id === courseId);
        if (!course) return false;
        
        // Check if all modules are completed
        const allModulesCompleted = course.modules_data.every(module => {
            const moduleKey = `${courseId}-${module.id}`;
            return state.completedModules.includes(moduleKey);
        });
        
        // Check if all quizzes are passed (optional requirement)
        const allQuizzesPassed = course.modules_data.every(module => {
            const moduleKey = `${courseId}-${module.id}`;
            const quizScore = state.quizScores[moduleKey];
            return quizScore && quizScore.score >= (quizScore.total * 0.7); // 70% passing
        });
        
        return allModulesCompleted && allQuizzesPassed;
    },
    
    getCertificatesForUser(userEmail) {
        if (!userEmail) userEmail = user ? user.email : null;
        return this.certificates.filter(cert => cert.studentEmail === userEmail);
    },
    
    getCertificateById(certId) {
        return this.certificates.find(cert => cert.id === certId);
    },
    
    renderCertificateHTML(certificate) {
        const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="certificate-card" data-cert-id="${certificate.id}">
                <div class="certificate-header">
                    <div class="certificate-badge">🎓</div>
                    <h3>Certificate of Completion</h3>
                </div>
                <div class="certificate-body">
                    <p class="certificate-text">This is to certify that</p>
                    <h2 class="certificate-name">${certificate.studentName}</h2>
                    <p class="certificate-text">has successfully completed the course</p>
                    <h3 class="certificate-course">${certificate.courseTitle}</h3>
                    <div class="certificate-details">
                        <p><strong>Certificate Number:</strong> ${certificate.certificateNumber}</p>
                        <p><strong>Issue Date:</strong> ${issueDate}</p>
                        ${certificate.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                    </div>
                </div>
                <div class="certificate-actions">
                    <button class="btn btn-primary" onclick="downloadCertificate('${certificate.id}')">Download PDF</button>
                    <button class="btn btn-secondary" onclick="shareCertificate('${certificate.id}')">Share</button>
                </div>
            </div>
        `;
    },
    
    renderCertificatesModal() {
        const userCerts = this.getCertificatesForUser();
        
        if (userCerts.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📜</div>
                    <h3>No Certificates Yet</h3>
                    <p style="color: var(--text-light); margin-top: 1rem;">
                        Complete a course to earn your first certificate!
                    </p>
                </div>
            `;
        }
        
        return `
            <div class="certificates-grid">
                ${userCerts.map(cert => this.renderCertificateHTML(cert)).join('')}
            </div>
        `;
    }
};

// Certificate download function
function downloadCertificate(certId) {
    const certificate = CertificateManager.getCertificateById(certId);
    if (!certificate) return;
    
    // Create a printable certificate
    const printWindow = window.open('', '_blank');
    const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Certificate - ${certificate.courseTitle}</title>
            <style>
                @page { size: landscape; margin: 0; }
                body {
                    font-family: 'Georgia', serif;
                    margin: 0;
                    padding: 2rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .certificate-container {
                    background: white;
                    padding: 3rem;
                    border: 10px solid #d4af37;
                    box-shadow: 0 0 30px rgba(0,0,0,0.3);
                    max-width: 900px;
                    text-align: center;
                }
                .certificate-header {
                    border-bottom: 3px solid #d4af37;
                    padding-bottom: 1rem;
                    margin-bottom: 2rem;
                }
                .certificate-header h1 {
                    color: #2d3748;
                    font-size: 2.5rem;
                    margin: 0;
                }
                .certificate-body {
                    padding: 2rem 0;
                }
                .certificate-name {
                    font-size: 2rem;
                    color: #667eea;
                    margin: 1rem 0;
                    font-weight: bold;
                }
                .certificate-course {
                    font-size: 1.5rem;
                    color: #764ba2;
                    margin: 1rem 0;
                }
                .certificate-details {
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 2px solid #e2e8f0;
                    font-size: 0.9rem;
                    color: #718096;
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="certificate-header">
                    <h1>🎓 Certificate of Completion</h1>
                </div>
                <div class="certificate-body">
                    <p style="font-size: 1.2rem;">This is to certify that</p>
                    <div class="certificate-name">${certificate.studentName}</div>
                    <p style="font-size: 1.2rem;">has successfully completed the course</p>
                    <div class="certificate-course">${certificate.courseTitle}</div>
                    <div class="certificate-details">
                        <p><strong>Certificate Number:</strong> ${certificate.certificateNumber}</p>
                        <p><strong>Issue Date:</strong> ${new Date(certificate.issueDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(certificateHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

function shareCertificate(certId) {
    const certificate = CertificateManager.getCertificateById(certId);
    if (!certificate) return;
    
    const shareText = `I just completed "${certificate.courseTitle}"! 🎓 Check out my certificate!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Course Certificate',
            text: shareText,
            url: shareUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Certificate link copied to clipboard!');
    }
}

window.downloadCertificate = downloadCertificate;
window.shareCertificate = shareCertificate;

