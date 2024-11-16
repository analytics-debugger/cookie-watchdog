
# Cookie Watchdog 🕵️‍♂️🍪

**Cookie Watchdog** is a lightweight JavaScript library for monitoring cookie availability and detecting changes in real-time. With support for the modern `cookieStore` API, this library makes it easy to track cookies and respond to changes, creations, and deletions.

---

## Features

- Monitor specific cookies for changes.
- Detect cookie creation, updates, and deletions.
- Notify with detailed information on cookie changes.
- Clean and extensible API for adding and removing watchers.

---

## Installation

### Via npm:
```bash
npm install cookie-watchdog
```

### Via Browser:
Include the library directly in your HTML:
```html
<script src="/cookie-watchdog.js"></script>
```

---

## Usage

### Import the library
```javascript
import CookieWatchdog from 'cookie-watchdog';
```

Or, if you're using the CDN version:
```javascript
const CookieWatchdog = window.CookieWatchdog;
```

### Add a Watcher
Monitor a specific cookie for changes:
```javascript
CookieWatchdog.watch('session_id', (change) => {
    console.log('Cookie change detected:', change);
});
```

### Example Output
When the `session_id` cookie changes, you might see:
```javascript
{
    name: "session_id",
    value: "new_value",
    type: "updated" // Possible types: "created", "updated", "deleted", "existing" or "missing"
}
```

### Remove a Watcher
Stop monitoring a specific cookie:
Listener will be removed itself when there are not more watched cookies
```javascript
CookieWatchdog.unwatch('session_id');
```

---

## API

### `watch(cookieName, callback, untilReady = false)`
- **`cookieName`**: Name of the cookie to monitor.
- **`callback`**: Function to invoke when the cookie changes.
- **`untilReady`** (optional): If `true`, stops listening after the first event that matches the criteria (default: `false`).

#### Example:
```javascript
CookieWatchdog.watch('user_token', (change) => {
    console.log(`Token changed:`, change);
}, true);
```

---

### `unwatch(cookieName, callback)`
- **`cookieName`**: Name of the cookie to stop monitoring.

#### Example:
```javascript
CookieWatchdog.unwatch('user_token');
```

---

## Compatibility

Cookie Watchdog relies on the `cookieStore` API, which is supported in modern browsers. If the `cookieStore` API is not available, the library will log an error and fail gracefully.

TO-DO cookieStore polyfill based on a pulling for proper support on Safari and Firefox

## Contributing

We welcome contributions to improve Cookie Watchdog! Feel free to open issues, submit pull requests, or suggest improvements.

---

## 💖 Support the Project

If you enjoy this project and would like to support me, consider buying me a coffee or becoming a sponsor:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor%20on-GitHub%20Sponsors-0e7f8e?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/thyngster)  
[![Ko-fi](https://img.shields.io/badge/Support%20on-Ko--fi-FF5F5F?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/thyngster)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
