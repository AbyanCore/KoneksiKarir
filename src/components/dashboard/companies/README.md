# Companies Dashboard Components

This directory contains modular components for the Companies Management page.

## Components

- **`index.tsx`** - Main container component with business logic and state management
- **`CompaniesHeader.tsx`** - Header section with title and add button
- **`StatsCards.tsx`** - Stats display for companies, jobs, and applications
- **`SearchBar.tsx`** - Search input for filtering companies
- **`CompaniesGrid.tsx`** - Grid displaying company cards with actions
- **`CompanyFormSheet.tsx`** - Reusable form for creating and editing companies
- **`DeleteConfirmSheet.tsx`** - Confirmation dialog for delete actions
- **`CompanyDetailSheet.tsx`** - Detailed company view with event participation

## Usage

```tsx
import CompaniesManagement from "@/components/dashboard/companies";

export default function Page() {
  return <CompaniesManagement />;
}
```

## Features

- Search functionality for companies
- CRUD operations (Create, Read, Update, Delete)
- Real-time data fetching with tRPC
- Optimized queries (no N+1 problems)
- Statistics aggregation
- Event participation tracking
- Job listings per event
- Application counts
- Toast notifications for user actions
- Form validation
- Code generation for company registration

## Data Structure

The component uses optimized tRPC queries:

- `findAllWithStats` - Fetches all companies with aggregated stats (single query)
- `findOneWithDetails` - Fetches company with full event and job details when viewing

## Best Practices Applied

1. **SRP (Single Responsibility Principle)** - Each component has one clear purpose
2. **KISS (Keep It Simple, Stupid)** - Components are straightforward and easy to understand
3. **Modular Architecture** - Easy to maintain and test individual components
4. **Optimized Queries** - No N+1 query problems, data is fetched efficiently
5. **Frontend Population** - Complex data relationships are populated and transformed in the frontend
