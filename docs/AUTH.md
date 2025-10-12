# Authentication System

This application uses **JWT (JSON Web Token)** based authentication with HTTP-only cookies for secure session management.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Security Features](#security-features)
- [Usage Guide](#usage-guide)
- [API Routes](#api-routes)
- [tRPC Integration](#trpc-integration)
- [Frontend Integration](#frontend-integration)
- [Troubleshooting](#troubleshooting)

## Overview

### Technology Stack

- **JWT**: Token-based authentication
- **bcrypt**: Password hashing (10 rounds)
- **HTTP-only Cookies**: Secure token storage
- **Next.js Middleware**: Route protection
- **tRPC Context**: Authorization in API procedures
- **React Context**: Client-side auth state management

### Token Expiration

Tokens expire at **midnight (00:00)** the next day. This is calculated dynamically based on the current time:

```typescript
const now = new Date();
const midnight = new Date(now);
midnight.setDate(midnight.getDate() + 1);
midnight.setHours(0, 0, 0, 0);
const expiresIn = Math.floor((midnight.getTime() - now.getTime()) / 1000);
```

**Example:**

- Sign in at 3:00 PM → Token expires at midnight (9 hours)
- Sign in at 11:00 PM → Token expires at midnight (1 hour)
- Sign in at 1:00 AM → Token expires next midnight (~23 hours)

## Architecture

### Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (Cookie)   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│  Next.js        │      │   Prisma     │
│  Middleware     │──────▶│   Database   │
│ (Route Guard)   │      └──────────────┘
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│  tRPC Context    │
│  (User Payload)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Protected       │
│  Procedures      │
└──────────────────┘
```

## Security Features

### 1. Password Hashing

All passwords are hashed using bcrypt with 10 salt rounds:

```typescript
import bcrypt from "bcrypt";

// When creating a user
const hashedPassword = await bcrypt.hash(password, 10);

// When signing in
const isValid = await bcrypt.compare(inputPassword, user.password);
```

### 2. HTTP-only Cookies

Tokens are stored in HTTP-only cookies to prevent XSS attacks:

```typescript
response.cookies.set("koneksi_karir_token", token, {
  httpOnly: true, // Cannot be accessed by JavaScript
  secure: NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // CSRF protection
  path: "/", // Available to entire app
  expires: midnight, // Expires at midnight
});
```

### 3. JWT Token Payload

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "JOB_SEEKER" | "COMPANY";
}
```

### 4. Route Protection

Middleware protects all `/s/*` routes:

- Unauthenticated users → Redirect to `/auth/signin`
- Invalid/expired token → Clear cookie and redirect
- Non-admin accessing `/s/admin` → Redirect to `/s/hub`

### 5. Role-Based Access Control

tRPC procedures enforce role requirements:

```typescript
// Requires authentication
protectedProcedure;

// Requires JOB_SEEKER role
jobSeekerProcedure;

// Requires ADMIN role
adminProcedure;
```

## Usage Guide

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET="your-generated-secret-here"
```

### Sign In Flow

1. User submits email and password
2. API validates credentials with bcrypt
3. JWT token generated with user payload
4. Token set in HTTP-only cookie
5. User redirected based on role:
   - `ADMIN` → `/s/admin`
   - `JOB_SEEKER` → `/s/profile` (if incomplete) or `/s/hub`

### Sign Out Flow

1. User clicks sign out
2. API clears token cookie
3. User redirected to `/auth/signin`
4. Auth context cleared

## API Routes

### POST /api/auth/signin

Sign in with email and password.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "JOB_SEEKER"
  }
}
```

**Error Responses:**

- `400`: Invalid input
- `401`: Invalid credentials
- `403`: Account blocked

### POST /api/auth/logout

Sign out and clear token cookie.

**Response (200):**

```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

### GET /api/auth/session

Check if user is authenticated.

**Success Response (200):**

```json
{
  "authenticated": true,
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "JOB_SEEKER"
  }
}
```

**Not Authenticated (200):**

```json
{
  "authenticated": false,
  "user": null
}
```

## tRPC Integration

### Context Type

Every tRPC procedure receives a context with the authenticated user:

```typescript
export interface Context {
  user: JWTPayload | null;
}
```

### Protected Procedures

```typescript
// Example: Only authenticated users
export const getMyProfile = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.userId; // TypeScript knows user is not null
  // ...
});

// Example: Only job seekers
export const applyToJob = jobSeekerProcedure
  .input(z.object({ jobId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const jobSeekerId = ctx.user.userId;
    // ...
  });

// Example: Only admins
export const deleteUser = adminProcedure
  .input(z.object({ userId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Only admins can reach this code
    // ...
  });
```

### Middleware Implementation

```typescript
// Authenticate user
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { user: ctx.user } });
});

// Check if user is job seeker
const isJobSeeker = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.user.role !== "JOB_SEEKER") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { user: ctx.user } });
});
```

## Frontend Integration

### useAuth Hook

Access authentication state anywhere in your app:

```typescript
import { useAuth } from "@/components/auth/auth-provider";

