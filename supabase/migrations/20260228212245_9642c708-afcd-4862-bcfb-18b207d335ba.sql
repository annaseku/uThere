
-- Add invite_code column to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Generate invite codes for existing groups
UPDATE public.groups SET invite_code = upper(substr(md5(random()::text), 1, 6)) WHERE invite_code IS NULL;

-- Make invite_code NOT NULL with a default
ALTER TABLE public.groups ALTER COLUMN invite_code SET DEFAULT upper(substr(md5(random()::text), 1, 6));
ALTER TABLE public.groups ALTER COLUMN invite_code SET NOT NULL;

-- Function to join a group by invite code (any authenticated user)
CREATE OR REPLACE FUNCTION public.join_group_by_code(_code text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id integer;
BEGIN
  SELECT group_id INTO _group_id FROM public.groups WHERE invite_code = upper(_code);
  IF _group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Already a member of this group';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (_group_id, auth.uid(), 'member');

  RETURN _group_id;
END;
$$;

-- Allow any group member to read invite_code (already covered by existing SELECT policy)
-- Allow any member to add other members
CREATE POLICY "Members can add members" ON public.group_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.group_members existing WHERE existing.group_id = group_members.group_id AND existing.user_id = auth.uid())
  OR auth.uid() = user_id
);

-- Drop old restrictive insert policy and keep new one
DROP POLICY IF EXISTS "Users can insert group members" ON public.group_members;
