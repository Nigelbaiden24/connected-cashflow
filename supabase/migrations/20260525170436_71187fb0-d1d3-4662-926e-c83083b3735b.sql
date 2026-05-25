CREATE OR REPLACE FUNCTION public.approve_pending_item(_item_id uuid, _target_table text DEFAULT NULL::text, _platform text DEFAULT NULL::text)
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
  v_stored_platform text;
  v_rating text;
  v_score numeric;
  v_text text;
  v_price numeric;
  v_price_raw text;
  v_currency text;
  v_image text;
  v_gallery text[];
  v_highlights text[];
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Authentication required');
  END IF;

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
  v_score := LEAST(5, GREATEST(0, COALESCE(itm.ai_score, 3.0)));

  -- Data Pipeline is investor-only Opportunity Intelligence.
  v_target := COALESCE(NULLIF(_target_table, ''), 'opportunity_products');
  v_stored_platform := COALESCE(NULLIF(_platform, ''), NULLIF(itm.target_platform, ''), 'investor');
  v_platform := CASE WHEN v_stored_platform = 'both' THEN NULL ELSE v_stored_platform END;

  v_price_raw := COALESCE(
    NULLIF(enriched->>'price',''), NULLIF(enriched->>'asking_price',''),
    NULLIF(enriched->>'valuation',''), NULLIF(enriched->>'value',''),
    NULLIF(enriched->>'amount',''), NULLIF(enriched->>'ticket_size_min',''),
    NULLIF(enriched->>'fund_size','')
  );
  IF v_price_raw IS NOT NULL THEN
    DECLARE
      cleaned text := lower(v_price_raw);
      mult numeric := 1;
      num text;
    BEGIN
      IF cleaned LIKE '%bn%' OR cleaned LIKE '%billion%' THEN mult := 1000000000;
      ELSIF cleaned LIKE '%m%' AND cleaned NOT LIKE '%min%' THEN mult := 1000000;
      ELSIF cleaned LIKE '%k%' THEN mult := 1000;
      END IF;
      num := regexp_replace(cleaned, '[^0-9.]', '', 'g');
      IF num <> '' AND num <> '.' THEN
        BEGIN v_price := num::numeric * mult; EXCEPTION WHEN OTHERS THEN v_price := NULL; END;
      END IF;
    END;
  END IF;

  v_currency := COALESCE(NULLIF(enriched->>'currency',''), NULLIF(enriched->>'price_currency',''), 'GBP');

  v_image := COALESCE(
    NULLIF(enriched->>'generated_thumbnail_url',''), NULLIF(enriched->>'ai_thumbnail_url',''),
    NULLIF(enriched->>'thumbnail_url',''), NULLIF(enriched->>'image_url',''),
    NULLIF(enriched->>'image',''), NULLIF(enriched->>'logo_url',''),
    NULLIF(enriched->>'cover_image',''), NULLIF(enriched->>'hero_image',''),
    NULLIF(enriched->>'og_image',''), NULLIF(enriched->>'imageUrl',''),
    NULLIF(enriched#>>'{metadata,image_url}',''), NULLIF(enriched#>>'{metadata,thumbnail_url}',''),
    NULLIF(enriched#>>'{source,image_url}',''), NULLIF(enriched#>>'{source,thumbnail_url}','')
  );

  IF v_image IS NULL AND jsonb_typeof(enriched->'images') = 'array' THEN
    SELECT v INTO v_image
    FROM jsonb_array_elements_text(enriched->'images') AS t(v)
    WHERE v ~* '^https?://' AND v !~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
    LIMIT 1;
  END IF;

  IF v_image IS NULL AND jsonb_typeof(enriched->'gallery_images') = 'array' THEN
    SELECT v INTO v_image
    FROM jsonb_array_elements_text(enriched->'gallery_images') AS t(v)
    WHERE v ~* '^https?://' AND v !~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
    LIMIT 1;
  END IF;

  -- Never invent a generic stock thumbnail during promotion.
  IF v_image ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder' THEN
    v_image := NULL;
  END IF;

  -- Build gallery using a proper subquery alias (the previous version self-referenced
  -- jsonb_array_elements_text in a WHERE clause, which Postgres rejects with
  -- "column jsonb_array_elements_text does not exist" — that bubbled up as the
  -- promote-failed error users were seeing).
  IF jsonb_typeof(enriched->'gallery_images') = 'array' THEN
    SELECT ARRAY(
      SELECT v FROM jsonb_array_elements_text(enriched->'gallery_images') AS t(v)
      WHERE v ~* '^https?://'
        AND v !~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
    ) INTO v_gallery;
  ELSIF jsonb_typeof(enriched->'images') = 'array' THEN
    SELECT ARRAY(
      SELECT v FROM jsonb_array_elements_text(enriched->'images') AS t(v)
      WHERE v ~* '^https?://'
        AND v !~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
    ) INTO v_gallery;
  ELSIF v_image IS NOT NULL THEN
    v_gallery := ARRAY[v_image];
  ELSE
    v_gallery := ARRAY[]::text[];
  END IF;

  IF v_image IS NOT NULL AND (v_gallery IS NULL OR array_length(v_gallery, 1) IS NULL) THEN
    v_gallery := ARRAY[v_image];
  END IF;

  v_highlights := CASE WHEN jsonb_typeof(enriched->'highlights') = 'array'
                       THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'highlights'))
                       ELSE itm.ai_tags END;

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
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'ticket_size_min',''), '[^0-9.-]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'ticket_size_min', '[^0-9.-]', '', 'g'), '')::numeric ELSE v_price END,
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'ticket_size_max',''), '[^0-9.-]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'ticket_size_max', '[^0-9.-]', '', 'g'), '')::numeric ELSE NULL END,
      v_currency,
      enriched->>'return_potential',
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'expected_irr',''), '[^0-9.-]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'expected_irr', '[^0-9.-]', '', 'g'), '')::numeric ELSE NULL END,
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'expected_moic',''), '[^0-9.-]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'expected_moic', '[^0-9.-]', '', 'g'), '')::numeric ELSE NULL END,
      v_score, v_score, itm.ai_tags, v_highlights,
      CASE WHEN jsonb_typeof(enriched->'risks') = 'array' THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'risks')) END,
      COALESCE(enriched->>'thesis', enriched->>'investment_thesis', itm.summary),
      v_image, itm.source_url, itm.source, itm.category, 'published', v_platform
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
      enriched->>'industry_overview', v_highlights,
      COALESCE(enriched->>'financial_summary',
        CASE WHEN v_price IS NOT NULL THEN 'Indicative valuation: ' || v_currency || ' ' || to_char(v_price, 'FM999,999,999,999') ELSE NULL END),
      enriched->>'team_overview', v_image, 'published'
    ) RETURNING id INTO new_id;

  ELSIF v_target = 'opportunity_products' THEN
    v_text := lower(COALESCE(NULLIF(enriched->>'category',''), NULLIF(itm.category,''), NULLIF(enriched->>'sector',''), NULLIF(enriched->>'industry',''), 'businesses'));
    v_category := CASE
      WHEN v_text IN ('uk_property','vehicles','overseas_property','businesses','private_equity','memorabilia','commodities','funds','real_estate','private_business','collectibles_luxury') THEN v_text
      WHEN v_text LIKE '%property%' AND (v_text LIKE '%overseas%' OR v_text LIKE '%international%') THEN 'overseas_property'
      WHEN v_text LIKE '%property%' OR v_text LIKE '%real estate%' OR v_text LIKE '%real-estate%' THEN 'real_estate'
      WHEN v_text LIKE '%vehicle%' OR v_text LIKE '%car%' OR v_text LIKE '%auto%' THEN 'vehicles'
      WHEN v_text LIKE '%private equity%' OR v_text LIKE '%venture%' OR v_text LIKE '%startup%' OR v_text LIKE '%funding%' OR v_text LIKE '%pe%vc%' THEN 'private_equity'
      WHEN v_text LIKE '%watch%' OR v_text LIKE '%timepiece%' OR v_text LIKE '%memorabilia%' OR v_text LIKE '%collectible%' OR v_text LIKE '%luxury%' THEN 'memorabilia'
      WHEN v_text LIKE '%commodity%' OR v_text LIKE '%commodities%' OR v_text LIKE '%gold%' OR v_text LIKE '%oil%' OR v_text LIKE '%energy%' THEN 'commodities'
      WHEN v_text LIKE '%fund%' OR v_text LIKE '%etf%' THEN 'funds'
      ELSE 'businesses'
    END;
    v_sub := COALESCE(NULLIF(enriched->>'sub_category',''), NULLIF(enriched->>'subcategory',''), NULLIF(enriched->>'sector',''), NULLIF(itm.category,''), 'General');
    v_short := COALESCE(NULLIF(itm.summary,''), NULLIF(enriched->>'description',''), itm.title);
    v_location := COALESCE(NULLIF(enriched->>'location',''), NULLIF(enriched->>'country',''), 'Global');
    v_text := lower(COALESCE(NULLIF(enriched->>'analyst_rating',''), NULLIF(enriched->>'rating',''), ''));
    v_rating := CASE
      WHEN v_text IN ('gold','strong buy','buy','high conviction','positive','outperform','5','5.0') THEN 'Gold'
      WHEN v_text IN ('silver','accumulate','moderate buy','4','4.0') THEN 'Silver'
      WHEN v_text IN ('bronze','hold positive','3','3.0') THEN 'Bronze'
      WHEN v_text IN ('negative','sell','avoid','underperform','1','1.0') THEN 'Negative'
      ELSE 'Neutral' END;
    INSERT INTO public.opportunity_products (
      title, short_description, full_description, category, sub_category,
      price, price_currency, location, country, thumbnail_url, gallery_images,
      analyst_rating, overall_conviction_score,
      quality_score, value_score, liquidity_score, risk_score,
      investment_thesis, strengths, risks, suitable_investor_type, key_watchpoints,
      product_details, industry, business_stage,
      annual_revenue, employee_count, founding_year,
      property_type, bedrooms, bathrooms, square_footage, year_built, rental_yield,
      provenance, condition, status, featured, platform, source
    ) VALUES (
      itm.title, left(v_short, 500),
      COALESCE(enriched->>'full_description', enriched->>'description', v_short),
      v_category, v_sub, v_price, v_currency, v_location,
      COALESCE(NULLIF(enriched->>'country',''), v_location), v_image, v_gallery,
      v_rating, v_score, v_score, v_score, v_score,
      LEAST(5, GREATEST(0, 5 - v_score)),
      COALESCE(enriched->>'thesis', enriched->>'investment_thesis', itm.summary),
      COALESCE(enriched->>'strengths', array_to_string(v_highlights, E'\n• ')),
      COALESCE(enriched->>'risks', enriched->>'risk_factors'),
      COALESCE(enriched->>'suitable_investor_type', enriched->>'investor_type', 'Sophisticated individual investors / HNW'),
      COALESCE(enriched->>'key_watchpoints', enriched->>'watchpoints'),
      enriched || jsonb_build_object('pipeline_source', itm.source, 'source_url', itm.source_url, 'resolved_image_url', v_image),
      COALESCE(enriched->>'industry', enriched->>'sector'),
      enriched->>'business_stage',
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'annual_revenue',''), '[^0-9.-]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'annual_revenue', '[^0-9.-]', '', 'g'), '')::numeric ELSE NULL END,
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'employee_count',''), '[^0-9]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'employee_count', '[^0-9]', '', 'g'), '')::int ELSE NULL END,
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'founding_year', enriched->>'incorporation_date',''), '[^0-9]', '', 'g'), '') IS NOT NULL
           THEN substring(regexp_replace(COALESCE(enriched->>'founding_year', enriched->>'incorporation_date',''), '[^0-9]', '', 'g') from 1 for 4)::int ELSE NULL END,
      enriched->>'property_type',
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'bedrooms',''), '[^0-9]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'bedrooms', '[^0-9]', '', 'g'), '')::int ELSE NULL END,
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'bathrooms',''), '[^0-9]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'bathrooms', '[^0-9]', '', 'g'), '')::int ELSE NULL END,
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'square_footage',''), '[^0-9.-]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'square_footage', '[^0-9.-]', '', 'g'), '')::numeric ELSE NULL END,
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'year_built',''), '[^0-9]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'year_built', '[^0-9]', '', 'g'), '')::int ELSE NULL END,
      CASE WHEN NULLIF(regexp_replace(COALESCE(enriched->>'rental_yield',''), '[^0-9.-]', '', 'g'), '') IS NOT NULL THEN NULLIF(regexp_replace(enriched->>'rental_yield', '[^0-9.-]', '', 'g'), '')::numeric ELSE NULL END,
      enriched->>'provenance', enriched->>'condition', 'active', false, v_platform, 'pipeline'
    ) RETURNING id INTO new_id;
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'Unsupported target table: ' || v_target);
  END IF;

  UPDATE public.pipeline_pending_items
  SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid(), target_table = v_target, target_platform = v_stored_platform
  WHERE id = _item_id;

  RETURN jsonb_build_object('ok', true, 'id', new_id, 'target_table', v_target, 'platform', v_stored_platform, 'image_url', v_image);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$function$;