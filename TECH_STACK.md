# 🛠️ Tech Stack - What Code This App Uses

Complete breakdown of all technologies, languages, and frameworks used in this application.

---

## 📱 Frontend (Client-Side)

### Core Technologies:
- **HTML5** - Structure and markup
- **CSS3** - Styling (with CSS Variables for theming)
- **JavaScript (ES6+)** - Client-side logic, no frameworks

### Architecture:
- **Vanilla JavaScript** - No React, Vue, or Angular
- **Single Page Application (SPA)** - All in `index.html` (~4,000 lines)
- **No Build Step** - Works directly in browser
- **No Bundler** - Files loaded directly

### Key JavaScript Files:
```
js/
├── ai-config.js              # AI API configuration
├── assignments.js            # Assignment management
├── certificates.js           # Certificate generation
├── enhanced-features.js      # Theme, layout, AI search
├── gdpr-compliance.js       # GDPR features
├── i18n.js                  # Internationalization (EN/GR)
├── messaging.js             # Messaging system
├── migration-to-supabase.js # Data migration
├── security.js              # Security utilities
├── supabase-client.js       # Supabase integration
└── user-profiles.js         # User profile management
```

### Libraries (Loaded via CDN):
- **Highlight.js** - Code syntax highlighting
- **Marked.js** - Markdown rendering
- **Three.js** - 3D effects (optional)
- **Supabase JS** - Database client (when configured)

### Storage:
- **localStorage** - Client-side storage (fallback)
- **Supabase** - Database (when configured)

---

## 🖥️ Backend (Server-Side)

### Language:
- **Node.js** - JavaScript runtime
- **JavaScript (ES6+)** - Server-side code

### Framework:
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing

### Backend File:
```
backend-proxy-example.js     # Complete backend server
```

### Backend Features:
- AI API proxy (Groq & OpenAI)
- Email notifications (Resend)
- SMS notifications (Twilio)
- Health check endpoint
- Supabase integration

### Dependencies:
```json
{
  "express": "^4.18.2",           // Web framework
  "cors": "^2.8.5",               // CORS middleware
  "@supabase/supabase-js": "^2.39.0"  // Supabase client
}
```

---

## 🗄️ Database

### Primary:
- **Supabase** (PostgreSQL) - Main database
  - User profiles
  - Progress tracking
  - Messages
  - Quiz scores
  - Friends

### Fallback:
- **localStorage** - Browser storage (when Supabase not configured)

---

## 🎨 Styling

### CSS Files:
```
css/
├── enhanced-styles.css          # Main styles (~900 lines)
└── messaging-assignments.css    # Messaging & assignments styles
```

### CSS Features:
- **CSS Variables** - Theme system
- **Flexbox & Grid** - Layout
- **Media Queries** - Responsive design
- **Animations** - Smooth transitions
- **Dark Mode** - Theme switching

### No CSS Frameworks:
- ❌ No Bootstrap
- ❌ No Tailwind
- ❌ No Material-UI
- ✅ Pure CSS

---

## 📚 Content

### Format:
- **Markdown (.md)** - Course modules
- **JSON** - Quiz data, course data

### Course Structure:
```
course/
├── modules/
│   ├── module01.md
│   ├── module02.md
│   └── ...
├── quizzes/
│   ├── quiz1.json
│   ├── quiz2.json
│   └── ...
└── syllabus.md
```

---

## 🔌 External Services/APIs

### AI Services:
- **Groq API** - AI chat/search (via backend proxy)
- **OpenAI API** - AI grading (via backend proxy)

### Database:
- **Supabase** - PostgreSQL database + Auth + Storage

### Email:
- **Resend** - Email notifications (via backend)

### SMS (Optional):
- **Twilio** - SMS notifications (via backend)

---

## 🌐 Deployment

### Frontend:
- **Static Files** - HTML/CSS/JS
- **GitHub Pages** - Current deployment
- **Any Static Host** - Netlify, Vercel, etc.

### Backend:
- **Node.js Server** - Express.js
- **Railway/Render/Fly.io** - Hosting options
- **Cloudflare Workers** - Alternative (serverless)

---

## 📦 Package Management

### Frontend:
- **No npm/package.json** - All via CDN
- **No Build Step** - Direct file loading

### Backend:
- **npm** - Node.js package manager
- **package.json** - Dependencies listed

---

## 🔐 Authentication

### Current:
- **localStorage** - Client-side auth (fallback)
- **Supabase Auth** - Real authentication (when configured)

### Features:
- Email/password
- OAuth (Google, GitHub) - via Supabase
- Session management

---

## 🌍 Internationalization

### Languages:
- **English (en)**
- **Greek (el)**

### Implementation:
- **Custom i18n system** (`js/i18n.js`)
- **No framework** - Pure JavaScript

---

## 📊 Summary

### Frontend Stack:
```
HTML5 + CSS3 + Vanilla JavaScript
No frameworks, no build step
Single HTML file (~4,000 lines)
```

### Backend Stack:
```
Node.js + Express.js
JavaScript (ES6+)
Simple REST API
```

### Database:
```
Supabase (PostgreSQL)
+ localStorage (fallback)
```

### Architecture:
```
Frontend: Static files (HTML/CSS/JS)
Backend: Node.js/Express API
Database: Supabase PostgreSQL
Storage: Supabase Storage
```

---

## 🎯 Why This Stack?

### Advantages:
✅ **Simple** - No complex build tools  
✅ **Fast** - No framework overhead  
✅ **Portable** - Works anywhere  
✅ **Easy to Deploy** - Just static files  
✅ **No Dependencies** - Frontend works standalone  

### Trade-offs:
⚠️ **Large HTML file** - Everything in one file  
⚠️ **No TypeScript** - Plain JavaScript  
⚠️ **No Framework** - More manual work  
⚠️ **No Build Step** - No optimization  

---

## 📝 Code Statistics

- **Frontend**: ~4,000 lines (HTML + inline JS)
- **JavaScript Modules**: ~3,000 lines (11 files)
- **CSS**: ~1,200 lines (2 files)
- **Backend**: ~200 lines (1 file)
- **Total**: ~8,400 lines of code

---

## 🔄 Development Workflow

### Frontend:
1. Edit `index.html` or JS files
2. Refresh browser
3. No build step needed

### Backend:
1. Edit `backend-proxy-example.js`
2. Run `npm start`
3. Test locally

### Deployment:
1. Push to GitHub
2. GitHub Pages auto-deploys frontend
3. Railway/Render auto-deploys backend

---

## 🎓 Learning Resources

If you want to understand/modify the code:

**HTML/CSS:**
- MDN Web Docs: https://developer.mozilla.org
- CSS Tricks: https://css-tricks.com

**JavaScript:**
- MDN JavaScript Guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- JavaScript.info: https://javascript.info

**Node.js/Express:**
- Express Docs: https://expressjs.com
- Node.js Docs: https://nodejs.org/docs

**Supabase:**
- Supabase Docs: https://supabase.com/docs

---

## 🚀 Quick Answer

**This app is:**
- **Frontend**: HTML + CSS + Vanilla JavaScript (no frameworks)
- **Backend**: Node.js + Express.js (JavaScript)
- **Database**: Supabase (PostgreSQL)
- **Architecture**: Static frontend + REST API backend

**No React, Vue, Angular, or other frameworks!** Just pure web technologies. 🎯

