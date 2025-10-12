# Authentication Debugging Guide

## 🐛 Issue: Redirect to Sign-In Despite Valid Token

You're experiencing an issue where you sign in successfully, the token appears in browser DevTools, but when accessing protected pages you're immediately redirected back to the sign-in page.

## 🔍 Debugging Steps Added

I've added comprehensive logging throughout the authentication flow. Open your browser console and look for these log messages:

### 1. **Sign-In Process** (Look for these emojis)

```
🔐 [SignIn] Attempting to sign in: user@example.com
📡 [SignIn] Response received: { status: 200, data: {...} }
🎫 [SignIn] Token received: eyJhbGciOiJIUzI1NiIsInR...
👤 [SignIn] User data: { id: "...", email: "...", role: "..." }
⏰ [SignIn] Cookie expires in days: 0.375
🍪 [SignIn] Cookie set, verifying: EXISTS
✅ [SignIn] User state updated, authenticated
🔀 [SignIn] Redirecting to: /s/profile
```

### 2. **Session Check** (On page load/refresh)

```
🔍 [Auth] Checking session, cookie exists: true
📡 [Auth] Fetching session from /api/auth/session
📥 [Auth] Session response status: 200
📦 [Auth] Session data: { authenticated: true, user: {...} }
✅ [Auth] User authenticated: { userId: "...", email: "...", role: "..." }
🏁 [Auth] Session check complete
```

### 3. **Session API Endpoint**

```
🔍 [Session API] Checking session
🍪 [Session API] Token from cookie: eyJhbGciOiJIUzI1NiIs...
🔐 [Session API] Verifying token...
✅ [Session API] User authenticated: { userId: "...", email: "...", role: "..." }
```

### 4. **Token Verification**

```
🔐 [verifyToken] Verifying token with JWT_SECRET: SET
✅ [verifyToken] Token valid, decoded: { userId: "...", email: "...", role: "..." }
```

### 5. **Middleware** (When accessing protected routes)

```
🔒 [Middleware] Request to: /s/hub
🍪 [Middleware] Token exists: true
🔐 [Middleware] Protected route detected
🔍 [Middleware] Verifying token...
✅ [Middleware] Token valid, user: user@example.com role: JOB_SEEKER
✅ [Middleware] Allowing access to protected route
```

## 🚨 Common Issues & Solutions

### Issue 1: ❌ JWT_SECRET Not Set

**Symptoms:**

```
🔐 [verifyToken] Verifying token with JWT_SECRET: NOT SET
❌ [verifyToken] Token verification failed: ...
```

**Solution:**

```bash
# Add to your .env file
JWT_SECRET="your-super-secret-key-at-least-32-chars-long"

# Restart your development server
npm run dev
```

### Issue 2: ❌ Cookie Not Being Set

**Symptoms:**

```
🍪 [SignIn] Cookie set, verifying: MISSING
```

**Causes:**

- Browser blocking cookies
- Secure flag issue in development
- SameSite policy

**Solution:**

```javascript
// Check in browser console:
document.cookie;

// Check js-cookie library:
Cookies.get("koneksi_karir_token");

// Try manually setting cookie:
Cookies.set("test", "value", { path: "/" });
Cookies.get("test"); // Should return "value"
```

### Issue 3: ❌ Token Verification Failing

**Symptoms:**

```
❌ [verifyToken] Token verification failed: jwt malformed
OR
❌ [verifyToken] Token verification failed: invalid signature
```

**Causes:**

- JWT_SECRET mismatch between sign and verify
- Token corrupted
- Token expired

**Solution:**

```bash
# 1. Check your .env file has JWT_SECRET
cat .env | grep JWT_SECRET

# 2. Restart dev server after adding JWT_SECRET
npm run dev

# 3. Clear all cookies and sign in again
```

### Issue 4: ❌ Cookie Not Sent with Requests

**Symptoms:**

```
🍪 [Session API] Token from cookie: null
🍪 [Middleware] Token exists: false
```

**Causes:**

- Missing `credentials: "include"`
- Browser security policies
- Path mismatch

**Solution:**
All fetch requests should have `credentials: "include"`:

```typescript
fetch("/api/auth/session", {
  credentials: "include", // ✅ This is required
});
```

### Issue 5: ❌ Middleware Redirecting Valid Tokens

**Symptoms:**

```
🔒 [Middleware] Request to: /s/hub
🍪 [Middleware] Token exists: true
🔍 [Middleware] Verifying token...
❌ [Middleware] Token invalid, redirecting to signin
```

**Causes:**

- Token expired
- JWT_SECRET mismatch
- Malformed token

**Debug:**

```javascript
// In browser console, decode the token:
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

const token = Cookies.get("koneksi_karir_token");
const payload = parseJwt(token);
console.log("Token payload:", payload);
console.log("Expires at:", new Date(payload.exp * 1000));
console.log("Is expired?", Date.now() > payload.exp * 1000);
```

### Issue 6: ❌ Redirect Loop

**Symptoms:**

- Page keeps redirecting between /s/hub and /auth/signin
- Browser console shows repeated logs

**Causes:**

- Auth check triggering before AuthProvider initializes
- Race condition in useEffect

**Solution:**
Check the loading states in console:

```
🔍 [Auth] Checking session, cookie exists: true
...
🏁 [Auth] Session check complete
```

Make sure `isLoading` becomes `false` after session check completes.

