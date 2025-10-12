# Users Dashboard Components

This directory contains modular components for the Users Management page.

## Components

- **`index.tsx`** - Main container component with business logic and state management
- **`UsersHeader.tsx`** - Header section with title and description
- **`SearchBar.tsx`** - Search input with total and blocked count badges
- **`JobseekersTable.tsx`** - Table displaying jobseekers with actions
- **`AdminCompaniesTable.tsx`** - Table displaying admin companies with actions
- **`ConfirmDialog.tsx`** - Confirmation dialog for block/delete actions

## Usage

```tsx
import UsersManagement from "@/components/dashboard/users";

export default function Page() {
  return <UsersManagement />;
}
```

## Features

- Search functionality for both jobseekers and admin companies
- Tab-based navigation between user types
- Block/Unblock user accounts
- Delete user accounts
- Real-time data fetching with tRPC
- Toast notifications for user actions
- Confirmation dialogs for destructive actions
