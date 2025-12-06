# School 2 - Enhanced Learning Platform 🚀

## Overview

School 2 is an enhanced version of the original School project, featuring advanced UI customization, AI-powered search, and learning analytics inspired by the SalonApp.

## ✨ New Features

### 1. 🎨 Advanced Theme System
- **Multiple Visual Themes**: Choose from 7+ beautiful themes:
  - Default
  - Liquid Glass (frosted glass effect)
  - Instagram Style (gradient colors)
  - Minimal (clean and simple)
  - Luxury (gold accents)
  - Nature (green tones)
  - Cyber (futuristic dark theme)

- **Access**: Click the 🎨 button in the header

### 2. 📐 UI Layout Options
- **5 Different Layouts**:
  - **Default**: Traditional grid layout
  - **Beauty Card**: Instagram-style large cards with images
  - **Feed Layout**: Social media-style scrolling feed
  - **Sidebar**: Sidebar navigation layout
  - **Modern**: Minimalist design with bottom navigation

- **Access**: Click the 📐 button in the header

### 3. 🔍 AI Search Assistant
- **Natural Language Search**: Ask questions in plain English
- **Smart Results**: Searches courses, modules, and content intelligently
- **Example Queries**:
  - "Show me modules about logic"
  - "Find quizzes I haven't completed"
  - "What courses are available?"

- **Access**: Click the 🔍 button in the header

### 4. 🎯 Learning Potential Predictor
- **Current Potential**: See what percentage of your full potential you've reached
- **Predicted Potential**: Forecast based on your learning trajectory
- **Analytics**:
  - Completion rate
  - Average quiz scores
  - Study streak
  - Motivational messages

- **Access**: Click the 🎯 button in the header

## 🚀 Quick Start

1. **Start the server**:
   ```bash
   cd "/Users/phktistakis/Devoloper Projects/School 2"
   python3 -m http.server 8000
   ```

2. **Open in browser**: http://localhost:8000

3. **Try the features**:
   - Click 🎨 to change themes
   - Click 📐 to change layouts
   - Click 🔍 to search
   - Click 🎯 to see your learning potential

## 📁 File Structure

```
School 2/
├── index.html              # Main application (enhanced)
├── css/
│   └── enhanced-styles.css # Styles for new features
├── js/
│   └── enhanced-features.js # Theme, Layout, Search, Prediction logic
├── course/                 # Course content (unchanged)
├── FEATURES.md            # Feature documentation
└── README_ENHANCED.md     # This file
```

## 🎯 How It Works

### Theme System
- Themes are stored in `ThemeManager` object
- Selected theme persists in localStorage
- CSS variables update dynamically

### Layout System
- Layouts are managed by `UILayoutManager`
- Each layout has its own rendering function
- Layout preference saved in localStorage

### AI Search
- Searches through courses and modules
- Supports natural language queries
- Results are clickable and navigate directly

### Learning Prediction
- Calculates based on:
  - Module completion rate
  - Quiz scores
  - Study streak
- Provides motivational feedback

## 🔮 Future Enhancements

See `FEATURES.md` for a complete list of proposed features from SalonApp and other apps.

## 💡 Tips

- **Theme + Layout**: Try different combinations for the best experience
- **Search**: Use natural language - the AI understands context
- **Prediction**: Check regularly to track your learning progress
- **Dark Mode**: Use the 🌙 button for dark/light mode toggle

## 🐛 Troubleshooting

- If themes don't apply, check browser console for errors
- If layouts don't change, clear localStorage and refresh
- If search doesn't work, ensure `enhanced-features.js` is loaded

## 📝 Notes

- All preferences are saved in browser localStorage
- No backend required - everything works client-side
- Compatible with all modern browsers

---

**Built with ❤️ - Enhanced Learning Experience**

