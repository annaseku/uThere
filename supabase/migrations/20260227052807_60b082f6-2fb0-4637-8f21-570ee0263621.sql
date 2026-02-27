
-- Add missing columns to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Users: users can read all users (for group member display), update only their own
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Groups: members can see their groups
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id integer)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE user_id = _user_id AND group_id = _group_id);
$$;

CREATE POLICY "Members can view their groups" ON public.groups FOR SELECT 
  USING (public.is_group_member(auth.uid(), group_id));

-- Group members: members can see other members in their groups
CREATE POLICY "Members can view group members" ON public.group_members FOR SELECT 
  USING (public.is_group_member(auth.uid(), group_id));

-- Places: users can CRUD their own places
CREATE POLICY "Users can view own places" ON public.places FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own places" ON public.places FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own places" ON public.places FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own places" ON public.places FOR DELETE USING (auth.uid() = user_id);

-- Place visibility: users can manage visibility for their own places
CREATE POLICY "Users can view own place visibility" ON public.place_visibility FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.places WHERE places.place_id = place_visibility.place_id AND places.user_id = auth.uid()));
CREATE POLICY "Users can insert own place visibility" ON public.place_visibility FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.places WHERE places.place_id = place_visibility.place_id AND places.user_id = auth.uid()));
CREATE POLICY "Users can update own place visibility" ON public.place_visibility FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.places WHERE places.place_id = place_visibility.place_id AND places.user_id = auth.uid()));
CREATE POLICY "Users can delete own place visibility" ON public.place_visibility FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.places WHERE places.place_id = place_visibility.place_id AND places.user_id = auth.uid()));

-- User locations: group members can see locations of people sharing location
CREATE POLICY "Users can view locations of group members" ON public.user_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = user_locations.user_id
    )
  );
CREATE POLICY "Users can upsert own location" ON public.user_locations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own location" ON public.user_locations FOR UPDATE USING (auth.uid() = user_id);

-- Avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
