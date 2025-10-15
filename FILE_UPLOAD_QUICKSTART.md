# File Upload System - Quick Start Guide

## 🎯 What Was Built

A complete **Content-Addressable Storage (CAS)** system for file uploads with:

✅ **Secure Upload API** - Token authentication required  
✅ **2-Level CAS Storage** - Efficient file organization (`data/ab/c1/abc123...`)  
✅ **SHA-256 Hashing** - Content-based addressing & deduplication  
✅ **Public Read API** - Fast file retrieval with caching  
✅ **Reusable UI Component** - Drag & drop, preview, progress  
✅ **Company Logo Integration** - Working example in profile page

---

## 🚀 How to Use

### 1. Upload a File (Frontend)

```tsx
import FileUpload from "@/components/ui/file-upload";

<FileUpload
  accept="image/*"
  maxSize={5}
  label="Upload Logo"
  currentFileUrl={currentUrl}
  onUploadSuccess={(data) => {
    console.log(data.contentHash); // abc123def...
    console.log(data.url); // /api/file/read/abc123def...
    setLogoUrl(data.url);
  }}
/>;
```

### 2. Upload via API

```bash
curl -X POST http://localhost:3000/api/file/upload \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -F "file=@myfile.jpg"
```

**Response:**

```json
{
  "success": true,
  "contentHash": "abc123...",
  "url": "/api/file/read/abc123...",
  "size": 123456,
  "mimeType": "image/jpeg"
}
```

### 3. Access Files

```html
<!-- Direct URL -->
<img src="/api/file/read/abc123..." />

<!-- Or from database -->
<img src="{company.logoUrl}" />
```

---

## 📁 File Organization

```
data/
├── ab/
│   ├── c1/
│   │   └── abc123def... (full SHA-256 hash)
│   └── d2/
│       └── abd234...
└── cd/
    ├── e3/
    └── f4/
```

**Why 2 levels?**

- Prevents too many files in one directory
- Better filesystem performance
- Organized by hash prefix

---

## 🔐 Security

### Upload (Protected)

- ✅ Requires authentication (JWT token)
- ✅ File size validation (10MB default)
- ✅ MIME type whitelist
- ✅ Only signed-in users can upload

### Read (Public)

- ✅ No authentication needed
- ✅ Content is immutable
- ✅ Cached forever
- ✅ Safe to share URLs

---

## 🎨 UI Component Features

- ✅ Drag & drop support
- ✅ File preview (images)
- ✅ Upload progress
- ✅ Success/error states
- ✅ File validation
- ✅ Replace existing file
- ✅ Cancel upload

---

## 📋 API Endpoints

### POST /api/file/upload

**Auth:** Required (Cookie token)  
**Body:** `multipart/form-data` with `file` field  
**Returns:** Content hash and URL

### GET /api/file/read/[hash]

**Auth:** Not required  
**Params:** 64-char SHA-256 hash  
**Returns:** File binary with cache headers

---

## 🔧 Integration Examples

### Company Logo

```tsx
// In ContactInfoCard.tsx
<FileUpload
  accept="image/*"
  maxSize={5}
  currentFileUrl={form.watch("logoUrl")}
  onUploadSuccess={(data) => {
    form.setValue("logoUrl", data.url);
  }}
/>
```

### Job Seeker Resume

```tsx
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

### Event Banner

```tsx
<FileUpload
  accept="image/*"
  maxSize={10}
  label="Event Banner"
  onUploadSuccess={(data) => {
    setBannerUrl(data.url);
  }}
/>
```

---

## ✨ Key Features

### 1. Deduplication

Upload the same file twice → stored once!

```
File1: photo.jpg → hash abc123
File2: photo.jpg → hash abc123 (reused)
```

### 2. Immutable Content

Files never change → cache forever

```
Cache-Control: public, max-age=31536000, immutable
```

### 3. Content-Addressable

Hash is the address → predictable URLs

```
/api/file/read/abc123def456...
```

---

## 📝 Files Created

1. **`src/app/api/file/upload/route.ts`** - Upload endpoint
2. **`src/app/api/file/read/[hash]/route.ts`** - Read endpoint
3. **`src/components/ui/file-upload.tsx`** - UI component
4. **`src/lib/file-storage.ts`** - Helper utilities
5. **Updated: `src/components/company/profile/ContactInfoCard.tsx`** - Logo upload

---

## 🎯 Ready to Use!

The system is **fully functional** and integrated with:

- ✅ Company profile (logo upload)
- ✅ Authentication (token-based)
- ✅ File storage (CAS in `data/` folder)
- ✅ UI components (drag & drop)

**Next Steps:**

1. Test upload on company profile page
2. Add to other models (Events, JobSeeker)
3. Customize file size/type limits as needed

---

## 🧪 Quick Test

1. **Start server:** `npm run dev`
2. **Sign in** as company admin
3. **Go to:** `/s/company/profile`
4. **Click "Edit Profile"**
5. **Upload logo** using the new file upload component
6. **Save** - Logo stored in CAS!

---

## 💡 Pro Tips

- **No database needed** - URLs stored in existing fields
- **Backward compatible** - Old URLs still work
- **CDN-ready** - Cache headers optimized
- **Easy backup** - Just copy `data/` folder
- **Scalable** - Can move to S3 later

---

For full documentation, see: `FILE_STORAGE_SYSTEM.md`
