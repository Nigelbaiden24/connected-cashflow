CREATE OR REPLACE FUNCTION public.promote_analyst_market_commentary(
  _commentary_id uuid,
  _platform text DEFAULT 'both'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_item public.analyst_market_commentary%ROWTYPE;
  v_platform text := COALESCE(NULLIF(_platform, ''), 'both');
  v_new_id uuid;
  v_description text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Authentication required');
  END IF;

  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Admin role required');
  END IF;

  IF v_platform NOT IN ('finance', 'investor', 'both') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid target platform');
  END IF;

  SELECT * INTO v_item
  FROM public.analyst_market_commentary
  WHERE id = _commentary_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Market commentary item not found');
  END IF;

  v_description := COALESCE(
    NULLIF(v_item.mobile_summary, ''),
    NULLIF(v_item.executive_summary, ''),
    NULLIF(v_item.push_summary, ''),
    NULLIF(v_item.market_implications, ''),
    'AI-generated institutional market commentary'
  );

  INSERT INTO public.market_commentary (
    title,
    description,
    file_path,
    published_date,
    uploaded_by
  ) VALUES (
    v_item.headline,
    left(v_description, 1200),
    'ai-market-commentary/' || v_item.id::text || '.md',
    CURRENT_DATE,
    auth.uid()
  )
  RETURNING id INTO v_new_id;

  UPDATE public.analyst_market_commentary
  SET status = 'promoted',
      target_platform = v_platform,
      reviewed_at = now(),
      reviewed_by = auth.uid()
  WHERE id = _commentary_id;

  RETURN jsonb_build_object(
    'ok', true,
    'promoted_id', v_new_id,
    'target_table', 'market_commentary',
    'platform', v_platform
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_analyst_market_commentary(uuid, text) TO authenticated;