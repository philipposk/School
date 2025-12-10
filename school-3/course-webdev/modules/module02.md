# Module 2: CSS Styling & Layout

## Title: Making Websites Beautiful with CSS3

### Lecture Content

CSS (Cascading Style Sheets) brings HTML to life with colors, fonts, layouts, and visual design. In this module, you'll learn to style web pages, understand the box model, and create layouts using Flexbox.

#### 1. What is CSS?
CSS controls the visual presentation of HTML elements. It separates content (HTML) from presentation (CSS).

**Three Ways to Add CSS:**
1. **Inline:** `<p style="color: blue;">Text</p>`
2. **Internal:** `<style>` tag in `<head>`
3. **External:** `<link rel="stylesheet" href="styles.css">` (recommended)

#### 2. CSS Selectors
Selectors target HTML elements to style them:

**Basic Selectors:**
```css
/* Element selector */
p { color: blue; }

/* Class selector */
.intro { font-size: 18px; }

/* ID selector */
#header { background: gray; }

/* Descendant selector */
article p { margin: 10px; }
```

**Common Selectors:**
- `element` - Targets all elements of that type
- `.class` - Targets elements with that class
- `#id` - Targets element with that ID
- `element.class` - Targets element with specific class
- `element, element` - Multiple elements

#### 3. CSS Properties
**Text Properties:**
```css
p {
    color: #333333;
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    line-height: 1.5;
}
```

**Color Values:**
- Named: `red`, `blue`, `green`
- Hex: `#FF5733`
- RGB: `rgb(255, 87, 51)`
- RGBA: `rgba(255, 87, 51, 0.5)` (with transparency)

#### 4. The Box Model
Every element is a box with:
- **Content** - The actual content
- **Padding** - Space inside the box
- **Border** - Edge around padding
- **Margin** - Space outside the box

```css
.box {
    width: 300px;
    padding: 20px;
    border: 2px solid black;
    margin: 10px;
}
```

**Box-sizing:**
```css
* {
    box-sizing: border-box; /* Includes padding/border in width */
}
```

#### 5. Display and Positioning
**Display Types:**
- `block` - Takes full width, new line
- `inline` - Only takes needed width
- `inline-block` - Mix of both
- `none` - Hidden

**Positioning:**
```css
/* Static (default) */
position: static;

/* Relative - offset from normal position */
position: relative;
top: 10px;
left: 20px;

/* Absolute - relative to nearest positioned parent */
position: absolute;
top: 0;
right: 0;

/* Fixed - relative to viewport */
position: fixed;
bottom: 0;
```

#### 6. Flexbox Fundamentals
Flexbox creates flexible layouts:

```css
.container {
    display: flex;
    justify-content: center; /* Horizontal alignment */
    align-items: center; /* Vertical alignment */
    flex-direction: row; /* or column */
    flex-wrap: wrap; /* Allow wrapping */
}

.item {
    flex: 1; /* Grow to fill space */
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 200px;
}
```

**Common Flexbox Properties:**
- `justify-content` - Main axis alignment (space-between, center, etc.)
- `align-items` - Cross axis alignment
- `flex-direction` - Row or column
- `gap` - Space between items

#### 7. Common CSS Patterns
**Centering Content:**
```css
/* Flexbox centering */
.container {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Text centering */
text-align: center;
```

**Responsive Images:**
```css
img {
    max-width: 100%;
    height: auto;
}
```

### Exercises (Complete all 5)
1. Style a paragraph with custom font, color, and spacing.
2. Create a box with padding, border, and margin.
3. Center content using Flexbox.
4. Create a navigation bar with flexbox layout.
5. Style a button with hover effect using `:hover` pseudo-class.

### Assignment (Styled Landing Page)
Create a styled landing page:
- **Requirements:**
  - Use external CSS file
  - Style header, navigation, main content, footer
  - Use Flexbox for layout
  - Apply colors, fonts, and spacing
  - Create at least one button with hover effect
  - Make it visually appealing
  - Use proper CSS organization

- **Deliverable:** HTML file + CSS file
- **Word count:** N/A (focus on styling and design)

### Quiz Questions
**Multiple Choice:**
1. What does CSS stand for?
   a) Computer Style Sheets
   b) Cascading Style Sheets ✓
   c) Creative Style System
   d) Color Style Syntax

2. Which selector targets an element with class "intro"?
   a) `#intro`
   b) `.intro` ✓
   c) `intro`
   d) `<intro>`

3. In the box model, what is padding?
   a) Space outside the box
   b) Space inside the box ✓
   c) The border
   d) The content

4. What does `display: flex` do?
   a) Hides the element
   b) Creates a flexible layout ✓
   c) Makes text bold
   d) Changes color

5. Which property centers content horizontally in Flexbox?
   a) `align-items`
   b) `justify-content` ✓
   c) `flex-direction`
   d) `text-align`

6. What is the default value of `box-sizing`?
   a) `border-box`
   b) `content-box` ✓
   c) `padding-box`
   d) `margin-box`

**Short Answer:**
7. Name three ways to specify colors in CSS.
8. What is the difference between margin and padding?

### Reading Materials
- "CSS3 Basics" (PDF provided)
- MDN CSS Reference: developer.mozilla.org/en-US/docs/Web/CSS
- Flexbox Guide: css-tricks.com/snippets/css/a-guide-to-flexbox

### Resources
- CSS properties cheat sheet
- Flexbox visual guide
- Color picker tool
- Box model diagram
- CSS starter template

**Next Steps:** Complete exercises and assignment before proceeding to Module 3.

