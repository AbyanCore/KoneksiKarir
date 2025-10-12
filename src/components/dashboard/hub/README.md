# Hub Page - Career Fair Events & Job Applications

## Overview

The Hub page is the main interface for job seekers to browse career fair events, explore companies, view job openings, and submit applications. This page has been refactored from a 550+ line monolithic component with mock data into a modular, data-driven architecture using tRPC and Prisma.

## Component Structure

```
src/components/dashboard/hub/
├── index.tsx                 # Main orchestrator component
├── HubHeader.tsx            # Event selector and details
├── EventMinimap.tsx         # Event map/minimap display
├── CompaniesHeader.tsx      # Search bar and statistics
├── CompanyList.tsx          # Company cards wrapper
├── CompanyCard.tsx          # Individual company with jobs
├── JobDetailSheet.tsx       # Job details and application
└── README.md               # This file
```

## Features

### 1. Event Management

- Browse all available career fair events
- Switch between events with dropdown selector
- View event details (title, description, date, location)
- Display event minimap (venue layout)

### 2. Company Exploration

- List all companies participating in selected event
- Search companies by name, stand number, or job titles
- View company information (logo, stand number, job count)
- Expandable company cards to view job listings

### 3. Job Browsing

- View jobs grouped by company
- See job details: title, tags/skills, salary range
- Track application counts per job
- Filter jobs by search query

### 4. Application System

- View complete job details in a modal sheet
- Apply to jobs with single click
- Application limits: Maximum 5 applications per event
- Duplicate prevention: Cannot apply to same job twice
- Real-time application tracking with progress bar
- View remaining application slots

### 5. Search & Filter

- Real-time search across company names, stand numbers, job titles, and tags
- Auto-expand companies matching search query
- Display filtered results count

## Data Flow

### tRPC Queries Used

1. **`trpc.events.findAll`**

   - Fetches all available events
   - Used by: HubHeader for event selector
   - Router: `server/routers/events.ts`

2. **`trpc.jobs.findByEventGroupedByCompany`**

   - Fetches all companies with their jobs for selected event
   - Includes: company info, stand numbers, job details, application counts
   - Used by: Main index component for company/job display
   - Router: `server/routers/jobs.ts`

3. **`trpc.jobs.findById`**

   - Fetches detailed information for a specific job
   - Includes: full job details, company info, event info
   - Used by: JobDetailSheet for displaying job details
   - Router: `server/routers/jobs.ts`

4. **`trpc.applications.countByUserAndEvent`**

   - Counts user's applications for selected event
   - Returns: count and remaining slots (out of 5)
   - Used by: Main index for application stats sidebar
   - Router: `server/routers/applications.ts`

5. **`trpc.applications.checkApplied`**
   - Checks if user has already applied to a specific job
   - Returns: boolean flag and application details
   - Used by: JobDetailSheet to disable apply button
   - Router: `server/routers/applications.ts`

### tRPC Mutations Used

1. **`trpc.applications.create`**
   - Creates new job application
   - Validation: Checks for duplicates, enforces 5-application limit
   - Creates application history record
   - Used by: JobDetailSheet on "Apply Now" button
   - Router: `server/routers/applications.ts`

## Component Details

### index.tsx (Main Orchestrator)

**Responsibilities:**

- State management for event selection, search, expanded companies
- Data fetching via tRPC queries
- Search filtering logic
- Application submission handling
- Layout composition

**State:**

- `selectedEventId`: Currently selected event
- `expandedCompanyId`: Currently expanded company (for job list)
- `searchQuery`: Search input value
- `selectedJobId`: Job selected for detail view
- `isJobDetailOpen`: Job detail sheet visibility

**Key Features:**

- Auto-selects first event on load
- Filters companies/jobs based on search query
- Auto-expands first matching company when searching
- Invalidates queries after successful application

### HubHeader.tsx

Displays event information and provides event selection dropdown.

**Props:**

- `currentEvent`: Selected event object
- `events`: Array of all events
- `onEventChange`: Callback when event changes

**Features:**

- Event selector dropdown
- Event title with gradient styling
- Event description
- Date and location badges

### EventMinimap.tsx

Shows venue layout/map for the selected event.

**Props:**

- `minimapUrl`: URL to event venue map image
- `title`: Event title for alt text

**Features:**

- Image display with Next.js Image optimization
- Fallback icon when no minimap available
- Responsive sizing

### CompaniesHeader.tsx

Provides search functionality and displays statistics.

**Props:**

- `totalCompanies`: Total number of companies in event
- `totalJobs`: Total number of jobs in event
- `searchQuery`: Current search query
- `onSearchChange`: Search input change handler
- `resultsCount`: Number of filtered results

**Features:**

- Search input with icon
- Company and job count badges
- Filtered results count display

### CompanyList.tsx

Wrapper component for rendering company cards.

**Props:**

- `companies`: Array of company objects with jobs
- `expandedCompanyId`: Currently expanded company ID
- `onToggleExpand`: Toggle expand/collapse callback
- `onViewJobDetail`: View job details callback

**Features:**

