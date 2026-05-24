// Certificate System for School 2

const CertificateManager = {
    certificates: JSON.parse(localStorage.getItem('certificates') || '[]'),
    
    generateCertificate(courseId, courseTitle) {
        const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const certificate = {
            id: `cert_${uuid}`,
            courseId: courseId,
            courseTitle: courseTitle,
            studentName: user ? user.name : 'Student',
            studentEmail: user ? user.email : '',
            issueDate: new Date().toISOString(),
            // UUID-based cert number (not Date.now — that was guessable & could collide)
            certificateNumber: `CT-${uuid.replace(/-/g, '').slice(0, 12).toUpperCase()}`,
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
                    <button class="btn btn-linkedin" onclick="shareToLinkedIn('${certificate.id}')" title="Share on LinkedIn">💼 LinkedIn</button>
                    <button class="btn btn-twitter" onclick="shareToTwitter('${certificate.id}')" title="Share on Twitter/X">🐦 Twitter/X</button>
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

// Lazy-load jsPDF from CDN on first download (avoids bundle bloat for users
// who never download a certificate).
function loadJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (window._jsPDFPromise) return window._jsPDFPromise;

    window._jsPDFPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
        s.onload = () => {
            if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
            else reject(new Error('jsPDF loaded but constructor missing'));
        };
        s.onerror = () => reject(new Error('Failed to load jsPDF from CDN'));
        document.head.appendChild(s);
    });
    return window._jsPDFPromise;
}

async function downloadCertificate(certId) {
    const certificate = CertificateManager.getCertificateById(certId);
    if (!certificate) return;

    let jsPDF;
    try {
        jsPDF = await loadJsPDF();
    } catch (err) {
        console.error('jsPDF load failed, falling back to print:', err);
        return downloadCertificatePrintFallback(certificate);
    }

    // A4 landscape, mm units
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();   // 297
    const H = doc.internal.pageSize.getHeight();  // 210

    // Background tint
    doc.setFillColor(247, 250, 252);
    doc.rect(0, 0, W, H, 'F');

    // Gold border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(3);
    doc.rect(10, 10, W - 20, H - 20);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, W - 26, H - 26);

    // Header
    doc.setFont('times', 'bold');
    doc.setTextColor(45, 55, 72);
    doc.setFontSize(36);
    doc.text('Certificate of Completion', W / 2, 45, { align: 'center' });

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(W / 2 - 60, 52, W / 2 + 60, 52);

    // Body
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(74, 85, 104);
    doc.text('This is to certify that', W / 2, 75, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(102, 126, 234);
    doc.text(certificate.studentName || 'Student', W / 2, 95, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(74, 85, 104);
    doc.text('has successfully completed the course', W / 2, 113, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(118, 75, 162);
    const courseTitle = certificate.courseTitle || 'Course';
    const courseLines = doc.splitTextToSize(courseTitle, W - 60);
    doc.text(courseLines, W / 2, 130, { align: 'center' });

    // Footer details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(113, 128, 150);
    const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.text(`Certificate Number: ${certificate.certificateNumber}`, W / 2, 170, { align: 'center' });
    doc.text(`Issue Date: ${issueDate}`, W / 2, 178, { align: 'center' });
    if (certificate.studentEmail) {
        doc.text(`Issued to: ${certificate.studentEmail}`, W / 2, 186, { align: 'center' });
    }

    if (certificate.verified) {
        doc.setTextColor(72, 187, 120);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ Verified', W / 2, 196, { align: 'center' });
    }

    const safe = (certificate.courseTitle || 'certificate')
        .replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    doc.save(`certificate-${safe}-${certificate.certificateNumber}.pdf`);

    if (typeof AnalyticsManager !== 'undefined') {
        AnalyticsManager.trackEvent('certificate_downloaded', {
            course_id: certificate.courseId,
            cert_number: certificate.certificateNumber
        });
    }
}

function downloadCertificatePrintFallback(certificate) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Could not open print window. Please allow pop-ups and try again.');
        return;
    }
    const issueDate = new Date(certificate.issueDate).toLocaleDateString();
    printWindow.document.write(`
        <!DOCTYPE html><html><head><title>Certificate - ${certificate.courseTitle}</title>
        <style>
            @page { size: landscape; margin: 0; }
            body { font-family: Georgia, serif; margin: 0; padding: 2rem; background: linear-gradient(135deg,#667eea,#764ba2); min-height:100vh; display:flex; align-items:center; justify-content:center; }
            .c { background:white; padding:3rem; border:10px solid #d4af37; max-width:900px; text-align:center; }
            h1 { color:#2d3748; font-size:2.5rem; }
            .name { font-size:2rem; color:#667eea; font-weight:bold; margin:1rem 0; }
            .course { font-size:1.5rem; color:#764ba2; margin:1rem 0; }
            .details { margin-top:2rem; border-top:2px solid #e2e8f0; padding-top:1rem; color:#718096; }
        </style></head>
        <body><div class="c">
            <h1>🎓 Certificate of Completion</h1>
            <p>This is to certify that</p>
            <div class="name">${certificate.studentName}</div>
            <p>has successfully completed the course</p>
            <div class="course">${certificate.courseTitle}</div>
            <div class="details">
                <p><strong>Certificate Number:</strong> ${certificate.certificateNumber}</p>
                <p><strong>Issue Date:</strong> ${issueDate}</p>
            </div>
        </div></body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
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

function shareToLinkedIn(certId) {
    const certificate = CertificateManager.getCertificateById(certId);
    if (!certificate) return;
    
    const shareText = encodeURIComponent(`I just completed "${certificate.courseTitle}" on School Learning Platform! 🎓`);
    const shareUrl = encodeURIComponent(window.location.href);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&summary=${shareText}`;
    
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    
    // Track analytics
    if (typeof AnalyticsManager !== 'undefined') {
        AnalyticsManager.trackEvent('certificate_shared', {
            platform: 'linkedin',
            course_id: certificate.courseId
        });
    }
}

function shareToTwitter(certId) {
    const certificate = CertificateManager.getCertificateById(certId);
    if (!certificate) return;
    
    const shareText = encodeURIComponent(`I just completed "${certificate.courseTitle}"! 🎓`);
    const shareUrl = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    
    // Track analytics
    if (typeof AnalyticsManager !== 'undefined') {
        AnalyticsManager.trackEvent('certificate_shared', {
            platform: 'twitter',
            course_id: certificate.courseId
        });
    }
}

window.downloadCertificate = downloadCertificate;
window.shareCertificate = shareCertificate;
window.shareToLinkedIn = shareToLinkedIn;
window.shareToTwitter = shareToTwitter;

