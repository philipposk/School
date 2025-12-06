# Module 6: JavaScript Advanced & APIs

## Title: Working with APIs and Async JavaScript

### Lecture Content

Modern web applications need to fetch data from servers and handle asynchronous operations. In this module, you'll learn about Promises, async/await, the Fetch API, and how to integrate external data into your applications.

#### 1. Asynchronous JavaScript
JavaScript is single-threaded but handles async operations:

**Callbacks (old way):**
```javascript
setTimeout(function() {
    console.log("This runs after 1 second");
}, 1000);
```

**Problems with callbacks:**
- Callback hell (nested callbacks)
- Hard to read and maintain
- Error handling is difficult

#### 2. Promises
Promises represent future values:

```javascript
// Creating a promise
let promise = new Promise(function(resolve, reject) {
    // Async operation
    setTimeout(function() {
        resolve("Success!");
        // or reject("Error!");
    }, 1000);
});

// Using promises
promise
    .then(function(result) {
        console.log(result); // "Success!"
    })
    .catch(function(error) {
        console.error(error);
    });
```

**Promise States:**
- Pending - Initial state
- Fulfilled - Operation succeeded
- Rejected - Operation failed

#### 3. Async/Await
Modern way to handle async code:

```javascript
// Async function
async function fetchData() {
    try {
        let response = await fetch("https://api.example.com/data");
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Using async function
fetchData().then(data => {
    console.log(data);
});
```

**Benefits:**
- Cleaner syntax
- Easier error handling
- More readable code

#### 4. Fetch API
Fetch data from servers:

```javascript
// Basic fetch
fetch("https://api.example.com/data")
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });

// With async/await
async function getData() {
    try {
        let response = await fetch("https://api.example.com/data");
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
    }
}
```

**Fetch Options:**
```javascript
fetch("https://api.example.com/data", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: "John",
        age: 30
    })
});
```

#### 5. Working with JSON
JSON (JavaScript Object Notation) is the standard data format:

```javascript
// Converting to JSON
let obj = {name: "John", age: 30};
let jsonString = JSON.stringify(obj);
// '{"name":"John","age":30}'

// Parsing JSON
let parsed = JSON.parse(jsonString);
// {name: "John", age: 30}
```

**Common JSON Operations:**
```javascript
// Fetch returns JSON
let response = await fetch("api/data.json");
let data = await response.json();

// Send JSON
fetch("api/data", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
});
```

#### 6. Error Handling
Handle errors properly:

```javascript
// Try/catch with async
async function fetchData() {
    try {
        let response = await fetch("https://api.example.com/data");
        
        if (!response.ok) {
            throw new Error("HTTP error! status: " + response.status);
        }
        
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
        // Handle error (show message to user, etc.)
    }
}
```

**Response Status:**
```javascript
fetch("api/data")
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Network response was not ok");
    })
    .then(data => console.log(data))
    .catch(error => console.error("Error:", error));
```

#### 7. API Integration Examples
**Weather API:**
```javascript
async function getWeather(city) {
    try {
        let apiKey = "your-api-key";
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        
        let response = await fetch(url);
        let data = await response.json();
        
        return {
            city: data.name,
            temp: data.main.temp,
            description: data.weather[0].description
        };
    } catch (error) {
        console.error("Weather fetch error:", error);
    }
}
```

**Displaying API Data:**
```javascript
async function displayData() {
    let data = await getWeather("London");
    
    let container = document.querySelector("#weather");
    container.innerHTML = `
        <h2>${data.city}</h2>
        <p>Temperature: ${data.temp}°C</p>
        <p>${data.description}</p>
    `;
}
```

#### 8. CORS and API Keys
**CORS (Cross-Origin Resource Sharing):**
- Browsers block requests to different domains
- APIs must allow CORS
- Some APIs require API keys

**Using API Keys:**
```javascript
// Store API key securely (not in code for production!)
const API_KEY = "your-api-key";

fetch(`https://api.example.com/data?api_key=${API_KEY}`)
```

**Free APIs to Practice:**
- JSONPlaceholder (fake REST API)
- OpenWeatherMap (weather data)
- REST Countries (country data)
- Dog API (dog images)
- Cat API (cat images)

### Exercises (Complete all 5)
1. Use fetch to get data from JSONPlaceholder API and display it.
2. Create an async function that fetches user data and handles errors.
3. Build a function that fetches and displays multiple API responses.
4. Add loading states while fetching data.
5. Create error handling that shows user-friendly messages.

### Assignment (Weather App with API)
Build a weather application:
- **Requirements:**
  - Fetch weather data from an API (OpenWeatherMap or similar)
  - Display current weather for a city
  - Handle API errors gracefully
  - Show loading state
  - Allow user to search for different cities
  - Display temperature, conditions, and other relevant data
  - Responsive design
  - Clean, readable code

- **Deliverable:** HTML + CSS + JavaScript files
- **Word count:** N/A (focus on API integration)

### Quiz Questions
**Multiple Choice:**
1. What does async/await do?
   a) Makes code synchronous
   b) Handles asynchronous operations ✓
   c) Speeds up code
   d) Deletes promises

2. What does `fetch()` return?
   a) JSON data
   b) A Promise ✓
   c) An object
   d) A string

3. What is JSON?
   a) JavaScript Object Notation ✓
   b) Java Script Object Network
   c) JavaScript Online Network
   d) Just Simple Object Notation

4. What does `response.json()` do?
   a) Converts response to JSON string
   b) Parses JSON response to object ✓
   c) Validates JSON
   d) Sends JSON

5. What is CORS?
   a) Cross-Origin Resource Sharing ✓
   b) Cross-Origin Request System
   c) Client Origin Resource Sharing
   d) Code Origin Request System

6. What does `await` do?
   a) Waits for promise to resolve ✓
   b) Stops execution
   c) Creates delay
   d) Handles errors

**Short Answer:**
7. What is the difference between Promises and async/await?
8. Why is error handling important when working with APIs?

### Reading Materials
- "Async JavaScript Guide" (PDF provided)
- MDN Fetch API: developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Promises Guide: developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises

### Resources
- Fetch API cheat sheet
- Async/await examples
- Error handling patterns
- Free API list
- JSON guide
- CORS explanation

**Next Steps:** Complete exercises and assignment before proceeding to Module 7.

