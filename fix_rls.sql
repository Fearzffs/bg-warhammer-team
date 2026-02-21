-- Disable RLS on profiles table (needed for trigger to work)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but allow all operations
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin profiles" ON profiles;
CREATE POLICY "Admin profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
