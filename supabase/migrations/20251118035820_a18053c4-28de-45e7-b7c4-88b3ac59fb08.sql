-- Drop existing restrictive policies on team_members
DROP POLICY IF EXISTS "Authenticated users can view team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can delete team members" ON team_members;

-- Create permissive policies that allow all authenticated users to manage team members
CREATE POLICY "Anyone authenticated can select team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone authenticated can insert team members"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update team members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone authenticated can delete team members"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (true);