## 🧪 Manual Testing Checklist

### Step 1: Clear Everything

```javascript
// In browser console:
// 1. Clear all cookies
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// 2. Clear localStorage
localStorage.clear();

// 3. Refresh page
location.reload();
```

### Step 2: Sign In Fresh

1. Open browser DevTools → Console
2. Navigate to `/auth/signin`
3. Enter credentials and sign in
4. Watch console logs for the sign-in flow
5. Check Application → Cookies for `koneksi_karir_token`

### Step 3: Test Protected Route

1. Navigate to `/s/hub` or `/s/profile`
2. Watch console logs for:
   - Session check logs
   - Middleware logs
   - Token verification logs
3. Verify you're NOT redirected to sign-in

### Step 4: Check Token Validity

```javascript
// In browser console:
const token = Cookies.get("koneksi_karir_token");
console.log("Token exists:", !!token);

if (token) {
  const parts = token.split(".");
  console.log("Token parts:", parts.length); // Should be 3 (header.payload.signature)

  // Decode payload
  const payload = JSON.parse(atob(parts[1]));
  console.log("Token payload:", payload);
  console.log("Issued at:", new Date(payload.iat * 1000));
  console.log("Expires at:", new Date(payload.exp * 1000));
  console.log("Is expired?", Date.now() / 1000 > payload.exp);
}
```

### Step 5: Test Middleware

1. With DevTools Network tab open
2. Navigate to a protected route
3. Look for a redirect (307) or normal request (200)
4. Check console for middleware logs

## 📊 Expected Log Flow (Success Case)

### Complete Successful Flow:

```
// 1. Sign In
🔐 [SignIn] Attempting to sign in: user@example.com
📡 [SignIn] Response received: { status: 200 }
🎫 [SignIn] Token received: eyJhbGc...
👤 [SignIn] User data: { id: "...", email: "...", role: "JOB_SEEKER" }
⏰ [SignIn] Cookie expires in days: 0.375
🍪 [SignIn] Cookie set, verifying: EXISTS
✅ [SignIn] User state updated, authenticated
🔀 [SignIn] Redirecting to: /s/profile

// 2. Page Navigation (e.g., to /s/hub)
🔒 [Middleware] Request to: /s/hub
🍪 [Middleware] Token exists: true
🔐 [Middleware] Protected route detected
🔍 [Middleware] Verifying token...
🔐 [verifyToken] Verifying token with JWT_SECRET: SET
✅ [verifyToken] Token valid, decoded: { userId: "...", email: "...", role: "JOB_SEEKER" }
✅ [Middleware] Token valid, user: user@example.com role: JOB_SEEKER
✅ [Middleware] Allowing access to protected route

// 3. AuthProvider Session Check
🔍 [Auth] Checking session, cookie exists: true
📡 [Auth] Fetching session from /api/auth/session
🔍 [Session API] Checking session
🍪 [Session API] Token from cookie: eyJhbGc...
🔐 [Session API] Verifying token...
🔐 [verifyToken] Verifying token with JWT_SECRET: SET
✅ [verifyToken] Token valid, decoded: { userId: "...", email: "...", role: "JOB_SEEKER" }
✅ [Session API] User authenticated: { userId: "...", email: "...", role: "JOB_SEEKER" }
📥 [Auth] Session response status: 200
📦 [Auth] Session data: { authenticated: true, user: {...} }
✅ [Auth] User authenticated: { userId: "...", email: "...", role: "JOB_SEEKER" }
🏁 [Auth] Session check complete
```

## 🔧 Quick Fixes

### If logs show JWT_SECRET is NOT SET:

```bash
# Create/edit .env file
echo 'JWT_SECRET="my-super-secret-key-change-this"' >> .env

# Restart server
# Press Ctrl+C to stop, then:
npm run dev
```

### If cookie is not being set:

```javascript
// Check browser cookie settings
// In Chrome: chrome://settings/cookies
// Make sure "Allow all cookies" is enabled for localhost

// Or try with explicit domain:
Cookies.set("koneksi_karir_token", data.token, {
  expires: daysUntilMidnight,
  path: "/",
  sameSite: "lax",
  domain: "localhost", // Add this
});
```

### If token verification keeps failing:

1. Clear all cookies
2. Sign in again (generates new token)
3. Make sure .env has JWT_SECRET
4. Restart dev server

## 📝 Report Template

When reporting the issue, provide:

```
1. Browser Console Logs (copy all logs with emojis):
[Paste console output here]

2. Cookie Value from DevTools → Application → Cookies:
Name: koneksi_karir_token
Value: [paste first 50 chars]
Expires: [paste expiry date]

3. Network Tab (for /api/auth/session):
Status: [200/401/etc]
Response: [paste response]

4. Environment:
- Browser: [Chrome/Firefox/etc]
- Node version: [run: node -v]
- JWT_SECRET set: [yes/no]

5. Steps to reproduce:
1. [What you did]
2. [What happened]
3. [What you expected]
```

## ✅ Success Indicators

You know it's working when you see:

- ✅ Cookie persists in DevTools after sign-in
- ✅ No redirect loops
- ✅ Console shows `✅ [Middleware] Allowing access to protected route`
- ✅ Console shows `✅ [Auth] User authenticated`
- ✅ Protected pages load without redirecting to sign-in

Try signing in again and check the browser console for these detailed logs!
