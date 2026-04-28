# Debugging Report: "Send Invite" Button Issue

**Project:** TrackMyScaffolding
**Stack:** React + Vite (Vercel) | Express.js + PocketBase (Railway)
**Issue:** `POST /site-team/invite` fails silently (no email, no success, no visible UI error).

---

## 🔍 1. Most Likely Causes (Ranked)

1. **CORS Policy Blocking the Request (Frontend/Backend)**
   - **Why:** Browsers block cross-origin requests (Vercel -> Railway) if the Express API doesn't explicitly return the correct `Access-Control-Allow-Origin` headers. When a CORS error occurs, the `fetch`/`axios` call throws a TypeError. If your React component lacks a `catch` block for this, the UI silently hangs without showing an error message.
2. **Silent Failure in React `onSubmit` (Frontend)**
   - **Why:** If the button is inside a `<form>` and `e.preventDefault()` is missing, the page might be silently refreshing. Alternatively, if the API call is in a `try/catch` block but the `catch` block doesn't update any state (e.g., `setError(e.message)`), the user sees nothing.
3. **Silent Failure in Express `authMiddleware` (Backend)**
   - **Why:** If the JWT decoding fails (e.g., invalid signature, expired token) and the middleware calls `next(err)` or `res.status(401).send()` but the frontend doesn't handle non-200 responses, the UI will ignore it.

---

## 🛠 2. Immediate Debugging Steps

### A. Frontend (Browser)
1. **Open Developer Tools (F12) -> Network Tab.**
   - Click the "Send Invite" button.
   - Did the request fire? 
   - Is there a preflight `OPTIONS` request? Did it return `204 No Content` or fail with CORS errors?
   - Look at the `POST /site-team/invite` status code. Is it `(blocked:cors)`, `401`, `500`, or `200`?
2. **Open Developer Tools -> Console Tab.**
   - Look for red text. A CORS error will be explicitly stated here: *"Access to fetch at... from origin... has been blocked by CORS policy"*.
   - Look for unhandled promise rejections.

### B. Backend (Railway Logs)
1. **Check Railway Express API Logs.**
   - Do you see the incoming `OPTIONS` or `POST` request hitting the server?
   - If the request hits the server but stops at the `authMiddleware`, add a `console.log("Token decoded:", decoded)` to see if it's silently failing there.
   - If the request never hits the Railway logs, it's 100% a CORS issue or an incorrect `VITE_API_URL` (e.g., missing `/` at the end or `/api` prefix).

---

## 💻 3. Code Fixes to Apply

### Fix 1: Enable CORS in Express
If you haven't explicitly configured CORS in your Express app, Railway will block requests from Vercel.

```javascript
// server.js or app.js (Express)
const cors = require('cors');

app.use(cors({
  origin: 'https://trackmyscaffolding.com', // Explicitly allow your Vercel domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Fix 2: Catch Errors in React UI
Ensure your frontend `onSubmit` handles network failures, CORS errors, and non-200 API responses so it never fails "silently".

```javascript
// InviteModal.jsx
const handleInvite = async (e) => {
  e.preventDefault(); // Prevent page reload
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/site-team/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pb.authStore.token}`
      },
      body: JSON.stringify({ email: targetEmail })
    });

    if (!response.ok) {
      // Backend returned 400, 401, 500, etc.
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server Error: ${response.status}`);
    }

    // Success
    setSuccess(true);
    closeModal();
    
  } catch (err) {
    // Network errors, CORS, or thrown errors land here
    console.error("Invite failed:", err);
    setError(err.message || "Failed to send invite. Please check your connection.");
  } finally {
    setIsLoading(false);
  }
};
```

### Fix 3: Robust Express Auth Middleware
Ensure your middleware doesn't fail silently. It must explicitly return a 401 so the frontend knows what happened.

```javascript
// authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    
    // Attempt to decode PocketBase JWT without verifying signature (if relying on PB for verification)
    // OR verify if you have the PB secret. 
    const decoded = jwt.decode(token); 
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid PocketBase token structure" });
    }

    // Check expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ message: "Token expired" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ message: "Authentication failed", error: err.message });
  }
};
```
