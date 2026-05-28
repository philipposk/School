# Critical Thinking School

An online course that teaches you how to think more clearly and reason better. You open it in your web browser and work through eight lessons at your own pace — covering things like spotting bad arguments, avoiding common thinking traps, weighing evidence, and making better decisions. It keeps track of how far you've got so you can pick up where you left off.

It's for anyone who wants to sharpen their reasoning skills, whether you're studying, teaching, or just curious.

## What it does
- Walks you through eight lessons on clear thinking and good reasoning
- Shows a sidebar menu and buttons to move between lessons
- Tracks your progress and saves it automatically on your device
- Includes quizzes and worksheets along the way
- Looks clean and works well on phones, tablets, and computers

The eight lessons cover: the foundations of critical thinking, logic and arguments, evidence and induction, probability and Bayesian thinking, cognitive biases, fallacies and rhetoric, building strong arguments, and decision-making with a final project.

## Status
Working website / course platform. Several backup and experimental copies of the project also live in this folder.

---
### For developers
Frontend is pure HTML/CSS/JavaScript with no build step; dependencies load via CDN (Marked.js for Markdown, Highlight.js for code). Progress is stored in `localStorage`. Course content lives as Markdown modules, quiz JSON, resources, and video scripts under `course/`. Serve as static files:

```bash
./start.sh                 # or: python3 -m http.server 8000
open http://localhost:8000
```

Deploys to any static host (Netlify, Vercel, GitHub Pages). A Dockerfile and Fly.io deployment scripts are also present. See `TECH_STACK.md`, `FEATURES.md`, and `DEPLOYMENT.md`. License: MIT.
