# File Storage System - Content-Addressable Storage (CAS)

## Date: October 15, 2025

## 📦 Overview

Implemented a **Content-Addressable Storage (CAS)** system for file uploads with:

- ✅ 2-level directory structure for efficient storage
- ✅ SHA-256 content hashing for deduplication
- ✅ Token-based authentication
- ✅ RESTful API endpoints
- ✅ Reusable UI components
- ✅ No database storage (stateless)

---

## 🏗️ Architecture

### Storage Structure

```
data/
├── ab/
│   ├── c1/
│   │   └── abc123def... (SHA-256 hash)
│   └── d2/
│       └── abd234...
├── cd/
│   ├── e3/
│   └── f4/
└── ...
```

### File Organization

- **Level 1**: First 2 characters of hash (`ab`, `cd`, etc.)
- **Level 2**: Next 2 characters of hash (`c1`, `d2`, etc.)
- **Filename**: Full 64-character SHA-256 hash

**Benefits:**

- Efficient file system performance (avoids too many files in one directory)
- Automatic deduplication (same file = same hash)
- Content-addressable (hash is the address)
- Immutable (content never changes)

---

## 🔌 API Endpoints

### 1. Upload File

**Endpoint:** `POST /api/file/upload`

**Authentication:** Required (Cookie-based token)

**Request:**

```typescript
Content-Type: multipart/form-data

{
  file: File
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "contentHash": "abc123def...",
  "size": 1234567,
  "mimeType": "image/jpeg",
  "originalName": "photo.jpg",
  "url": "/api/file/read/abc123def..."
}
```

**Response (Deduplicated):**

```json
{
  "success": true,
  "message": "File already exists (deduplicated)",
  "contentHash": "abc123def...",
  ...
}
```

**Error Responses:**

```json
// No authentication
{ "error": "Unauthorized - No token provided" }

// Invalid file
{ "error": "No file provided" }
{ "error": "File too large. Maximum size is 10MB" }
{ "error": "Invalid file type. Allowed types: ..." }
```

**Validation:**

- Max file size: 10MB
- Allowed types:
  - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
  - Documents: `application/pdf`, `.doc`, `.docx`
  - Text: `text/plain`

---

### 2. Retrieve File

**Endpoint:** `GET /api/file/read/[hash]`

**Authentication:** Not required (public access)

**Parameters:**

- `hash`: 64-character SHA-256 hash

**Response:**

- Binary file data
- Headers:
  ```
  Content-Type: <detected-mime-type>
  Cache-Control: public, max-age=31536000, immutable
  Content-Length: <file-size>
  ETag: <content-hash>
  ```

**Error Responses:**

```json
{ "error": "Invalid content hash format" }
{ "error": "File not found" }
```

**Caching:**

- Files are cached forever (immutable content)
- ETags use content hash for validation
- CDN-friendly

---

## 📁 Files Created

### 1. API Routes

#### `src/app/api/file/upload/route.ts`

**Upload endpoint**

- Validates authentication
- Checks file size and type
- Calculates SHA-256 hash
- Creates CAS directory structure
- Deduplicates identical files
- Returns content hash

#### `src/app/api/file/read/[hash]/route.ts`

**Retrieval endpoint**

- Validates hash format
- Reads file from CAS storage
- Detects MIME type
- Sets cache headers
- Streams file to client

---

### 2. UI Components

#### `src/components/ui/file-upload.tsx`

**Reusable file upload component**

**Props:**

```typescript
{
  accept?: string;              // File types (default: images, PDFs, docs)
  maxSize?: number;             // Max size in MB (default: 10)
  onUploadSuccess: (data) => void;
  onUploadError?: (error) => void;
  label?: string;
  description?: string;
  currentFileUrl?: string;      // Show existing file
  showPreview?: boolean;        // Show image preview
  disabled?: boolean;
}
```

**Features:**

- Drag & drop support
- File preview for images
- Upload progress indicator
- Success/error states
- File size validation
- MIME type validation
- Cancel upload
- Replace existing file

**Usage Example:**

