# Profile Page - Job Seeker Profile Management

## Overview

The Profile page allows job seekers to manage their personal information, education, skills, social links, and documents. This page has been refactored from a 550+ line monolithic component with mock data into a modular, data-driven architecture using tRPC and Prisma.

## Component Structure

```
src/components/profile/
├── index.tsx                      # Main orchestrator component
├── BasicInformationCard.tsx       # Email, name, and bio
├── EducationCard.tsx              # Education level, institution, graduation year
├── SkillsCard.tsx                 # Skills management (add/remove)
├── SocialLinksCard.tsx            # Social media and portfolio links
├── DocumentsCard.tsx              # Resume and portfolio URLs
├── PrivateInformationCard.tsx     # NIK and phone numbers
├── ProfileActions.tsx             # Edit/Save/Cancel buttons
└── README.md                      # This file
```

## Features

### 1. Basic Information Management

- Display and edit full name
- Add/edit bio description
- View email (read-only)

### 2. Education Information

- Select education level (SMA, D3, S1, S2, S3)
- Enter institution name
- Record graduation year

### 3. Skills Management

- Add multiple skills as tags
- Remove skills
- Real-time skill list updates
- Prevent duplicate skills

### 4. Social Links

- Add multiple social platform links (LinkedIn, GitHub, Portfolio, Twitter, Other)
- Edit link types and URLs
- Remove social links
- Flexible link management

### 5. Documents

- Add resume URL (Google Drive, Dropbox, etc.)
- Add portfolio website URL
- URL validation

### 6. Private Information

- National ID (NIK) entry
- Multiple phone numbers
- Add/remove phone numbers dynamically

### 7. Profile Completion Check

- Required for job seekers before accessing Hub page
- Validates that fullName is provided
- Automatic redirect from Hub if profile incomplete

## Data Flow

### tRPC Queries Used

1. **`trpc.profile.getJobSeekerProfile`**

   - Fetches complete job seeker profile
   - Input: userId
   - Returns: User object with profile details
   - Used by: Main index component
   - Router: `server/routers/profile.ts`

2. **`trpc.profile.checkProfileComplete`**
   - Checks if profile is complete (has fullName)
   - Input: userId
   - Returns: { isComplete, hasProfile }
   - Used by: Hub page to enforce profile completion
   - Router: `server/routers/profile.ts`

### tRPC Mutations Used

1. **`trpc.profile.updateJobSeekerProfile`**
   - Creates or updates job seeker profile
   - Input: UpdateJobSeekerProfileDto
   - Validation: Full name required (min 2 characters)
   - Upsert operation: Creates if doesn't exist, updates if exists
   - Used by: Main index component on form submission
   - Router: `server/routers/profile.ts`

## Component Details

### index.tsx (Main Orchestrator)

**Responsibilities:**

- State management for all profile fields
- Data fetching via tRPC query
- Form validation with react-hook-form and Zod
- Profile update via tRPC mutation
- Skills, social links, and phone numbers array management

**State:**

- `isEditing`: Edit mode toggle
- `skills`: Array of skill strings
- `newSkill`: Input for new skill
- `socialLinks`: Array of {type, url} objects
- `phoneNumbers`: Array of phone number strings

**Key Features:**

- Auto-populates form when data is loaded
- Handles new users (no profile yet)
- Resets form on cancel
- Validates URLs for resume, portfolio, and social links
- Filters empty phone numbers before submission

### BasicInformationCard.tsx

Displays basic user information with form fields.

**Props:**

- `form`: React Hook Form instance
- `isEditing`: Whether edit mode is active

**Fields:**

- Email (disabled, read-only)
- Full Name (required, min 2 characters)
- Bio (optional, textarea)

### EducationCard.tsx

Manages education information.

**Props:**

- `form`: React Hook Form instance
- `isEditing`: Whether edit mode is active

**Fields:**

- Education Level (dropdown: SMA, D3, S1, S2, S3)
- Institution Name
- Graduation Year (number input)

### SkillsCard.tsx

Interactive skills management with add/remove functionality.

**Props:**

