
-- Allow authenticated users to create groups
CREATE POLICY "Authenticated users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to insert themselves as admin when creating a group
-- (they need to be able to add themselves before is_group_member returns true)
CREATE POLICY "Users can add themselves to groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Drop the old restrictive admin-only insert policy and replace
DROP POLICY IF EXISTS "Admins can add group members" ON public.group_members;

-- Re-add admin insert policy (admins can add OTHER members)
CREATE POLICY "Admins can add other group members"
ON public.group_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM group_members existing
    WHERE existing.group_id = group_members.group_id
    AND existing.user_id = auth.uid()
    AND existing.role = 'admin'
  )
);
