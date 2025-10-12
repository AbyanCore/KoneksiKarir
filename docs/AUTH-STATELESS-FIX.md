# Stateless Authentication - Fix Documentation

## 🔍 Issues Found & Fixed

### Issue 1: ❌ **js-cookie `expires` Parameter**

**Problem:** We were passing a modified Date object to js-cookie's `expires` parameter, but js-cookie expects either:

- A number (days from now)
- An unmodified Date object

**Solution:** Calculate the fraction of days until midnight:

```typescript
const now = new Date();
const midnight = new Date(now);
midnight.setDate(midnight.getDate() + 1);
midnight.setHours(0, 0, 0, 0);

const millisecondsUntilMidnight = midnight.getTime() - now.getTime();
const daysUntilMidnight = millisecondsUntilMidnight / (1000 * 60 * 60 * 24);

Cookies.set("koneksi_karir_token", data.token, {
  expires: daysUntilMidnight, // ✅ Correct: fraction of days (e.g., 0.375)
  path: "/",
  sameSite: "lax",
});
```

### Issue 2: ❌ **Middleware Modifying State (Not Stateless)**

**Problem:** Middleware was deleting cookies with `response.cookies.delete()`, which:

- Creates stateful behavior (server modifying cookies)
- Can cause cookie conflicts between client and server
- May cause cookies to disappear unexpectedly

**Solution:** Middleware should ONLY read and verify, never modify:

```typescript
// ❌ BEFORE: Stateful (deleting cookie)
if (!user) {
  const response = NextResponse.redirect(signInUrl);
  response.cookies.delete("koneksi_karir_token"); // Bad!
  return response;
}

// ✅ AFTER: Stateless (just redirect)
if (!user) {
  return NextResponse.redirect(signInUrl);
}
```

### Issue 3: ❌ **Logout Route Setting Cookies (Not Stateless)**

**Problem:** Logout endpoint was trying to clear cookies from server-side, creating server/client cookie conflicts.

**Solution:** Let client handle cookie removal entirely:

```typescript
// ❌ BEFORE: Server trying to clear cookie
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("koneksi_karir_token", "", { maxAge: -1 });
  return response;
}

// ✅ AFTER: Client-side handles cookie removal
export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}
```

### Issue 4: ❌ **Session Endpoint Returning 401 Status**

**Problem:** Returning 401 status for unauthenticated sessions can cause browser/fetch issues and is not truly stateless.

**Solution:** Always return 200 with authentication status:

```typescript
// ❌ BEFORE: 401 for no token
if (!token) {
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

// ✅ AFTER: 200 with status
if (!token) {
  return NextResponse.json({ authenticated: false });
}
```

### Issue 5: ❌ **Missing `credentials: "include"` in Some Requests**

**Problem:** Not all fetch requests were including credentials, causing cookies not to be sent.

**Solution:** Added `credentials: "include"` to all auth requests.

### Issue 6: ❌ **No Cookie Cleanup on Session Check Failure**

**Problem:** If session check fails, invalid cookie was left in browser.

**Solution:** Clean up invalid cookies automatically:

```typescript
const checkSession = async () => {
  const token = Cookies.get("koneksi_karir_token");

  if (!token) {
    return; // No cookie, nothing to check
  }

  const response = await fetch("/api/auth/session");

  if (!response.ok || !data.authenticated) {
    // Clean up invalid cookie
    Cookies.remove("koneksi_karir_token", { path: "/" });
  }
};
```

## ✅ Stateless Authentication Principles

### 1. **Server NEVER Modifies Cookies**

- ✅ Server READS cookies for authentication
- ✅ Server VERIFIES JWT tokens
- ✅ Server RETURNS data based on auth status
- ❌ Server NEVER sets/deletes cookies

### 2. **Client Manages Cookie Lifecycle**

