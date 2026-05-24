# Critical Thinking School - React Web App

A modern, fully-featured React application for the Critical Thinking course platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
web-app/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components (HomePage, CoursePage, ModulePage)
│   ├── store/          # Zustand state management
│   ├── data/           # Course data and configuration
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## ✨ Features

- **Modern React** with TypeScript
- **React Router** for navigation
- **Zustand** for state management with localStorage persistence
- **Tailwind CSS** for styling with dark mode support
- **React Markdown** for rendering course content
- **Responsive Design** - works on all devices
- **Progress Tracking** - saves your progress automatically
- **Dark Mode** - automatic theme detection with manual toggle

## 🎨 Styling

This project uses Tailwind CSS with custom theme configuration. The theme includes:
- Custom color palette (primary, secondary, success, warning, error)
- Typography plugin for markdown content
- Forms plugin for form styling
- Dark mode support

## 📚 Course Content

The app loads course modules from `/course/modules/` directory. Make sure the course files are accessible when running the app.

### Development Setup

For development, you can:
1. Run the app from the project root (where `course/` directory exists)
2. Or use a proxy in `vite.config.ts` to serve course files

### Production Deployment

For production, ensure the `course/` directory is accessible at the same domain, or configure your server to serve static files from the correct path.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Type check without building

## 📝 Notes

- Progress is saved to localStorage automatically
- Course modules are loaded from markdown files
- The app supports multiple courses (extendable)
- All routing is client-side (SPA)

## 🚀 Deployment

This app can be deployed to:
- **Vercel** - Connect your GitHub repo
- **Netlify** - Drag and drop the `dist` folder
- **GitHub Pages** - Use GitHub Actions
- **Any static hosting** - Upload the `dist` folder

Make sure to configure your hosting to serve the `course/` directory as static files.

