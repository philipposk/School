# Module 1: HTML Foundations

## Title: Building Your First Webpage with HTML5

### Lecture Content

HTML (HyperText Markup Language) is the foundation of every website. It provides the structure and content that browsers display. In this module, you'll learn to write semantic HTML5 that creates accessible, well-structured web pages.

#### 1. What is HTML?
HTML is a markup language that uses tags to structure content. It tells browsers what each part of your page is (heading, paragraph, image, etc.).

**Basic HTML Document Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Webpage</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is my first paragraph.</p>
</body>
</html>
```

#### 2. HTML5 Semantic Elements
Semantic elements describe their meaning clearly:
- `<header>` - Site header or section header
- `<nav>` - Navigation links
- `<main>` - Main content area
- `<article>` - Independent content piece
- `<section>` - Thematic grouping
- `<aside>` - Sidebar content
- `<footer>` - Site or section footer

**Example:**
```html
<header>
    <h1>My Portfolio</h1>
    <nav>
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
    </nav>
</header>
<main>
    <section id="about">
        <h2>About Me</h2>
        <p>I'm learning web development!</p>
    </section>
</main>
<footer>
    <p>&copy; 2024 My Portfolio</p>
</footer>
```

#### 3. Text Elements
- `<h1>` to `<h6>` - Headings (h1 is most important)
- `<p>` - Paragraphs
- `<strong>` - Important text (bold)
- `<em>` - Emphasized text (italic)
- `<br>` - Line break
- `<hr>` - Horizontal rule

#### 4. Lists
**Ordered List:**
```html
<ol>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
</ol>
```

**Unordered List:**
```html
<ul>
    <li>Bullet point</li>
    <li>Another point</li>
</ul>
```

#### 5. Links and Images
**Links:**
```html
<a href="https://example.com">Visit Example</a>
<a href="#section">Jump to section</a>
<a href="mailto:email@example.com">Email me</a>
```

**Images:**
```html
<img src="photo.jpg" alt="Description of image">
```

#### 6. Forms
Basic form structure:
```html
<form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
    <button type="submit">Submit</button>
</form>
```

**Common Input Types:**
- `text` - Text input
- `email` - Email validation
- `password` - Hidden text
- `number` - Numeric input
- `checkbox` - Checkbox
- `radio` - Radio button
- `date` - Date picker

#### 7. Accessibility Basics
- Use semantic HTML
- Add `alt` text to images
- Use proper heading hierarchy (h1 → h2 → h3)
- Label form inputs
- Use `aria-label` when needed

### Exercises (Complete all 5)
1. Create an HTML document with your name, a short bio, and a list of hobbies.
2. Add a navigation menu with 3 links (About, Projects, Contact).
3. Insert an image with proper alt text.
4. Create a contact form with name, email, and message fields.
5. Structure a blog post using semantic elements (header, article, footer).

### Assignment (Personal Bio Page)
Create a complete HTML page about yourself:
- **Requirements:**
  - Use semantic HTML5 elements
  - Include: header with navigation, main content with sections, footer
  - Add at least one image
  - Include a contact form
  - Use proper heading hierarchy
  - Add alt text to images
  - Minimum 3 sections (About, Skills, Contact)

- **Deliverable:** HTML file (.html) with all content
- **Word count:** N/A (focus on structure and content)

### Quiz Questions
**Multiple Choice:**
1. What does HTML stand for?
   a) HyperText Markup Language ✓
   b) High-Level Text Language
   c) Home Tool Markup Language
   d) Hyperlink Text Markup

2. Which tag is used for the most important heading?
   a) `<h6>`
   b) `<h1>` ✓
   c) `<heading>`
   d) `<title>`

3. What is the purpose of semantic HTML?
   a) Makes code prettier
   b) Describes meaning clearly ✓
   c) Adds styling
   d) Improves speed

4. Which attribute is required for images?
   a) `src`
   b) `alt` ✓
   c) `width`
   d) `height`

5. What does `<nav>` represent?
   a) Navigation links ✓
   b) Main content
   c) Footer
   d) Sidebar

6. Which form input type validates email format?
   a) `text`
   b) `email` ✓
   c) `mail`
   d) `input`

**Short Answer:**
7. Name three HTML5 semantic elements.
8. Why is alt text important for images?

### Reading Materials
- "HTML5 Basics" (PDF provided)
- MDN HTML Reference: developer.mozilla.org/en-US/docs/Web/HTML
- Recommended: HTML5 specification overview

### Resources
- HTML5 semantic elements cheat sheet
- Form input types reference
- Accessibility checklist
- Starter HTML template

**Next Steps:** Complete exercises and assignment before proceeding to Module 2.

