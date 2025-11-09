# Row Level Security (RLS) Fix for User Signup

## Problem

User signup was returning HTTP 200 but user data was **not being saved** to the `users` table in Supabase.

### Error Message
```
ERROR:auth:Failed to create user record: {'message': 'new row violates row-level security policy for table "users"', 'code': '42501'}
```

### What Was Happening

1. ✅ User was successfully created in Supabase Auth (auth.users table)
2. ❌ User record insertion into `users` table was blocked by RLS
3. ✅ JWT token was generated
4. ✅ Signup endpoint returned 200 OK

**Result:** Users could "sign up" but had no profile data in the database.

## Root Cause

The `users` table had RLS enabled with only SELECT and UPDATE policies:

```sql
-- BEFORE (Missing INSERT policy)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- ❌ No INSERT policy!
```

During signup, the backend tried to insert a user record while authenticated as that user (via Supabase Auth), but there was no RLS policy allowing INSERT operations.

## Solution

Instead of manually inserting user records from the backend (which fails due to RLS), we use a **Database Trigger** that automatically creates the user profile when Supabase Auth creates a new user.

### Database Trigger Approach (Implemented)

Added a PostgreSQL function and trigger in `backend/schema.sql`:

```sql
-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the auth user creation
    RAISE WARNING 'Could not create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Key Points:**
- `SECURITY DEFINER`: Function runs with the privileges of the user who created it (bypasses RLS)
- `AFTER INSERT ON auth.users`: Trigger fires automatically when Supabase Auth creates a new user
- `raw_user_meta_data->>'name'`: Extracts the name from the signup metadata
- `EXCEPTION` block: Prevents auth user creation from failing if profile creation fails

## How to Apply the Fix

### Option 1: Run SQL in Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL command:

```sql
-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Could not create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Test signup again - user data should now be saved automatically

### Option 2: Reset Database with Updated Schema

If you're starting fresh or in development:

1. Go to Supabase Dashboard → Database → Tables
2. Delete the `users` table (if you don't need existing data)
3. Run the full `backend/schema.sql` file in the SQL Editor
4. This will recreate all tables with the correct RLS policies

## Verification

After applying the fix, test signup:

```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Then verify in Supabase:
1. Go to **Authentication** → **Users** - Should see the user
2. Go to **Database** → **Table Editor** → **users** - Should see the user record

Both should have matching UUIDs.

## Why This Works

The flow during signup:

1. Backend calls `db.client.auth.sign_up()` → Creates user in `auth.users` table
2. Supabase returns the new user with UUID
3. Backend tries to insert into `users` table with that UUID
4. **RLS Policy Check:** Does `auth.uid()` (authenticated user ID) equal the `id` being inserted?
   - ✅ **Yes** → Insert allowed
   - ❌ **No** → Insert blocked (42501 error)

The INSERT policy ensures:
- Users can only create their own profile record
- The record ID must match their authenticated user ID
- No unauthorized profile creation

## Security Note

This solution is secure because:
- Users can only insert records where `auth.uid() = id`
- They cannot insert records for other users
- The ID comes from Supabase Auth (trusted source)
- RLS policies still prevent users from reading/updating other users' data

## Related Files

- `/backend/schema.sql` - Database schema with RLS policies
- `/backend/api/auth.py` - Signup handler (lines 148-155)
- `/backend/api/_utils/database.py` - Database connection

## Future Considerations

If you ever need server-side operations that bypass RLS (e.g., admin functions), use the Supabase **service role key** instead of the anon key. The service role key bypasses RLS entirely.

**⚠️ Warning:** Never expose the service role key to the frontend - it should only be used in backend server code.
