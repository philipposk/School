# Module 5: JavaScript Intermediate

## Title: Building Dynamic Applications

### Lecture Content

Now that you understand JavaScript basics, let's dive deeper into arrays, objects, ES6+ features, and advanced DOM manipulation. You'll learn to build more complex, dynamic web applications.

#### 1. Arrays
Arrays store multiple values:

```javascript
// Creating arrays
let fruits = ["apple", "banana", "orange"];
let numbers = [1, 2, 3, 4, 5];

// Accessing elements
fruits[0]; // "apple"
fruits[1]; // "banana"

// Array methods
fruits.length;                    // 3
fruits.push("grape");             // Add to end
fruits.pop();                     // Remove from end
fruits.unshift("mango");          // Add to beginning
fruits.shift();                   // Remove from beginning
fruits.indexOf("banana");         // 1
fruits.includes("apple");         // true
```

**Array Iteration:**
```javascript
// forEach
fruits.forEach(fruit => {
    console.log(fruit);
});

// map - creates new array
let upperFruits = fruits.map(fruit => fruit.toUpperCase());

// filter - creates filtered array
let longFruits = fruits.filter(fruit => fruit.length > 5);

// find - finds first match
let found = fruits.find(fruit => fruit.startsWith("a"));
```

#### 2. Objects
Objects store key-value pairs:

```javascript
// Creating objects
let person = {
    name: "John",
    age: 30,
    city: "New York"
};

// Accessing properties
person.name;        // "John"
person["age"];      // 30

// Adding properties
person.email = "john@example.com";
person["phone"] = "123-456-7890";

// Methods in objects
let person = {
    name: "John",
    greet: function() {
        return "Hello, " + this.name;
    }
};

person.greet(); // "Hello, John"
```

**Object Methods:**
```javascript
// Object.keys() - get all keys
Object.keys(person); // ["name", "age", "city"]

// Object.values() - get all values
Object.values(person); // ["John", 30, "New York"]

// Object.entries() - get key-value pairs
Object.entries(person); // [["name", "John"], ["age", 30], ...]
```

#### 3. ES6+ Features
**Arrow Functions:**
```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;
```

**Template Literals:**
```javascript
let name = "John";
let message = `Hello, ${name}!`; // "Hello, John!"

let multiLine = `
    Line 1
    Line 2
    Line 3
`;
```

**Destructuring:**
```javascript
// Array destructuring
let [first, second] = ["apple", "banana"];

// Object destructuring
let {name, age} = person;
// Same as: let name = person.name; let age = person.age;
```

**Spread Operator:**
```javascript
// Arrays
let arr1 = [1, 2, 3];
let arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

// Objects
let obj1 = {a: 1, b: 2};
let obj2 = {...obj1, c: 3}; // {a: 1, b: 2, c: 3}
```

#### 4. Advanced Event Handling
**Event Object:**
```javascript
button.addEventListener("click", function(event) {
    console.log(event.target);      // Element that was clicked
    console.log(event.type);        // "click"
    event.preventDefault();         // Prevent default behavior
    event.stopPropagation();        // Stop event bubbling
});
```

**Event Delegation:**
```javascript
// Listen on parent, handle children
let list = document.querySelector("ul");
list.addEventListener("click", function(event) {
    if (event.target.tagName === "LI") {
        console.log("List item clicked:", event.target.textContent);
    }
});
```

#### 5. Form Validation
Validate user input:

```javascript
let form = document.querySelector("form");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    
    // Validation
    if (email === "") {
        alert("Email is required");
        return;
    }
    
    if (!email.includes("@")) {
        alert("Invalid email format");
        return;
    }
    
    if (password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
    }
    
    // Form is valid
    console.log("Form submitted successfully");
});
```

**HTML5 Validation:**
```html
<input type="email" required>
<input type="password" minlength="8" required>
<input type="number" min="0" max="100">
```

#### 6. Local Storage
Store data in browser:

```javascript
// Save data
localStorage.setItem("name", "John");
localStorage.setItem("user", JSON.stringify({name: "John", age: 30}));

// Get data
let name = localStorage.getItem("name");
let user = JSON.parse(localStorage.getItem("user"));

// Remove data
localStorage.removeItem("name");
localStorage.clear(); // Remove all
```

#### 7. Dynamic Content Creation
Create and manipulate content:

```javascript
// Create list from array
let fruits = ["apple", "banana", "orange"];
let list = document.createElement("ul");

fruits.forEach(fruit => {
    let item = document.createElement("li");
    item.textContent = fruit;
    list.appendChild(item);
});

document.body.appendChild(list);
```

### Exercises (Complete all 5)
1. Create an array of objects (e.g., products with name and price) and display them.
2. Use array methods (map, filter) to manipulate data.
3. Build a form with validation that shows error messages.
4. Use localStorage to save and retrieve user preferences.
5. Create dynamic content that updates based on user input.

### Assignment (Todo List Application)
Build a todo list application:
- **Requirements:**
  - Add new todos
  - Mark todos as complete
  - Delete todos
  - Filter todos (all, active, completed)
  - Save todos to localStorage
  - Responsive design
  - Clean, intuitive interface

- **Deliverable:** HTML + CSS + JavaScript files
- **Word count:** N/A (focus on functionality)

### Quiz Questions
**Multiple Choice:**
1. Which array method creates a new array?
   a) `forEach`
   b) `map` ✓
   c) `push`
   d) `pop`

2. What does destructuring do?
   a) Deletes variables
   b) Extracts values from arrays/objects ✓
   c) Combines arrays
   d) Sorts data

3. Template literals use:
   a) Single quotes
   b) Double quotes
   c) Backticks ✓
   d) Parentheses

4. What does `localStorage.setItem()` do?
   a) Gets data
   b) Saves data ✓
   c) Deletes data
   d) Updates data

5. Event delegation means:
   a) Listening on parent for child events ✓
   b) Multiple events
   c) Event cancellation
   d) Event timing

6. The spread operator is:
   a) `...` ✓
   b) `*`
   c) `++`
   d) `&&`

**Short Answer:**
7. What is the difference between `map()` and `forEach()`?
8. Name three ES6+ features you learned.

### Reading Materials
- "JavaScript Intermediate Guide" (PDF provided)
- MDN Array Methods: developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
- ES6 Features Guide: es6-features.org

### Resources
- Array methods cheat sheet
- Object methods reference
- ES6+ features guide
- Form validation examples
- LocalStorage guide

**Next Steps:** Complete exercises and assignment before proceeding to Module 6.

