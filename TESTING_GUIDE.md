# 🧪 Testing Guide - School 2

## Quick Start

### Option 1: Use the start script (recommended)
```bash
cd "/Users/phktistakis/Devoloper Projects/School 2"
./start.sh
```

The script will automatically find an available port (8001, 8002, 8003, etc.)

### Option 2: Manual start
```bash
cd "/Users/phktistakis/Devoloper Projects/School 2"
python3 -m http.server 8001
```

Then open: **http://localhost:8001**

---

## 🧪 What to Test

### 1. Basic Functionality
- [ ] Open http://localhost:[PORT]
- [ ] Click "Sign In" button
- [ ] Enter name and email
- [ ] View courses page
- [ ] Click on a course card
- [ ] Navigate through modules
- [ ] Take a quiz
- [ ] Complete a module

### 2. Enhanced Features
- [ ] Click 🎨 button - Change themes
- [ ] Click 📐 button - Change layouts
- [ ] Click 🔍 button - Try AI search
- [ ] Click 🎯 button - View learning potential

### 3. User Profiles
- [ ] Click profile → "Edit Profile"
- [ ] Add bio (test character counter)
- [ ] Add profile picture URL
- [ ] Add social media links
- [ ] Save profile
- [ ] View "My Profile"

### 4. Certificates
- [ ] Complete all modules in a course
- [ ] Pass all quizzes (70%+)
- [ ] Check "My Certificates"
- [ ] Download certificate PDF
- [ ] Share certificate

### 5. Friends System
- [ ] Click profile → "Friends"
- [ ] Go to "Discover" tab
- [ ] Follow a user
- [ ] View their profile
- [ ] See their certificates
- [ ] Unfollow user

### 6. Security Testing
- [ ] Try XSS in bio field: `<script>alert('xss')</script>`
- [ ] Try invalid URLs in social links
- [ ] Try SQL injection: `'; DROP TABLE users; --`
- [ ] Verify all inputs are sanitized

### 7. Responsive Design
- [ ] Test on mobile (Chrome DevTools)
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Check all layouts work
- [ ] Verify no overlapping elements

### 8. Dark/Light Mode
- [ ] Toggle theme button
- [ ] Verify colors change
- [ ] Check all pages in both modes
- [ ] Verify theme persists on reload

---

## 🐛 Known Issues to Check

1. **Port Conflicts**: If port is in use, script finds next available
2. **LocalStorage**: Clear browser data if testing fresh start
3. **CDN Dependencies**: Requires internet connection

---

## 📝 Test Checklist

### Core Features ✅
- [x] Course viewing
- [x] Module navigation
- [x] Quiz system
- [x] Certificate generation
- [x] User profiles
- [x] Friends system

### Enhanced Features ✅
- [x] Theme switching
- [x] Layout options
- [x] AI search
- [x] Learning prediction

### Security ✅
- [x] Input validation
- [x] XSS prevention
- [x] URL validation

### Issues Found
- [ ] List any bugs here

---

## 🚀 Quick Test Commands

```bash
# Start server
cd "/Users/phktistakis/Devoloper Projects/School 2"
./start.sh

# Check what port it's running on
lsof -ti:8001 && echo "Port 8001" || \
lsof -ti:8002 && echo "Port 8002" || \
lsof -ti:8003 && echo "Port 8003" || \
echo "Check manually"

# Stop server (find PID and kill)
lsof -ti:8001 | xargs kill
```

---

## 💡 Testing Tips

1. **Clear localStorage** between tests:
   ```javascript
   localStorage.clear();
   ```

2. **Test in incognito mode** for fresh state

3. **Test all themes** to ensure they work

4. **Test all layouts** to ensure responsive

5. **Test offline** by disconnecting internet

6. **Test security** by trying malicious inputs

---

**Happy Testing!** 🎉