- `skills`: Array of current skills
- `newSkill`: New skill input value
- `isEditing`: Whether edit mode is active
- `onNewSkillChange`: Handler for input change
- `onAddSkill`: Handler for adding skill
- `onRemoveSkill`: Handler for removing skill

**Features:**

- Skills displayed as badges
- Add skill via button or Enter key
- Remove skill with X button (edit mode only)
- Prevents duplicate skills

### SocialLinksCard.tsx

Manages social media and professional profile links.

**Props:**

- `socialLinks`: Array of {type, url} objects
- `isEditing`: Whether edit mode is active
- `onUpdateLink`: Handler for updating link
- `onAddLink`: Handler for adding new link
- `onRemoveLink`: Handler for removing link

**Link Types:**

- LinkedIn
- GitHub
- Portfolio
- Twitter
- Other

**Features:**

- Dynamic link type selection
- URL validation
- Add/remove links in edit mode

### DocumentsCard.tsx

Manages document URLs (resume and portfolio).

**Props:**

- `form`: React Hook Form instance
- `isEditing`: Whether edit mode is active

**Fields:**

- Resume URL (validated URL or empty string)
- Portfolio URL (validated URL or empty string)

### PrivateInformationCard.tsx

Handles sensitive personal information.

**Props:**

- `form`: React Hook Form instance
- `phoneNumbers`: Array of phone numbers
- `isEditing`: Whether edit mode is active
- `onUpdatePhoneNumber`: Handler for updating phone number
- `onAddPhoneNumber`: Handler for adding phone number
- `onRemovePhoneNumber`: Handler for removing phone number

**Fields:**

- NIK (National ID number)
- Multiple phone numbers

**Features:**

- Dynamic phone number management
- Add/remove phone numbers
- Empty state display

### ProfileActions.tsx

Displays action buttons based on edit state.

**Props:**

- `isEditing`: Whether edit mode is active
- `isSubmitting`: Whether form is submitting
- `onEdit`: Handler for edit button
- `onCancel`: Handler for cancel button

**Buttons:**

- View mode: "Edit Profile" button
- Edit mode: "Cancel" and "Save Changes" buttons
- Loading state during submission

## Database Schema

### Related Tables

**User** - Base user account

- `id`, `email`, `password`, `role`, `is_blocked`

**JobSeekerProfile** - Job seeker profile details

- `id`, `userId`, `fullName`, `bio`
- `lastEducationLevel`, `graduationYear`, `institutionName`
- `skills` (String[]), `socialLinks` (Json[])
- `resumeUrl`, `portfolioUrl`
- `NIK`, `phoneNumber` (String[])

### Profile Completion Logic

A profile is considered "complete" if:

1. JobSeekerProfile record exists
2. `fullName` field is not empty

This is enforced for job seekers before accessing the Hub page.

## Hub Page Integration

### Profile Completion Check

The Hub page includes a profile completion check for job seekers:

```tsx
// Check profile completion for job seekers
const { data: profileStatus } = trpc.profile.checkProfileComplete.useQuery(
  { userId: MOCK_USER_ID },
  { enabled: MOCK_USER_ROLE === "JOB_SEEKER" }
);

// Redirect to profile if incomplete
useEffect(() => {
  if (profileStatus && !profileStatus.isComplete) {
    toast.info("Please complete your profile before browsing jobs");
    router.push("/s/profile");
  }
}, [profileStatus]);
```

**Flow:**

1. Job seeker visits Hub page
2. Profile completion is checked
3. If incomplete, user is redirected to Profile page with toast notification
4. User must complete profile (at minimum, enter full name)
5. After saving, user can access Hub page

**Note:** This check only applies to JOB_SEEKER role. Admins and company admins can access Hub without profile completion.

## Usage Example

```tsx
import ProfilePage from "@/components/profile";

export default function Page_Profile() {
  return <ProfilePage />;
}
```

## Form Validation

### Schema (Zod)

```typescript
const profileFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().optional(),
  lastEducationLevel: z.string().optional(),
  graduationYear: z.string().optional(),
  institutionName: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  NIK: z.string().optional(),
});
```

