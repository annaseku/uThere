
CREATE OR REPLACE FUNCTION public.create_group_with_admin(
  _name text,
  _primary_address text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id integer;
BEGIN
  INSERT INTO public.groups (name, primary_address)
  VALUES (_name, _primary_address)
  RETURNING group_id INTO _group_id;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (_group_id, auth.uid(), 'admin');

  RETURN _group_id;
END;
$$;
