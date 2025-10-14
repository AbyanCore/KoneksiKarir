# Company Signup & Admin Redirect - Update Summary

## Date: October 14, 2025

## Changes Made

### 1. ✅ Company Signup Completion

#### Updated: `src/app/(routes)/auth/signup/company/page.tsx`

**Changes:**

- Added tRPC client import
- Added toast notifications import
- Integrated `createCompanyAccount` mutation
- Replaced manual API call with tRPC mutation
- Added proper error handling with toast notifications
- Updated loading state to use `isPending` (tRPC v11+)

**Features:**

- ✅ Company code validation (checks against database)
- ✅ Email uniqueness check
- ✅ Password hashing with bcrypt
- ✅ Success/error toast notifications
- ✅ Auto-redirect to signin after successful signup
- ✅ Loading state during submission

#### Updated: `src/server/routers/users.ts`

**Changes:**

- Uncommented and enhanced company code validation
- Added email uniqueness check
- Improved error messages
- Added proper validation flow

**Validation Flow:**

1. Check if company code exists in database
2. Check if email is already registered
3. Hash password with bcrypt (10 salt rounds)
4. Create user with ADMIN_COMPANY role
5. Return new user

**Error Messages:**

- Invalid company code: "Invalid company code. Please contact your administrator for a valid code."
- Duplicate email: "An account with this email already exists."

### 2. ✅ Admin Login Redirect Update

#### Updated: `src/components/auth/auth-provider.tsx`

**Changes:**

- Changed admin redirect from `/s/admin` to `/s/admin/dashboard`

**Redirect Logic:**

```typescript
const redirectPath =
  data.user.role === "ADMIN"
    ? "/s/admin/dashboard" // ✅ Updated
    : data.user.role === "ADMIN_COMPANY"
    ? "/s/company/dashboard"
    : data.user.role === "JOB_SEEKER"
    ? "/s/profile"
    : "/s/hub";
```

## Complete Signup Flow

### For Company Account Creation:

1. **User visits** `/auth/signup/company`
2. **User fills form:**
   - Email (company email)
   - Company Code (6-digit OTP from database)
   - Password
   - Password Confirmation
3. **Form validation** (client-side):
   - Email format validation
   - Password strength validation
   - Password confirmation match
   - Code must be exactly 6 digits
4. **Submit triggers tRPC mutation:**
   - Validates company code against database
   - Checks email uniqueness
   - Hashes password
   - Creates user with ADMIN_COMPANY role
5. **Success:**
   - Toast: "Company account created successfully! Please sign in."
   - Redirect to `/auth/signin`
6. **Error:**
   - Toast with specific error message
   - User stays on signup page to correct errors

### After Signin:

**ADMIN users:**

- Redirect to `/s/admin/dashboard` ✅ (Updated)

**ADMIN_COMPANY users:**

- Redirect to `/s/company/dashboard`

**JOB_SEEKER users:**

- Redirect to `/s/profile`

**Other roles:**

- Redirect to `/s/hub`

## Testing Checklist

To test the company signup:

1. **Get a valid company code:**

   - Query database for existing company codes
   - Or create a new company in database with a code

2. **Test signup flow:**

   - [ ] Navigate to `/auth/signup/company`
   - [ ] Try invalid company code - should show error
   - [ ] Try existing email - should show error
   - [ ] Try valid data - should succeed and redirect
   - [ ] Sign in with new account
   - [ ] Verify redirect to company dashboard

3. **Test admin redirect:**
   - [ ] Sign in as ADMIN user
   - [ ] Verify redirect to `/s/admin/dashboard` (not `/s/admin`)

## Database Requirements

### For Company Signup to Work:

The `Company` table must have existing records with valid `code` values:

```sql
-- Example: Check existing company codes
SELECT id, name, code FROM "Company";

-- Example: Create a test company with code
INSERT INTO "Company" (name, code, location, description)
VALUES ('Test Company', '123456', 'Jakarta', 'A test company for signup');
```

### Company Code Format:

- Exactly 6 digits
- Must exist in database
- Stored in `Company.code` field

## Security Features

1. **Company Code Validation:**

   - Prevents unauthorized company account creation
   - Ensures only companies registered by admin can have accounts

2. **Email Uniqueness:**

   - Prevents duplicate accounts
   - Catches conflicts early in the flow

3. **Password Security:**

   - Hashed with bcrypt (10 rounds)
   - Never stored in plain text

4. **Role Assignment:**
   - Automatically assigns ADMIN_COMPANY role
   - Cannot be overridden by user

## Files Modified

1. `src/app/(routes)/auth/signup/company/page.tsx`

   - Added tRPC integration
   - Added error handling
   - Improved UX with toasts

2. `src/server/routers/users.ts`

   - Enabled company code validation
   - Added email uniqueness check
   - Improved error messages

3. `src/components/auth/auth-provider.tsx`
   - Updated admin redirect path

## Related Documentation

See also:

- `COMPANY_PORTAL_IMPLEMENTATION.md` - Complete company portal documentation
- `src/lib/dtos/users/create.company-account.dto.ts` - Signup DTO schema
- `prisma/schema.prisma` - Database schema

## Notes

- Company code validation is now **active** and **required**
- Ensure companies have valid codes in database before allowing signups
- Admin can create companies with codes through admin dashboard
- Company codes should be generated securely and shared only with authorized companies
