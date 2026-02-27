
-- Fix ALL policies to be PERMISSIVE (default) instead of RESTRICTIVE

-- === GROUPS ===
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Members can view their groups" ON public.groups;

CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update their groups" ON public.groups FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = groups.group_id AND group_members.user_id = auth.uid() AND group_members.role = 'admin'));
CREATE POLICY "Members can view their groups" ON public.groups FOR SELECT TO authenticated USING (is_group_member(auth.uid(), group_id));

-- === GROUP_MEMBERS ===
DROP POLICY IF EXISTS "Admins can add other group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can add themselves to groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can remove group members" ON public.group_members;
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;

CREATE POLICY "Users can insert group members" ON public.group_members FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM group_members existing WHERE existing.group_id = group_members.group_id AND existing.user_id = auth.uid() AND existing.role = 'admin')
);
CREATE POLICY "Admins can remove group members" ON public.group_members FOR DELETE TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM group_members existing WHERE existing.group_id = group_members.group_id AND existing.user_id = auth.uid() AND existing.role = 'admin')
);
CREATE POLICY "Members can view group members" ON public.group_members FOR SELECT TO authenticated USING (is_group_member(auth.uid(), group_id));

-- === PLACES ===
DROP POLICY IF EXISTS "Users can delete own places" ON public.places;
DROP POLICY IF EXISTS "Users can insert own places" ON public.places;
DROP POLICY IF EXISTS "Users can update own places" ON public.places;
DROP POLICY IF EXISTS "Users can view own places" ON public.places;

CREATE POLICY "Users can view own places" ON public.places FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own places" ON public.places FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own places" ON public.places FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own places" ON public.places FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- === PLACE_VISIBILITY ===
DROP POLICY IF EXISTS "Users can view own place visibility" ON public.place_visibility;
DROP POLICY IF EXISTS "Users can insert own place visibility" ON public.place_visibility;
DROP POLICY IF EXISTS "Users can update own place visibility" ON public.place_visibility;
DROP POLICY IF EXISTS "Users can delete own place visibility" ON public.place_visibility;

CREATE POLICY "Users can view own place visibility" ON public.place_visibility FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM places WHERE places.place_id = place_visibility.place_id AND places.user_id = auth.uid()));
CREATE POLICY "Users can insert own place visibility" ON public.place_visibility FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM places WHERE places.place_id = place_visibility.place_id AND places.user_id = auth.uid()));
CREATE POLICY "Users can update own place visibility" ON public.place_visibility FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM places WHERE places.place_id = place_visibility.place_id AND places.user_id = auth.uid()));
CREATE POLICY "Users can delete own place visibility" ON public.place_visibility FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM places WHERE places.place_id = place_visibility.place_id AND places.user_id = auth.uid()));

-- === USER_LOCATIONS ===
DROP POLICY IF EXISTS "Users can update own location" ON public.user_locations;
DROP POLICY IF EXISTS "Users can upsert own location" ON public.user_locations;
DROP POLICY IF EXISTS "Users can view locations of group members" ON public.user_locations;

CREATE POLICY "Users can upsert own location" ON public.user_locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own location" ON public.user_locations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view locations of group members" ON public.user_locations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM group_members gm1 JOIN group_members gm2 ON gm1.group_id = gm2.group_id WHERE gm1.user_id = auth.uid() AND gm2.user_id = user_locations.user_id));

-- === USERS ===
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;

CREATE POLICY "Users can view all users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = user_id);
