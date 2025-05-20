
-- Function to get user activities safely
CREATE OR REPLACE FUNCTION public.get_user_activities(p_user_id UUID)
RETURNS SETOF public.user_activities
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.user_activities
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
END;
$$;
