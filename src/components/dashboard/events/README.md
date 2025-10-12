# Events Management Dashboard

This directory contains the modular components for the Events Management page in the admin dashboard.

## Components Structure

### Main Component

- **`index.tsx`** - Main orchestrator component that manages state and tRPC queries

### Sub-Components

- **`EventsHeader.tsx`** - Page header with gradient background and "Create Event" button
- **`StatsCards.tsx`** - Display statistics (total events, jobs, applications) in three cards
- **`SearchBar.tsx`** - Search input to filter events
- **`EventsGrid.tsx`** - Grid display of event cards with badges and action buttons
- **`EventFormSheet.tsx`** - Reusable form sheet for creating and editing events
- **`DeleteConfirmSheet.tsx`** - Confirmation dialog for event deletion
- **`EventDetailSheet.tsx`** - Detailed view showing event info, stats, and participating companies

## Data Flow

### Queries

- **`trpc.events.findAllWithStats`** - Fetches all events with job/company counts and application counts
- **`trpc.events.findOneWithDetails`** - Fetches detailed event data including participating companies

### Mutations

- **`trpc.events.create`** - Creates a new event
- **`trpc.events.update`** - Updates an existing event
- **`trpc.events.delete`** - Deletes an event

## Features

### Event Management

- ✅ Create new career fair events
- ✅ Edit existing events (title, description, date, location, banner/minimap URLs)
- ✅ Delete events with confirmation
- ✅ View detailed event information
- ✅ Search events by title, description, or location
- ✅ Display event stats (jobs, companies, applications)
- ✅ Show participating companies with stand numbers

### UI Features

- Gradient background themes (indigo → purple → pink)
- Responsive grid layout
- Badge indicators for upcoming/past events
- Toast notifications for all actions
- Loading states for async operations
- Form validation (all fields required)
- Date picker for event dates

## Event Structure

```typescript
interface Event {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
  minimapUrl: string;
  date: Date | string;
  location: string | null;
  applicationCount?: number;
  _count?: {
    Job: number;
    EventCompanyParticipation: number;
  };
}
```

## Usage

```tsx
import EventsManagement from "@/components/dashboard/events";

export default function Page_AdminEvents() {
  return <EventsManagement />;
}
```

## Design Principles

- **SRP (Single Responsibility Principle)** - Each component has one clear purpose
- **KISS (Keep It Simple)** - Components are simple and focused
- **Modularity** - Easy to maintain, test, and extend
- **Optimized Queries** - Single database calls with includes to prevent N+1 queries
- **Frontend Data Population** - Stats and counts calculated in the frontend from fetched data

## Dependencies

- Next.js 14 with App Router
- tRPC for type-safe API calls
- Shadcn UI components
- Tailwind CSS for styling
- Lucide React for icons
- Sonner for toast notifications
- Zod for validation schemas

## Related Files

- **DTOs**: `src/lib/dtos/events/create.event.dto.ts`, `update.event.dto.ts`
- **Router**: `src/server/routers/events.ts`
- **Page**: `src/app/(routes)/s/admin/events/page.tsx`
- **Prisma Schema**: `prisma/schema.prisma`