- Maps companies to CompanyCard components
- Empty state display (no companies found)
- Passes props down to each card

### CompanyCard.tsx

Individual company card with expandable job list.

**Props:**

- `company`: Company object with jobs array
- `isExpanded`: Whether card is currently expanded
- `onToggleExpand`: Expand/collapse callback
- `onViewJobDetail`: View job details callback

**Features:**

- Company logo with fallback
- Company name and stand number
- Job count badge
- Expandable job list
- Job details: title, tags, salary, application count
- "View Details & Apply" button per job

### JobDetailSheet.tsx

Modal sheet for viewing complete job details and applying.

**Props:**

- `open`: Sheet visibility
- `onOpenChange`: Sheet open/close callback
- `job`: Complete job object with company and event details
- `hasApplied`: Whether user has already applied
- `isApplying`: Application submission loading state
- `onApply`: Apply button callback
- `remainingApplications`: Remaining application slots

**Features:**

- Complete job information display
- Company information section
- Event information section
- Required skills (tags) display
- Salary range formatting
- Application status (applied/not applied)
- Apply button with loading state
- Disabled states:
  - Already applied
  - No remaining applications
- Application slot counter

## Database Schema

### Related Tables

**Event** - Career fair events

- `id`, `title`, `description`, `date`, `location`, `minimapUrl`

**Company** - Participating companies

- `id`, `name`, `description`, `website`, `location`, `logoUrl`

**EventCompanyParticipation** - Companies at events

- `eventId`, `companyId`, `standNumber`

**Job** - Job postings

- `id`, `title`, `description`, `location`, `tags`, `salaryMin`, `salaryMax`, `isRemote`
- `companyId`, `eventId`, `createdAt`

**Application** - Job applications

- `id`, `jobId`, `jobSeekerId`, `status`, `createdAt`

**ApplicationHistory** - Application status tracking

- `id`, `applicationId`, `status`, `notes`, `createdAt`

### Query Optimizations

All queries are optimized to avoid N+1 problems:

1. **findByEventGroupedByCompany**: Single query with includes for company, stand, and job counts
2. **findById**: Single query with includes for company, event, and application count
3. **Application validation**: Efficient duplicate check using unique index on `(jobSeekerId, jobId)`

## Usage Example

```tsx
import HubPage from "@/components/dashboard/hub";

export default function Page_Hub() {
  return <HubPage />;
}
```

## TODO / Future Improvements

1. **Authentication Integration**

   - Replace `MOCK_USER_ID` with actual authenticated user ID
   - Implement proper session management
   - Add role-based access control

2. **Real-time Updates**

   - WebSocket for live application count updates
   - Real-time event capacity tracking
   - Live job posting updates

3. **Enhanced Filtering**

   - Filter by salary range
   - Filter by job type (remote/on-site)
   - Filter by required skills
   - Sort options (salary, application count, etc.)

4. **Application Management**

   - Application status tracking
   - Application history timeline
   - Withdraw application functionality
   - Application notes/cover letters

5. **Performance Optimizations**

   - Implement virtual scrolling for large company lists
   - Add pagination for events
   - Cache event/company data
   - Optimize image loading with blur placeholders

6. **Analytics**

   - Track popular companies/jobs
   - User behavior analytics
   - Application conversion rates
   - Search analytics

7. **Accessibility**
   - Keyboard navigation improvements
   - ARIA labels and descriptions
   - Screen reader optimizations
   - Focus management in modals

## Migration Notes

### Before Refactoring

- **Lines of Code**: 550+
- **Data Source**: Hard-coded mock data (200+ lines)
- **Components**: Single monolithic component
- **Database**: No integration
- **Application Tracking**: None
- **Search**: Client-side only, basic string matching

### After Refactoring

- **Lines of Code**: ~500 (distributed across 7 files)
- **Data Source**: PostgreSQL via Prisma ORM
- **Components**: 7 modular, reusable components
- **Database**: Full integration with optimized queries
- **Application Tracking**: Real-time with limits and history
- **Search**: Enhanced filtering across multiple fields

### Benefits of Refactoring

1. **Maintainability**: Each component has a single responsibility
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Components can be used in other contexts
4. **Scalability**: Easy to add new features without touching existing code
5. **Type Safety**: Full TypeScript coverage with tRPC end-to-end
6. **Performance**: Optimized database queries, no N+1 problems
7. **User Experience**: Real application tracking, better error handling

## Related Files

- **DTO**: `src/lib/dtos/applications/create.application.dto.ts`
- **Routers**:
  - `src/server/routers/events.ts`
  - `src/server/routers/jobs.ts`
  - `src/server/routers/applications.ts`
- **Page**: `src/app/(routes)/s/hub/page.tsx`
- **Prisma Schema**: `prisma/schema.prisma`

## Contributing

When adding new features to the Hub page:

1. Keep components modular and focused on single responsibility
2. Use tRPC for all data operations (no direct Prisma calls from components)
3. Add proper TypeScript types for all props and data
4. Include loading and error states
5. Follow existing styling patterns (Tailwind + gradients)
6. Optimize database queries (use includes, avoid N+1)
7. Update this README with new features
