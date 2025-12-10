# Module 3: Advanced CSS & Responsive Design

## Title: Creating Responsive, Modern Websites

### Lecture Content

Modern websites must work on all devices - from phones to desktops. In this module, you'll learn responsive design techniques, CSS Grid, animations, and advanced styling methods.

#### 1. Media Queries
Media queries apply styles based on screen size:

```css
/* Mobile first approach */
.container {
    width: 100%;
    padding: 10px;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        width: 750px;
        padding: 20px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        width: 1200px;
        padding: 40px;
    }
}
```

**Common Breakpoints:**
- Mobile: up to 767px
- Tablet: 768px - 1023px
- Desktop: 1024px and above

**Media Query Features:**
```css
@media (max-width: 600px) { }
@media (min-width: 768px) and (max-width: 1023px) { }
@media (orientation: landscape) { }
```

#### 2. CSS Grid
CSS Grid creates two-dimensional layouts:

```css
.container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
    gap: 20px;
}

.item {
    grid-column: span 2; /* Span 2 columns */
    grid-row: 1; /* Row 1 */
}
```

**Grid Properties:**
- `grid-template-columns` - Define columns
- `grid-template-rows` - Define rows
- `gap` - Space between grid items
- `grid-column` / `grid-row` - Item placement
- `fr` - Fractional unit (flexible sizing)

**Grid Example:**
```css
.grid-container {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-areas:
        "header header header"
        "sidebar main aside"
        "footer footer footer";
    gap: 15px;
}
```

#### 3. CSS Variables (Custom Properties)
Variables make CSS more maintainable:

```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --font-size-base: 16px;
    --spacing-unit: 8px;
}

.button {
    background-color: var(--primary-color);
    font-size: var(--font-size-base);
    padding: calc(var(--spacing-unit) * 2);
}
```

**Benefits:**
- Consistent theming
- Easy updates
- Dynamic values with JavaScript

#### 4. Animations and Transitions
**Transitions:**
```css
.button {
    background-color: blue;
    transition: background-color 0.3s ease;
}

.button:hover {
    background-color: red;
}
```

**Animations:**
```css
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.element {
    animation: fadeIn 0.5s ease-in-out;
}
```

**Common Animations:**
- Fade in/out
- Slide in/out
- Rotate
- Scale
- Bounce

#### 5. Mobile-First Design
Start with mobile, then enhance for larger screens:

```css
/* Mobile styles (default) */
.container {
    width: 100%;
    padding: 10px;
}

/* Tablet and up */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
        margin: 0 auto;
        padding: 20px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        padding: 40px;
    }
}
```

**Mobile-First Benefits:**
- Faster on mobile
- Progressive enhancement
- Better performance
- Easier to maintain

#### 6. Advanced Selectors
**Pseudo-classes:**
```css
a:hover { }
a:active { }
a:visited { }
input:focus { }
li:first-child { }
li:last-child { }
li:nth-child(2) { }
```

**Pseudo-elements:**
```css
p::before {
    content: "→ ";
}

p::after {
    content: " ←";
}

p::first-line {
    font-weight: bold;
}
```

#### 7. CSS Best Practices
- Use external stylesheets
- Organize with comments
- Use meaningful class names
- Keep specificity low
- Use variables for consistency
- Mobile-first approach
- Test on multiple devices

### Exercises (Complete all 5)
1. Create a responsive navigation that becomes a hamburger menu on mobile.
2. Build a CSS Grid layout with 3 columns on desktop, 1 on mobile.
3. Add a smooth transition to a button hover effect.
4. Create a fade-in animation for page elements.
5. Use CSS variables to create a theme that can be easily changed.

### Assignment (Responsive Portfolio Layout)
Create a responsive portfolio page:
- **Requirements:**
  - Mobile-first design approach
  - Use CSS Grid for main layout
  - Responsive navigation menu
  - At least 2 breakpoints (mobile, tablet, desktop)
  - Include animations or transitions
  - Use CSS variables for theming
  - Test on different screen sizes
  - Professional appearance

- **Deliverable:** HTML file + CSS file (responsive)
- **Word count:** N/A (focus on responsive design)

### Quiz Questions
**Multiple Choice:**
1. What is the mobile-first approach?
   a) Design for desktop first
   b) Design for mobile first, then enhance ✓
   c) Only design for mobile
   d) Ignore mobile devices

2. Which CSS feature creates two-dimensional layouts?
   a) Flexbox
   b) CSS Grid ✓
   c) Float
   d) Position

3. What does `fr` unit mean in CSS Grid?
   a) Fixed ratio
   b) Fractional unit ✓
   c) Frame rate
   d) Font size

4. CSS variables are defined with:
   a) `$variable-name`
   b) `--variable-name` ✓
   c) `var(variable-name)`
   d) `@variable-name`

5. What property creates smooth transitions?
   a) `animation`
   b) `transition` ✓
   c) `transform`
   d) `keyframes`

6. Media queries use:
   a) `@media` ✓
   b) `@query`
   c) `@screen`
   d) `@responsive`

**Short Answer:**
7. What are three common breakpoints for responsive design?
8. What is the difference between transitions and animations?

### Reading Materials
- "Responsive Design Guide" (PDF provided)
- MDN CSS Grid: developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
- CSS Variables Guide: developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

### Resources
- Responsive design cheat sheet
- CSS Grid visual guide
- Media query breakpoint reference
- Animation examples library
- Mobile-first checklist

**Next Steps:** Complete exercises and assignment before proceeding to Module 4.

