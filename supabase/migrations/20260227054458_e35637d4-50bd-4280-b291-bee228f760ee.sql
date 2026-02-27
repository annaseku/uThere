
-- Add primary_address to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS primary_address text;

-- Allow group admins to update their groups
CREATE POLICY "Admins can update their groups"
ON public.groups
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = groups.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

-- Allow group admins to insert members
CREATE POLICY "Admins can add group members"
ON public.group_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members existing
    WHERE existing.group_id = group_members.group_id
    AND existing.user_id = auth.uid()
    AND existing.role = 'admin'
  )
);

-- Allow members to remove themselves or admins to remove others
CREATE POLICY "Admins can remove group members"
ON public.group_members
FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.group_members existing
    WHERE existing.group_id = group_members.group_id
    AND existing.user_id = auth.uid()
    AND existing.role = 'admin'
  )
);

-- Create trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
