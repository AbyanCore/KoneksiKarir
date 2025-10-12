# Dashboard Overview Component

This directory contains the modular components for the Admin Dashboard Overview page.

## Components Structure

### Main Component

- **`index.tsx`** - Main orchestrator component managing state and tRPC queries

### Sub-Components

- **`DashboardHeader.tsx`** - Page header with gradient background showing current view mode
- **`ControlsToolbar.tsx`** - View mode selector (Event/Lifetime) and download button
- **`MetricsCards.tsx`** - Four metric cards displaying totals (Companies, Jobs, Applications, Users)
- **`RecentApplicationsTable.tsx`** - Searchable table of recent applications
- **`StatusChart.tsx`** - Pie chart showing application status distribution
- **`EducationChart.tsx`** - Bar chart showing applicant education demographics
- **`JobTrendChart.tsx`** - Bar chart showing top jobs by application count

## Data Flow

### Queries

All queries support optional `eventId` parameter to filter data by specific event or show lifetime stats:

- **`trpc.dashboard.getOverviewStats`** - Fetches all base data (companies, jobs, applications, users, profiles, events)
- **`trpc.dashboard.getRecentApplications`** - Fetches recent applications with details
- **`trpc.dashboard.getStatusBreakdown`** - Groups applications by status
- **`trpc.dashboard.getTopJobs`** - Returns top jobs by application count
- **`trpc.dashboard.getEducationDemographics`** - Groups job seekers by education level

### Router Optimization

The dashboard router uses several optimization strategies:

1. **Parallel Queries** - All base data fetched in parallel using `Promise.all()`
2. **Selective Includes** - Only fetches needed fields to reduce payload
3. **Frontend Filtering** - Users and profiles filtered in frontend based on applications
4. **Optimized Aggregations** - Uses Prisma's `groupBy` for efficient statistics
5. **Smart Indexing** - Leverages database relations for fast joins

## Features

### View Modes

- **Event Mode** - Filter all data by a specific event
- **Lifetime Mode** - Show aggregated data across all events

### Real-time Statistics

- ✅ Total companies (filtered by event participation)
- ✅ Total jobs (per event or lifetime)
- ✅ Total applications with status breakdown
- ✅ Total registered users
- ✅ Recent applications with search functionality

### Analytics & Charts

- **Status Distribution** - Pie chart (ACCEPTED, REJECTED, PENDING)
- **Education Demographics** - Bar chart by education level (SMA, D3, S1, S2, S3)
- **Job Trends** - Top 10 jobs with gradient colors based on application volume
- **Search & Filter** - Real-time search across applicant email, job, company, status

### UI Features

- Gradient color themes matching brand
- Responsive grid layouts
- Interactive charts with tooltips
- Loading states
- Empty states with helpful messages
- Hover effects and transitions

## Data Structure

```typescript
// Overview Stats Response
interface OverviewStats {
  companies: Array<{ id; name; code; createdAt }>;
  jobs: Array<{
    id;
    title;
    companyId;
    eventId;
    salaryMin;
    salaryMax;
    createdAt;
  }>;
  applications: Array<{
    id;
    status;
    createdAt;
    jobSeekerId;
    jobId;
    job;
    jobSeeker;
  }>;
  users: Array<{ id; email; role; createdAt }>;
  jobSeekerProfiles: Array<{ id; userId; fullName; lastEducationLevel }>;
  events: Array<{ id; title; date; location }>;
}

// Recent Application
interface RecentApplication {
  id: number;
  applicantEmail: string;
  jobTitle: string;
  companyName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Status Breakdown
interface StatusData {
  name: string; // "ACCEPTED" | "REJECTED" | "PENDING"
  value: number;
}

// Education Demographics
interface EducationData {
  level: string; // "SMA" | "D3" | "S1" | "S2" | "S3" | "Unknown"
  count: number;
}

// Top Jobs
interface JobTrendData {
  jobId: number;
  name: string;
  count: number;
}
```

## Usage

```tsx
import DashboardOverview from "@/components/dashboard/overview";

export default function Page_AdminDashboard() {
  return <DashboardOverview />;
}
```

## Design Principles

- **SRP (Single Responsibility Principle)** - Each component has one clear purpose
- **KISS (Keep It Simple)** - Components are simple and focused
- **Modularity** - Easy to maintain, test, and extend
- **Optimized Queries** - Parallel fetching and efficient aggregations prevent N+1 queries
- **Frontend Population** - Statistics calculated in frontend from fetched data where appropriate
- **Type Safety** - Full TypeScript support with tRPC

## Performance Optimizations

1. **Parallel Data Fetching** - All dashboard queries run in parallel
2. **Memoization** - Computed values memoized with useMemo
3. **Selective Rendering** - Components only re-render when their data changes
4. **Database Optimization** - Indexed queries with selective field selection
5. **Frontend Filtering** - Search filtering done in frontend for instant results

## Dependencies

- Next.js 14 with App Router
- tRPC for type-safe API calls
- Prisma ORM with PostgreSQL
- Recharts for data visualization
- Shadcn UI components
- Tailwind CSS for styling
- Lucide React for icons

## Related Files

- **Router**: `src/server/routers/dashboard.ts`
- **Page**: `src/app/(routes)/s/admin/dashboard/page.tsx`
- **Main Router**: `src/server/index.ts`
- **Prisma Schema**: `prisma/schema.prisma`

## Chart Color Schemes

### Status Colors

- ACCEPTED: Green (#16a34a)
- REJECTED: Red (#dc2626)
- PENDING: Amber (#f59e0b)
- UNKNOWN: Gray (#6b7280)

### Job Trend Colors

- Dynamic gradient from light indigo (#e0e7ff) to dark indigo (#312e81)
- Colors interpolated based on application count (lower to higher)

### Education Chart

- Emerald gradient (#10b981) with 90% to 60% opacity
