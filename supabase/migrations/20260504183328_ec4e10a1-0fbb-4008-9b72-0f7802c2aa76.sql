
ALTER TABLE public.opportunity_products ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE public.investor_finder_opportunities ADD COLUMN IF NOT EXISTS platform text;

CREATE INDEX IF NOT EXISTS idx_opportunity_products_platform ON public.opportunity_products(platform);
CREATE INDEX IF NOT EXISTS idx_investor_finder_opportunities_platform ON public.investor_finder_opportunities(platform);

CREATE OR REPLACE FUNCTION public.approve_pending_item(
  _item_id uuid,
  _target_table text DEFAULT NULL,
  _platform text DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  itm RECORD;
  new_id uuid;
  ref text;
  enriched jsonb;
  v_industry text;
  v_location text;
  v_short text;
  v_category text;
  v_sub text;
  v_target text;
  v_platform text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Admin role required');
  END IF;

  SELECT * INTO itm FROM public.pipeline_pending_items WHERE id = _item_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Item not found');
  END IF;
  IF itm.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Item is not pending (status=' || itm.status || ')');
  END IF;

  enriched := COALESCE(itm.enriched_payload, itm.raw_payload, '{}'::jsonb);

  -- Admin override > source-based routing > staged target
  IF _target_table IS NOT NULL AND _target_table <> '' THEN
    v_target := _target_table;
  ELSIF itm.source = 'opportunity-research' THEN
    v_target := 'investor_finder_opportunities';
  ELSE
    v_target := itm.target_table;
  END IF;

  v_platform := NULLIF(_platform, '');
  IF v_platform = 'both' THEN v_platform := NULL; END IF;

  IF v_target = 'investor_finder_opportunities' THEN
    INSERT INTO public.investor_finder_opportunities (
      title, short_description, full_description, sector, sub_sector,
      geography, country, stage, ticket_size_min, ticket_size_max,
      currency, return_potential, expected_irr, expected_moic,
      conviction_score, ai_score, ai_tags, highlights, risks, thesis,
      image_url, source_url, source, category, status, platform
    ) VALUES (
      itm.title,
      left(COALESCE(NULLIF(itm.summary,''), enriched->>'description', itm.title), 500),
      COALESCE(enriched->>'full_description', enriched->>'description', enriched->>'thesis', itm.summary),
      COALESCE(enriched->>'sector', enriched->>'industry', itm.category),
      enriched->>'sub_sector',
      COALESCE(enriched->>'geography', enriched->>'region', enriched->>'country', 'Global'),
      enriched->>'country',
      COALESCE(enriched->>'stage', enriched->>'business_stage'),
      NULLIF(enriched->>'ticket_size_min','')::numeric,
      NULLIF(enriched->>'ticket_size_max','')::numeric,
      COALESCE(NULLIF(enriched->>'currency',''), 'GBP'),
      enriched->>'return_potential',
      NULLIF(enriched->>'expected_irr','')::numeric,
      NULLIF(enriched->>'expected_moic','')::numeric,
      COALESCE(itm.ai_score, 3.0),
      itm.ai_score,
      itm.ai_tags,
      CASE WHEN jsonb_typeof(enriched->'highlights') = 'array'
           THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'highlights')) END,
      CASE WHEN jsonb_typeof(enriched->'risks') = 'array'
           THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'risks')) END,
      COALESCE(enriched->>'thesis', enriched->>'investment_thesis'),
      COALESCE(enriched->>'image_url', enriched->>'thumbnail_url'),
      itm.source_url,
      itm.source,
      itm.category,
      'published',
      v_platform
    ) RETURNING id INTO new_id;

  ELSIF v_target = 'opportunities' THEN
    ref := 'AUTO-' || upper(substring(replace(itm.id::text, '-', '') from 1 for 8));
    v_industry := COALESCE(NULLIF(enriched->>'industry',''), NULLIF(enriched->>'sector',''), NULLIF(itm.category,''), 'General');
    v_location := COALESCE(NULLIF(enriched->>'location',''), NULLIF(enriched->>'country',''), NULLIF(enriched->>'region',''), 'Global');
    v_short := COALESCE(NULLIF(itm.summary,''), NULLIF(enriched->>'description',''), NULLIF(enriched->>'thesis',''), itm.title);

    INSERT INTO public.opportunities (
      ref_number, title, short_description, industry, location,
      business_description, industry_overview, business_highlights,
      financial_summary, team_overview, image_url, status
    ) VALUES (
      ref, itm.title, left(v_short, 500), v_industry, v_location,
      COALESCE(enriched->>'business_description', enriched->>'description', v_short),
      enriched->>'industry_overview',
      CASE WHEN jsonb_typeof(enriched->'highlights') = 'array'
           THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'highlights'))
           WHEN itm.ai_tags IS NOT NULL THEN itm.ai_tags
           ELSE NULL END,
      enriched->>'financial_summary',
      enriched->>'team_overview',
      COALESCE(enriched->>'image_url', enriched->>'thumbnail_url'),
      'published'
    ) RETURNING id INTO new_id;

  ELSIF v_target = 'opportunity_products' THEN
    v_category := COALESCE(NULLIF(enriched->>'category',''), NULLIF(itm.category,''), 'businesses');
    v_sub := COALESCE(NULLIF(enriched->>'sub_category',''), NULLIF(enriched->>'subcategory',''), 'General');
    v_short := COALESCE(NULLIF(itm.summary,''), NULLIF(enriched->>'description',''), itm.title);
    v_location := COALESCE(NULLIF(enriched->>'location',''), NULLIF(enriched->>'country',''), 'Global');

    INSERT INTO public.opportunity_products (
      title, short_description, full_description, category, sub_category,
      location, country, thumbnail_url,
      analyst_rating, overall_conviction_score,
      investment_thesis, status, featured, platform
    ) VALUES (
      itm.title,
      left(v_short, 500),
      COALESCE(enriched->>'full_description', enriched->>'description', v_short),
      v_category,
      v_sub,
      v_location,
      COALESCE(NULLIF(enriched->>'country',''), v_location),
      COALESCE(NULLIF(enriched->>'image_url',''), NULLIF(enriched->>'thumbnail_url','')),
      COALESCE(NULLIF(enriched->>'analyst_rating',''), 'Neutral'),
      COALESCE(itm.ai_score, 3.0),
      COALESCE(enriched->>'thesis', enriched->>'investment_thesis', itm.summary),
      'active',
      false,
      v_platform
    ) RETURNING id INTO new_id;

  ELSIF v_target = 'intel_events' THEN
    INSERT INTO public.intel_events (
      event_type, event_subtype, title, summary, source_url,
      signal_tier, confidence, confidence_score,
      raw_data, structured_data, status
    ) VALUES (
      COALESCE(enriched->>'event_type', itm.source, 'auto'),
      enriched->>'event_subtype',
      itm.title,
      itm.summary,
      itm.source_url,
      COALESCE(enriched->>'signal_tier', 'medium'),
      COALESCE(enriched->>'confidence', 'medium'),
      COALESCE(itm.ai_score, 3.0),
      enriched,
      enriched,
      'verified'
    ) RETURNING id INTO new_id;

  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'Unsupported target_table: ' || COALESCE(v_target,'NULL'));
  END IF;

  UPDATE public.pipeline_pending_items
  SET status = 'promoted',
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      promoted_id = new_id,
      target_table = v_target,
      target_platform = COALESCE(v_platform, target_platform)
  WHERE id = _item_id;

  RETURN jsonb_build_object('ok', true, 'promoted_id', new_id, 'target_table', v_target, 'platform', v_platform);
END;
$function$;
