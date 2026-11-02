CREATE TABLE public.story_progress (
 profile_id text PRIMARY KEY,
 progress jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.story_progress TO service_role;
REVOKE ALL ON public.story_progress FROM anon, authenticated;
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.story_progress IS 'Private single-profile progress; only session-verified server operations can access it. No public policies.';
CREATE FUNCTION public.merge_story_progress(p_profile text, p_patch jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
 INSERT INTO public.story_progress(profile_id, progress) VALUES(p_profile, '{}'::jsonb) ON CONFLICT DO NOTHING;
 SELECT progress INTO result FROM public.story_progress WHERE profile_id=p_profile FOR UPDATE;
 result := result || p_patch;
 UPDATE public.story_progress SET progress=result, updated_at=now() WHERE profile_id=p_profile;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.merge_story_progress(text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.merge_story_progress(text,jsonb) TO service_role;