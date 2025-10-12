# Database Migration Scripts

This folder contains utility scripts for database migrations and maintenance.

## Available Scripts

### `hash-passwords.ts`

**Purpose:** Migrates plain text passwords to bcrypt hashed passwords.

**When to use:**

- After enabling password hashing in the authentication system
- When you have existing users with plain text passwords in the database
- Safe to run multiple times (skips already hashed passwords)

**How to run:**

```bash
# Option 1: Using tsx (recommended)
npx tsx scripts/hash-passwords.ts

# Option 2: Using ts-node
npx ts-node scripts/hash-passwords.ts

# Option 3: Add to package.json scripts
npm run migrate:passwords
```

**Example output:**

```
🔍 Finding users with plain text passwords...
✅ Hashed password for: user1@example.com
✅ Hashed password for: user2@example.com
⏭️  Skipping admin@example.com - already hashed

📊 Migration Summary:
   - Passwords hashed: 2
   - Passwords skipped (already hashed): 1
   - Total users: 3

✨ All plain text passwords have been hashed successfully!
```

**What it does:**

1. Fetches all users from the database
2. Checks if each password is already hashed (bcrypt hashes start with `$2`)
3. Hashes plain text passwords using bcrypt (10 salt rounds)
4. Updates the database with hashed passwords
5. Provides a summary of the migration

**Safety features:**

- ✅ Idempotent: Safe to run multiple times
- ✅ Automatic detection: Skips already hashed passwords
- ✅ Logging: Shows progress for each user
- ✅ Error handling: Exits with code 1 on error

## Adding the Script to package.json

Add this to your `package.json` scripts section:

```json
{
  "scripts": {
    "migrate:passwords": "tsx scripts/hash-passwords.ts"
  }
}
```

Then run with:

```bash
npm run migrate:passwords
```

## Prerequisites

Make sure you have these packages installed:

```bash
npm install -D tsx
# or
npm install -D ts-node
```

## Environment Variables

Ensure your `.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/koneksikarir"
```

## Notes

- The script uses the same bcrypt configuration as the auth system (10 salt rounds)
- Passwords are hashed using `bcrypt.hash(password, 10)`
- The script automatically disconnects from Prisma after completion
- All operations are logged to console for transparency