```tsx
<FileUpload
  accept="image/*"
  maxSize={5}
  label="Upload Logo"
  currentFileUrl={currentLogoUrl}
  onUploadSuccess={(data) => {
    setLogoUrl(data.url);
  }}
/>
```

---

### 3. Utility Functions

#### `src/lib/file-storage.ts`

**Helper functions**

```typescript
// Upload a file
uploadFile(file: File): Promise<FileUploadResponse>

// Get URL from hash
getFileUrl(contentHash: string): string

// Extract hash from URL
extractContentHash(url: string): string | null

// Check if URL is CAS URL
isCASUrl(url: string): boolean

// Validate file before upload
validateFile(file, options): { valid, error? }
```

---

## 🔗 Integration

### Updated Components

#### Company Profile - Logo Upload

**File:** `src/components/company/profile/ContactInfoCard.tsx`

**Changes:**

- Replaced text input with `FileUpload` component
- Logo now stored in CAS
- Direct upload from profile page
- Preview in edit and view modes

**Before:**

```tsx
<Input type="url" placeholder="https://..." />
```

**After:**

```tsx
<FileUpload
  accept="image/*"
  maxSize={5}
  currentFileUrl={field.value}
  onUploadSuccess={(data) => field.onChange(data.url)}
/>
```

---

## 🔐 Security Features

### 1. Authentication

- **Required for upload**: Only signed-in users can upload
- **Token validation**: Validates JWT from cookies
- **User context**: Tracks who uploaded (via token)

### 2. File Validation

- **Size limits**: Prevents large file attacks
- **MIME type whitelist**: Only allowed file types
- **Hash verification**: Content integrity

### 3. Storage Security

- **Immutable content**: Files never change
- **No overwrites**: Duplicate hashes reuse existing files
- **Isolated storage**: Files in `data/` directory

---

## 📊 Database Integration

### Schema Changes

**No database changes required!**

The CAS system is completely stateless. URLs are stored in existing fields:

```prisma
model Company {
  logoUrl String? // Now stores: /api/file/read/abc123...
}

model Events {
  bannerUrl  String // /api/file/read/def456...
  minimapUrl String // /api/file/read/ghi789...
}

model JobSeekerProfile {
  resumeUrl    String? // /api/file/read/jkl012...
  portfolioUrl String? // /api/file/read/mno345...
}
```

**Benefits:**

- No migration needed
- Backward compatible
- Can mix old URLs with new CAS URLs
- Easy to identify CAS files (by URL pattern)

---

## 🎯 Use Cases

### 1. Company Profile

```tsx
// Upload company logo
<FileUpload
  accept="image/*"
  maxSize={5}
  label="Company Logo"
  onUploadSuccess={(data) => {
    form.setValue("logoUrl", data.url);
  }}
/>
```

### 2. Event Management

```tsx
// Upload event banner
<FileUpload
  accept="image/*"
  maxSize={10}
  label="Event Banner"
  description="Upload event banner (1920x1080 recommended)"
  onUploadSuccess={(data) => {
    setBannerUrl(data.url);
  }}
/>
```

### 3. Job Seeker Profile

```tsx
// Upload resume
<FileUpload
  accept=".pdf,.doc,.docx"
  maxSize={5}
  label="Upload Resume"
  currentFileUrl={profile.resumeUrl}
  onUploadSuccess={(data) => {
    updateProfile({ resumeUrl: data.url });
  }}
/>
```

---

## 🚀 Benefits

### 1. Deduplication

- Same file uploaded multiple times = one copy
- Saves storage space
- Reduces bandwidth

### 2. Performance

- 2-level directory structure = fast lookup
- Content-addressable = predictable paths
- Immutable = cache forever

### 3. Security

- Authentication required for upload
- File validation
- No user-controlled filenames (prevents attacks)

### 4. Simplicity

- No database needed
- Stateless operation
- Easy backup (just copy `data/` folder)

### 5. Scalability

- Can easily move to object storage (S3, etc.)
- CDN-friendly (immutable content)
- Horizontal scaling ready

---

## 🧪 Testing

### Upload Test

