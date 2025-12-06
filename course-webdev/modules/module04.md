# Module 4: JavaScript Basics

## Title: Adding Interactivity with JavaScript

### Lecture Content

JavaScript makes websites interactive. It can respond to user actions, manipulate content, and create dynamic experiences. In this module, you'll learn JavaScript fundamentals: variables, functions, control flow, and DOM manipulation.

#### 1. What is JavaScript?
JavaScript is a programming language that runs in browsers. It can:
- Change HTML content
- Respond to user events
- Validate forms
- Create animations
- Fetch data from servers

**Adding JavaScript:**
```html
<!-- External file (recommended) -->
<script src="script.js"></script>

<!-- Internal -->
<script>
    // JavaScript code here
</script>
```

#### 2. Variables and Data Types
**Variables:**
```javascript
// let - can be reassigned
let name = "John";
name = "Jane";

// const - cannot be reassigned
const age = 25;

// var - old way (avoid in modern code)
var oldWay = "don't use";
```

**Data Types:**
```javascript
// String
let text = "Hello World";

// Number
let count = 42;
let price = 19.99;

// Boolean
let isActive = true;
let isComplete = false;

// Array
let colors = ["red", "green", "blue"];

// Object
let person = {
    name: "John",
    age: 30
};

// Null and Undefined
let empty = null;
let notSet = undefined;
```

#### 3. Operators
**Arithmetic:**
```javascript
let sum = 5 + 3;      // 8
let diff = 10 - 4;    // 6
let product = 3 * 4;  // 12
let quotient = 12 / 3; // 4
let remainder = 10 % 3; // 1
```

**Comparison:**
```javascript
5 > 3    // true
5 < 3    // false
5 === 5  // true (strict equality)
5 !== 3  // true
```

**Logical:**
```javascript
true && true   // true (AND)
true || false  // true (OR)
!true          // false (NOT)
```

#### 4. Functions
**Function Declaration:**
```javascript
function greet(name) {
    return "Hello, " + name;
}

greet("John"); // "Hello, John"
```

**Arrow Functions (ES6):**
```javascript
const greet = (name) => {
    return "Hello, " + name;
};

// Shorter version
const greet = name => "Hello, " + name;
```

**Function Parameters:**
```javascript
function add(a, b) {
    return a + b;
}

add(5, 3); // 8
```

#### 5. Control Flow
**If/Else:**
```javascript
let age = 18;

if (age >= 18) {
    console.log("Adult");
} else {
    console.log("Minor");
}
```

**Switch:**
```javascript
let day = "Monday";

switch(day) {
    case "Monday":
        console.log("Start of week");
        break;
    case "Friday":
        console.log("Weekend coming!");
        break;
    default:
        console.log("Midweek");
}
```

**Loops:**
```javascript
// For loop
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// While loop
let count = 0;
while (count < 5) {
    console.log(count);
    count++;
}

// For...of (arrays)
let colors = ["red", "green", "blue"];
for (let color of colors) {
    console.log(color);
}
```

#### 6. DOM Manipulation
The DOM (Document Object Model) represents HTML as objects.

**Selecting Elements:**
```javascript
// By ID
let header = document.getElementById("header");

// By class
let items = document.getElementsByClassName("item");

// By tag
let paragraphs = document.getElementsByTagName("p");

// Modern selectors (recommended)
let element = document.querySelector("#header");
let allItems = document.querySelectorAll(".item");
```

**Changing Content:**
```javascript
// Change text
element.textContent = "New text";

// Change HTML
element.innerHTML = "<strong>Bold text</strong>";

// Change attributes
element.setAttribute("class", "new-class");
element.id = "new-id";
```

**Creating Elements:**
```javascript
// Create element
let newDiv = document.createElement("div");
newDiv.textContent = "New content";

// Append to page
document.body.appendChild(newDiv);
```

#### 7. Event Listeners
Respond to user actions:

```javascript
// Click event
let button = document.querySelector("button");
button.addEventListener("click", function() {
    alert("Button clicked!");
});

// Arrow function version
button.addEventListener("click", () => {
    console.log("Clicked!");
});

// Other events
element.addEventListener("mouseover", handleMouseOver);
input.addEventListener("input", handleInput);
form.addEventListener("submit", handleSubmit);
```

**Common Events:**
- `click` - Mouse click
- `mouseover` - Mouse enters element
- `mouseout` - Mouse leaves element
- `input` - Input field changes
- `submit` - Form submitted
- `keydown` - Key pressed

### Exercises (Complete all 5)
1. Create variables for your name, age, and favorite color, then log them.
2. Write a function that takes two numbers and returns their sum.
3. Create an if/else statement that checks if a number is positive or negative.
4. Select a button element and add a click event listener that changes its text.
5. Create a new paragraph element and add it to the page using JavaScript.

### Assignment (Interactive Calculator or Game)
Build an interactive web application:
- **Requirements:**
  - Use HTML for structure
  - Style with CSS
  - Add JavaScript interactivity
  - Respond to user clicks/input
  - Update content dynamically
  - Include at least 3 interactive features
  - Clean, functional design

**Options:**
- Simple calculator (add, subtract, multiply, divide)
- Number guessing game
- Interactive quiz
- Counter with increment/decrement buttons

- **Deliverable:** HTML + CSS + JavaScript files
- **Word count:** N/A (focus on functionality)

### Quiz Questions
**Multiple Choice:**
1. Which keyword creates a variable that cannot be reassigned?
   a) `let`
   b) `const` ✓
   c) `var`
   d) `variable`

2. What does `===` check?
   a) Value equality only
   b) Value and type equality ✓
   c) Assignment
   d) Comparison

3. Which method selects an element by ID?
   a) `document.querySelector()`
   b) `document.getElementById()` ✓
   c) `document.getElement()`
   d) `document.select()`

4. What does `addEventListener` do?
   a) Adds HTML content
   b) Listens for events ✓
   c) Creates elements
   d) Changes styles

5. Which loop iterates through array items?
   a) `for...in`
   b) `for...of` ✓
   c) `while...of`
   d) `do...for`

6. What is the DOM?
   a) Document Object Model ✓
   b) Data Object Method
   c) Dynamic Object Manager
   d) Document Order Method

**Short Answer:**
7. What is the difference between `let` and `const`?
8. Name three JavaScript events you can listen for.

### Reading Materials
- "JavaScript Fundamentals" (PDF provided)
- MDN JavaScript Guide: developer.mozilla.org/en-US/docs/Web/JavaScript
- JavaScript.info (free online course)

### Resources
- JavaScript cheat sheet
- DOM manipulation reference
- Event types list
- Code examples library
- Debugging guide

**Next Steps:** Complete exercises and assignment before proceeding to Module 5.