- ✅ Client SETS cookie on successful sign-in
- ✅ Client REMOVES cookie on sign-out
- ✅ Client CLEANS UP invalid cookies
- ✅ Client HANDLES cookie expiration

### 3. **Middleware is Read-Only**

- ✅ Check if token exists
- ✅ Verify token validity
- ✅ Redirect based on auth status
- ❌ NEVER modify cookies
- ❌ NEVER modify request/response

### 4. **All Endpoints Return Success Status**

- ✅ Return 200 for valid requests
- ✅ Use response body to indicate auth status
- ❌ Don't use 401 for authentication checks
- ✅ Reserve 401 for actual access denial

## 🔄 Updated Authentication Flow

### **Sign In Flow** (Client-Side Cookie Management)

```
1. User submits credentials
   ↓
2. POST /api/auth/signin
   ↓
3. Server validates credentials
   ↓
4. Server generates JWT token
   ↓
5. Server returns { token, user } in response body
   ↓
6. Client calculates days until midnight
   ↓
7. Client sets cookie with js-cookie
   Cookies.set("koneksi_karir_token", token, {
     expires: daysUntilMidnight, // e.g., 0.375 (9 hours)
     path: "/",
     sameSite: "lax",
   })
   ↓
8. Client stores user in state
   ↓
9. Client redirects based on role
```

### **Session Check Flow** (Stateless Verification)

```
1. Component mounts / Page loads
   ↓
2. Client checks if cookie exists (Cookies.get())
   ↓
3. If no cookie → Skip session check, set loading=false
   ↓
4. If cookie exists → GET /api/auth/session
   ↓
5. Server reads cookie from request headers
   ↓
6. Server verifies JWT token
   ↓
7. Server returns { authenticated: true/false, user: {...} }
   ↓
8. Client checks response
   ↓
9. If authenticated=false → Remove invalid cookie
   Cookies.remove("koneksi_karir_token", { path: "/" })
   ↓
10. If authenticated=true → Set user in state
```

### **Protected Route Flow** (Middleware Read-Only)

```
1. User navigates to /s/hub
   ↓
2. Middleware intercepts request
   ↓
3. Middleware reads cookie from request
   ↓
4. If no cookie → Redirect to /auth/signin
   ↓
5. If cookie exists → Verify JWT token
   ↓
6. If token invalid → Redirect to /auth/signin
   (Note: Cookie NOT deleted by middleware)
   ↓
7. If token valid → Check role-based access
   ↓
8. If role mismatch → Redirect to appropriate page
   ↓
9. If all checks pass → Allow request to continue
```

### **Sign Out Flow** (Client-Side Cleanup)

```
1. User clicks sign out
   ↓
2. Client removes cookie FIRST
   Cookies.remove("koneksi_karir_token", { path: "/" })
   ↓
3. Client calls POST /api/auth/logout (optional cleanup)
   ↓
4. Server returns { success: true }
   (Server does NOT modify cookies)
   ↓
5. Client clears user state
   ↓
6. Client redirects to /auth/signin
```

### **tRPC Request Flow** (Automatic Cookie Sending)

```
1. Client makes tRPC call
   ↓
2. tRPC client includes credentials: "include"
   ↓
3. Browser automatically attaches cookie header
   Cookie: koneksi_karir_token=eyJhbGc...
   ↓
4. Server receives request with cookie
   ↓
5. tRPC context creation extracts token
   ↓
6. Token verified and user added to context
   ↓
7. Protected procedure checks ctx.user
   ↓
8. If user exists → Execute procedure
   ↓
9. If user is null → Throw UNAUTHORIZED error
```

## 📝 File Changes Summary

### ✅ **Updated Files:**

1. **`components/auth/auth-provider.tsx`**

   - Fixed js-cookie expires parameter (use fractional days)
   - Added `credentials: "include"` to all fetch requests
   - Added cookie cleanup on session check failure
   - Improved error handling in signOut

