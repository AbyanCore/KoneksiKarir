# Next.js 15 Route Handler Changes

## Issue Fixed: Dynamic Route Params are now Promises

### Error

```
Type '{ params: Promise<{ hash: string; }>; }' is not assignable to type '{ params: { hash: string; }; }'.
```

### Root Cause

In **Next.js 15**, dynamic route parameters (`params`) are now returned as **Promises** instead of plain objects. This is part of Next.js's move towards better async handling.

### Solution

#### Before (Next.js 14 and earlier):

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  const { hash } = params; // Direct access
  // ...
}
```

#### After (Next.js 15):

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params; // Must await!
  // ...
}
```

### Files Updated

- ✅ `src/app/api/file/read/[hash]/route.ts`

### Key Changes

1. **Type signature**: `{ params: { hash: string } }` → `{ params: Promise<{ hash: string }> }`
2. **Access pattern**: `params.hash` → `(await params).hash` or `const { hash } = await params`

### Why This Change?

Next.js 15 made this change to:

- Support better async/streaming capabilities
- Prepare for React Server Components improvements
- Enable more efficient data fetching patterns

### Migration Checklist

For any dynamic route handler (`[param]` in path):

- [x] Update type signature to `Promise<{ param: type }>`
- [x] Add `await` when accessing params
- [x] Test route functionality

### Other Routes to Check

If you have other dynamic routes, apply the same pattern:

```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}

// app/api/posts/[slug]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // ...
}
```

### Status

✅ **Fixed** - File upload/read system now compatible with Next.js 15!