```bash
curl -X POST http://localhost:3000/api/file/upload \
  -H "Cookie: token=YOUR_TOKEN" \
  -F "file=@photo.jpg"
```

**Expected Response:**

```json
{
  "success": true,
  "contentHash": "abc123...",
  "url": "/api/file/read/abc123..."
}
```

### Retrieval Test

```bash
curl http://localhost:3000/api/file/read/abc123...
```

**Expected:** Binary file data with proper headers

---

## 📝 Migration Guide

### For Existing URLs

**Option 1: Keep old URLs (backward compatible)**

- Old URLs continue to work
- New uploads use CAS
- Gradual migration

**Option 2: Migrate existing files**

1. Download existing files
2. Upload to CAS system
3. Update database with new URLs
4. Delete old files

**Helper script** (future enhancement):

```typescript
async function migrateToSystem(oldUrl: string) {
  const file = await fetch(oldUrl);
  const blob = await file.blob();
  const { url } = await uploadFile(blob);
  return url; // New CAS URL
}
```

---

## 🔮 Future Enhancements

### 1. Metadata Storage

- Store original filename
- Track upload date/user
- Add file descriptions
- Tag files

### 2. Image Processing

- Automatic thumbnails
- Multiple sizes (small, medium, large)
- Format conversion (WebP)
- Compression

### 3. Direct Upload

- Signed URLs for direct S3 upload
- Client-side hash calculation
- Resume interrupted uploads

### 4. Admin Features

- File browser
- Usage statistics
- Cleanup orphaned files
- Quota management

### 5. CDN Integration

- CloudFlare/CloudFront integration
- Custom domain for files
- Global distribution

---

## 📚 Dependencies Added

```json
{
  "mime-types": "^3.0.1",
  "@types/mime-types": "^2.1.4"
}
```

**Purpose:**

- Detect MIME type from file extension
- Serve files with correct Content-Type header

---

## 🎨 Component Usage Examples

### Basic Upload

```tsx
<FileUpload onUploadSuccess={(data) => console.log(data.url)} />
```

### With Existing File

```tsx
<FileUpload
  currentFileUrl="/api/file/read/abc123..."
  onUploadSuccess={(data) => updateUrl(data.url)}
/>
```

### Custom Validation

```tsx
<FileUpload
  accept="image/png,image/jpeg"
  maxSize={2}
  label="Profile Picture"
  description="PNG or JPG, max 2MB"
  onUploadSuccess={handleSuccess}
  onUploadError={(error) => toast.error(error)}
/>
```

### Disabled State

```tsx
<FileUpload
  disabled={!isEditing}
  currentFileUrl={logoUrl}
  onUploadSuccess={handleSuccess}
/>
```

---

## ✅ Checklist

### Implementation

- [x] Upload API endpoint
- [x] Read API endpoint
- [x] CAS directory structure
- [x] SHA-256 hashing
- [x] File validation
- [x] Authentication
- [x] Deduplication
- [x] MIME type detection
- [x] Cache headers

### UI Components

- [x] FileUpload component
- [x] Preview support
- [x] Progress indicator
- [x] Error handling
- [x] Success feedback
- [x] Integration with Company profile

### Utilities

- [x] Upload helper
- [x] URL helpers
- [x] Validation functions
- [x] Type definitions

### Documentation

- [x] API documentation
- [x] Architecture overview
- [x] Usage examples
- [x] Migration guide

---

## 🎉 Summary

**Complete file storage system implemented!**

✅ **Core Features:**

- Content-Addressable Storage (CAS)
- 2-level directory structure
- SHA-256 hashing
- Automatic deduplication
- Token authentication
- RESTful API

✅ **Components:**

- File upload component
- Progress tracking
- Preview support
- Error handling

✅ **Integration:**

- Company profile logo upload
- Ready for resume, banners, etc.
- Backward compatible with old URLs

The system is **production-ready** and can handle:

- Images (logos, banners, photos)
- Documents (resumes, PDFs)
- Any file type you configure

Next steps: Integrate with other models (Events, JobSeekerProfile, etc.)