2. **`middleware.ts`**

   - Removed cookie deletion (stateless)
   - Middleware now only reads and redirects
   - Added comments explaining stateless approach

3. **`app/api/auth/logout/route.ts`**

   - Removed server-side cookie deletion
   - Now just returns success status
   - Client handles cookie removal

4. **`app/api/auth/session/route.ts`**

   - Changed to always return 200 status
   - Returns authentication status in body
   - No more 401 responses

5. **`components/trpc/trpc-provider.tsx`**
   - Already has `credentials: "include"` ✅

## 🧪 Testing Guide

### Test 1: Cookie Persistence

```
1. Open DevTools → Application → Cookies
2. Sign in to the application
3. Check cookie "koneksi_karir_token" appears
4. Verify expiration time is set to midnight next day
5. Refresh the page multiple times
6. Cookie should remain and not disappear
```

### Test 2: Cookie Expiration Calculation

```
# Run in browser console after sign in:
const cookie = document.cookie.split(';').find(c => c.includes('koneksi_karir_token'));
console.log(cookie);

# Should show cookie with proper expiration
```

### Test 3: Session Check

```
1. Sign in and verify you're authenticated
2. Open DevTools → Application → Cookies
3. Manually delete the cookie
4. Refresh the page
5. Should be redirected to sign in page
6. No console errors about invalid cookies
```

### Test 4: Stateless Middleware

```
1. Sign in successfully
2. Open DevTools → Network tab
3. Navigate to different protected pages (/s/hub, /s/profile)
4. Check request/response headers
5. Verify middleware is NOT setting/deleting cookies
6. Only see cookies in initial sign-in response
```

### Test 5: Sign Out

```
1. Sign in successfully
2. Open DevTools → Application → Cookies
3. Verify cookie exists
4. Click sign out
5. Cookie should disappear immediately
6. Should be redirected to sign in page
7. Network tab should show no Set-Cookie headers on logout
```

## 🔍 Debugging Commands

### Check Cookie in Browser Console:

```javascript
// Get all cookies
document.cookie;

// Get specific cookie with js-cookie
Cookies.get("koneksi_karir_token");

// Check cookie expiration (requires js-cookie library)
const allCookies = Cookies.get();
console.log(allCookies);

// Manually set cookie for testing
Cookies.set("koneksi_karir_token", "test-token-123", {
  expires: 1, // 1 day from now
  path: "/",
  sameSite: "lax",
});

// Remove cookie
Cookies.remove("koneksi_karir_token", { path: "/" });
```

### Check JWT Token Validity:

```javascript
// Decode JWT (doesn't verify, just shows content)
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
if (token) {
  const payload = parseJwt(token);
  console.log("Token payload:", payload);
  console.log("Expires at:", new Date(payload.exp * 1000));
}
```

## ✅ Stateless Checklist

- ✅ Server never modifies cookies (only client does)
- ✅ Middleware is read-only (no cookie deletion)
- ✅ All auth endpoints return 200 status
- ✅ Client manages entire cookie lifecycle
- ✅ js-cookie expires parameter uses fractional days
- ✅ All fetch requests include `credentials: "include"`
- ✅ Invalid cookies are cleaned up automatically
- ✅ JWT tokens are verified but never modified
- ✅ tRPC context creation is stateless (just reads)
- ✅ Error handling doesn't leave orphaned cookies

## 🎯 Expected Behavior

After these fixes:

1. ✅ Cookie persists after login (doesn't disappear)
2. ✅ Cookie expires at midnight as intended
3. ✅ No server/client cookie conflicts
4. ✅ Clean error handling without orphaned cookies
5. ✅ Stateless authentication (server only verifies)
6. ✅ Client has full control over cookie lifecycle
7. ✅ Middleware doesn't interfere with cookies
8. ✅ Session checks work reliably
9. ✅ Sign out cleanly removes cookies
10. ✅ All tRPC calls include authentication

Your authentication system is now **truly stateless**! 🎉
