
-- Function to insert user activity
CREATE OR REPLACE FUNCTION public.insert_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_description TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_activities (user_id, activity_type, description)
  VALUES (p_user_id, p_activity_type, p_description);
END;
$$;
