# KoneksiKarir - Career Fair Management System

## Overview

KoneksiKarir is a modern web application built with Next.js that connects job seekers with companies during career fair events. The platform facilitates the entire career fair experience from event browsing to job applications.

## Tech Stack

## Admin seeder

This project includes an automatic and a manual admin seeder to create or update an admin user with a fixed id of `admin`.

- Automatic: When the application starts, if both `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables are set, the server will upsert a user with `id = "admin"` (email/password/role). This runs from `src/lib/prisma.ts` and is idempotent.
- Manual: You can run the seeder script directly:

```bash
# set env vars and run
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=changeme npx tsx scripts/seed-admin.ts
```

Notes:

- The seeder stores the password hashed using bcrypt (10 salt rounds).
- Changing the `ADMIN_EMAIL` or `ADMIN_PASSWORD` env values and restarting the app will update the admin record.
- In CI or production, ensure `ADMIN_PASSWORD` is a secure secret and not checked into source control.