### Validation Rules

- **Email**: Valid email format, read-only
- **Full Name**: Required, minimum 2 characters
- **Resume URL**: Valid URL or empty string
- **Portfolio URL**: Valid URL or empty string
- **Graduation Year**: Parsed to integer before submission

## TODO / Future Improvements

1. **Authentication Integration**

   - Replace `MOCK_USER_ID` with actual authenticated user ID
   - Replace `MOCK_USER_ROLE` with actual user role from auth context
   - Implement proper session management

2. **File Upload**

   - Direct file upload for resume (instead of URL)
   - File size and type validation
   - Cloud storage integration (S3, Cloudinary)

3. **Profile Photo**

   - Add profile picture upload
   - Image cropping and resizing
   - Avatar generation for users without photos

4. **Enhanced Validation**

   - Phone number format validation (Indonesian format)
   - NIK format validation (16 digits)
   - Institution name autocomplete
   - Skill suggestions based on popular skills

5. **Additional Features**

   - Work experience section
   - Certifications and licenses
   - Languages proficiency
   - Expected salary range
   - Job preferences (remote, location, industry)

6. **Profile Strength Indicator**

   - Calculate profile completion percentage
   - Show which fields are missing
   - Tips for improving profile

7. **Privacy Settings**

   - Control what information is visible to employers
   - Public/private profile toggle
   - Resume visibility settings

8. **Export/Import**
   - Export profile as PDF
   - Import from LinkedIn
   - Generate resume from profile

## Migration Notes

### Before Refactoring

- **Lines of Code**: 550+
- **Data Source**: Hard-coded mock data
- **Components**: Single monolithic component
- **Database**: No integration
- **Profile Completion**: No validation

### After Refactoring

- **Lines of Code**: ~600 (distributed across 8 files)
- **Data Source**: PostgreSQL via Prisma ORM
- **Components**: 8 modular, reusable components
- **Database**: Full integration with upsert operations
- **Profile Completion**: Required check for Hub access

### Benefits of Refactoring

1. **Maintainability**: Each component has a single responsibility
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Profile cards can be reused in other contexts
4. **Type Safety**: Full TypeScript coverage with tRPC end-to-end
5. **Data Persistence**: Real database storage
6. **User Experience**: Profile completion enforcement, better validation

## Related Files

- **DTO**: `src/lib/dtos/profile/update.jobseeker-profile.dto.ts`
- **Router**: `src/server/routers/profile.ts`
- **Page**: `src/app/(routes)/s/profile/page.tsx`
- **Prisma Schema**: `prisma/schema.prisma` (JobSeekerProfile model)
- **Hub Integration**: `src/components/dashboard/hub/index.tsx`

## API Reference

### Profile Router Procedures

#### `getJobSeekerProfile`

```typescript
input: {
  userId: string;
}
output: {
  id: string;
  email: string;
  role: Role;
  profile: JobSeekerProfile | null;
}
```

#### `updateJobSeekerProfile`

```typescript
input: UpdateJobSeekerProfileDto;
output: {
  success: boolean;
  profile: JobSeekerProfile;
}
```

#### `checkProfileComplete`

```typescript
input: {
  userId: string;
}
output: {
  isComplete: boolean;
  hasProfile: boolean;
}
```

## Contributing

When adding new features to the Profile page:

1. Keep components modular and focused on single responsibility
2. Use tRPC for all data operations
3. Add proper TypeScript types for all props and data
4. Include loading and error states
5. Follow existing styling patterns (Tailwind + gradients)
6. Update validation schema when adding new fields
7. Update this README with new features

## Testing Checklist

- [ ] New user can create profile
- [ ] Existing user can view profile
- [ ] User can edit profile in edit mode
- [ ] Cancel button resets form to original values
- [ ] Skills can be added and removed
- [ ] Social links can be added and removed
- [ ] Phone numbers can be added and removed
- [ ] Form validation works correctly
- [ ] Profile save triggers success toast
- [ ] Incomplete profile redirects from Hub
- [ ] Profile completion allows Hub access