function MyComponent() {
  const { user, isLoading, isAuthenticated, signIn, signOut } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <p>Role: {user.role}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Sign In Example

```typescript
const { signIn } = useAuth();

const handleSubmit = async (email: string, password: string) => {
  try {
    await signIn(email, password);
    // Redirect is handled automatically by AuthProvider
  } catch (error) {
    console.error("Sign in failed:", error);
  }
};
```

### Protected Component Example

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <div>Profile content...</div>;
}
```

## Troubleshooting

### Issue: "User not authenticated" error

**Cause:** Token expired or missing

**Solution:**

1. Check if `koneksi_karir_token` cookie exists in browser
2. Verify `JWT_SECRET` is set in `.env`
3. Check browser console for errors
4. Try signing in again

### Issue: Token expires too quickly

**Cause:** System time is incorrect

**Solution:**

1. Verify system clock is correct
2. Check timezone settings
3. Token should expire at next midnight

### Issue: "Unauthorized" on tRPC calls

**Cause:** Using wrong procedure type

**Solution:**

```typescript
// ❌ Wrong - using publicProcedure
export const getMyProfile = publicProcedure.query(async ({ ctx }) => {
  // ctx.user might be null!
});

// ✅ Correct - using protectedProcedure
export const getMyProfile = protectedProcedure.query(async ({ ctx }) => {
  // ctx.user is guaranteed to exist
});
```

### Issue: Middleware not working

**Cause:** Matcher pattern might exclude your route

**Solution:**
Check `src/middleware.ts` matcher configuration:

```typescript
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)"],
};
```

### Issue: Cannot hash existing passwords

**Cause:** Database has plain text passwords

**Solution:**
Create a migration script:

```typescript
// scripts/hash-passwords.ts
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

async function hashPasswords() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Skip if already hashed (bcrypt hashes start with $2b$)
    if (user.password.startsWith("$2b$")) {
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    console.log(`Hashed password for user: ${user.email}`);
  }

  console.log("All passwords hashed!");
}

hashPasswords();
```

Run with: `npx tsx scripts/hash-passwords.ts`

### Issue: CORS errors with tRPC

**Cause:** Cookie not being sent with requests

**Solution:**
Ensure tRPC client is configured correctly:

```typescript
// src/components/trpc/trpc-client.ts
import { httpBatchLink } from "@trpc/client";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      // Ensure credentials are included
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
```

### Issue: Redirects creating infinite loop

**Cause:** Protected route redirecting to itself

**Solution:**
Check redirect logic in `useEffect`:

```typescript
useEffect(() => {
  // ✅ Good - only redirect if not loading and not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push("/auth/signin");
  }
}, [isLoading, isAuthenticated, router]);

// ❌ Bad - always redirecting
useEffect(() => {
  if (!isAuthenticated) {
    router.push("/auth/signin");
  }
}, [isAuthenticated, router]);
```

## Best Practices

1. **Always use protected procedures** for authenticated routes
2. **Check `isLoading` before `isAuthenticated`** in components
3. **Use role-specific procedures** (`jobSeekerProcedure`, `adminProcedure`) when appropriate
4. **Never pass `userId` in procedure inputs** - get it from `ctx.user`
5. **Set `JWT_SECRET` to a secure random string** in production
6. **Use HTTPS in production** to protect cookies
7. **Implement rate limiting** on auth endpoints to prevent brute force
8. **Log authentication attempts** for security auditing
9. **Refresh tokens periodically** for long sessions (future enhancement)
10. **Implement password reset** functionality (future enhancement)

## Future Enhancements

- [ ] Refresh tokens for extended sessions
- [ ] Email verification on signup
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, LinkedIn)
- [ ] Session management (view/revoke active sessions)
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for auth events
- [ ] Remember me functionality
- [ ] Account lockout after failed attempts
