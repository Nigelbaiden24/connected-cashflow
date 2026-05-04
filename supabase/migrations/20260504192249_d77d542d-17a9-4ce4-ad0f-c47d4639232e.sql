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
  v_rating text;
  v_score numeric;
  v_text text;
  v_price numeric;
  v_price_raw text;
  v_currency text;
  v_image text;
  v_gallery text[];
  v_strengths_arr text[];
  v_risks_arr text[];
  v_highlights text[];

  -- helpers
  function_dummy int;
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
  v_score := LEAST(5, GREATEST(0, COALESCE(itm.ai_score, 3.0)));

  IF _target_table IS NOT NULL AND _target_table <> '' THEN
    v_target := _target_table;
  ELSIF itm.source = 'opportunity-research' THEN
    v_target := 'investor_finder_opportunities';
  ELSE
    v_target := itm.target_table;
  END IF;

  v_platform := NULLIF(_platform, '');
  IF v_platform = 'both' THEN v_platform := NULL; END IF;

  -- ===== Price parsing (handles £/$/€, k/m/bn suffix) =====
  v_price_raw := COALESCE(
    NULLIF(enriched->>'price',''),
    NULLIF(enriched->>'asking_price',''),
    NULLIF(enriched->>'valuation',''),
    NULLIF(enriched->>'value',''),
    NULLIF(enriched->>'amount',''),
    NULLIF(enriched->>'ticket_size_min',''),
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

  v_currency := COALESCE(NULLIF(enriched->>'currency',''), NULLIF(enriched->>'price_currency',''),
    CASE
      WHEN v_price_raw LIKE '%£%' THEN 'GBP'
      WHEN v_price_raw LIKE '%$%' THEN 'USD'
      WHEN v_price_raw LIKE '%€%' THEN 'EUR'
      ELSE 'GBP'
    END);

  -- ===== Image with category fallback =====
  v_image := COALESCE(
    NULLIF(enriched->>'image_url',''),
    NULLIF(enriched->>'thumbnail_url',''),
    NULLIF(enriched->>'image',''),
    NULLIF(enriched->>'logo_url','')
  );

  v_text := lower(COALESCE(NULLIF(enriched->>'category',''), NULLIF(itm.category,''), NULLIF(enriched->>'sector',''), NULLIF(enriched->>'industry',''), ''));
  IF v_image IS NULL THEN
    v_image := CASE
      WHEN v_text LIKE '%property%' OR v_text LIKE '%real estate%' THEN 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'
      WHEN v_text LIKE '%vehicle%' OR v_text LIKE '%car%' OR v_text LIKE '%auto%' THEN 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80'
      WHEN v_text LIKE '%crypto%' OR v_text LIKE '%blockchain%' THEN 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&q=80'
      WHEN v_text LIKE '%stock%' OR v_text LIKE '%equity%' OR v_text LIKE '%market%' THEN 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80'
      WHEN v_text LIKE '%watch%' OR v_text LIKE '%timepiece%' OR v_text LIKE '%luxury%' OR v_text LIKE '%collectible%' THEN 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80'
      WHEN v_text LIKE '%commodity%' OR v_text LIKE '%gold%' OR v_text LIKE '%oil%' OR v_text LIKE '%energy%' THEN 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&q=80'
      WHEN v_text LIKE '%fund%' OR v_text LIKE '%etf%' THEN 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80'
      WHEN v_text LIKE '%venture%' OR v_text LIKE '%startup%' OR v_text LIKE '%private equity%' THEN 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80'
      WHEN v_text LIKE '%intel%' OR v_text LIKE '%research%' THEN 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80'
      ELSE 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80'
    END;
  END IF;

  -- ===== Arrays =====
  v_gallery := CASE WHEN jsonb_typeof(enriched->'gallery_images') = 'array'
                    THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'gallery_images'))
                    WHEN jsonb_typeof(enriched->'images') = 'array'
                    THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'images'))
                    ELSE ARRAY[v_image] END;

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
      v_score,
      v_score,
      itm.ai_tags,
      v_highlights,
      CASE WHEN jsonb_typeof(enriched->'risks') = 'array'
           THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'risks')) END,
      COALESCE(enriched->>'thesis', enriched->>'investment_thesis', itm.summary),
      v_image,
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
      v_highlights,
      COALESCE(enriched->>'financial_summary',
        CASE WHEN v_price IS NOT NULL THEN 'Indicative valuation: ' || v_currency || ' ' || to_char(v_price, 'FM999,999,999,999') ELSE NULL END),
      enriched->>'team_overview',
      v_image,
      'published'
    ) RETURNING id INTO new_id;

  ELSIF v_target = 'opportunity_products' THEN
    v_text := lower(COALESCE(NULLIF(enriched->>'category',''), NULLIF(itm.category,''), NULLIF(enriched->>'sector',''), NULLIF(enriched->>'industry',''), 'businesses'));
    v_category := CASE
      WHEN v_text IN ('uk_property','vehicles','overseas_property','businesses','stocks','crypto','private_equity','memorabilia','commodities','funds','real_estate','private_business','collectibles_luxury') THEN v_text
      WHEN v_text LIKE '%property%' AND (v_text LIKE '%overseas%' OR v_text LIKE '%international%') THEN 'overseas_property'
      WHEN v_text LIKE '%property%' OR v_text LIKE '%real estate%' OR v_text LIKE '%real-estate%' THEN 'uk_property'
      WHEN v_text LIKE '%vehicle%' OR v_text LIKE '%car%' OR v_text LIKE '%auto%' THEN 'vehicles'
      WHEN v_text LIKE '%stock%' OR v_text LIKE '%equity%' OR v_text LIKE '%public market%' THEN 'stocks'
      WHEN v_text LIKE '%crypto%' OR v_text LIKE '%blockchain%' OR v_text LIKE '%digital asset%' THEN 'crypto'
      WHEN v_text LIKE '%private equity%' OR v_text LIKE '%venture%' OR v_text LIKE '%startup%' OR v_text LIKE '%funding%' THEN 'private_equity'
      WHEN v_text LIKE '%watch%' OR v_text LIKE '%timepiece%' OR v_text LIKE '%memorabilia%' OR v_text LIKE '%collectible%' OR v_text LIKE '%luxury%' THEN 'memorabilia'
      WHEN v_text LIKE '%commodity%' OR v_text LIKE '%gold%' OR v_text LIKE '%oil%' OR v_text LIKE '%energy%' THEN 'commodities'
      WHEN v_text LIKE '%fund%' OR v_text LIKE '%etf%' THEN 'funds'
      ELSE 'businesses'
    END;

    v_sub := COALESCE(NULLIF(enriched->>'sub_category',''), NULLIF(enriched->>'subcategory',''), NULLIF(enriched->>'sector',''), 'General');
    v_short := COALESCE(NULLIF(itm.summary,''), NULLIF(enriched->>'description',''), itm.title);
    v_location := COALESCE(NULLIF(enriched->>'location',''), NULLIF(enriched->>'country',''), 'Global');
    v_text := lower(COALESCE(NULLIF(enriched->>'analyst_rating',''), NULLIF(enriched->>'rating',''), ''));
    v_rating := CASE
      WHEN v_text IN ('gold','strong buy','buy','high conviction','positive','outperform','5','5.0') THEN 'Gold'
      WHEN v_text IN ('silver','accumulate','moderate buy','4','4.0') THEN 'Silver'
      WHEN v_text IN ('bronze','hold positive','3','3.0') THEN 'Bronze'
      WHEN v_text IN ('negative','sell','avoid','underperform','1','1.0') THEN 'Negative'
      ELSE 'Neutral'
    END;

    INSERT INTO public.opportunity_products (
      title, short_description, full_description, category, sub_category,
      price, price_currency,
      location, country, thumbnail_url, gallery_images,
      analyst_rating, overall_conviction_score,
      quality_score, value_score, liquidity_score, risk_score,
      investment_thesis, strengths, risks, suitable_investor_type, key_watchpoints,
      product_details,
      industry, business_stage,
      annual_revenue, employee_count, founding_year,
      property_type, bedrooms, bathrooms, square_footage, year_built, rental_yield,
      provenance, condition,
      status, featured, platform
    ) VALUES (
      itm.title,
      left(v_short, 500),
      COALESCE(enriched->>'full_description', enriched->>'description', v_short),
      v_category,
      v_sub,
      v_price,
      v_currency,
      v_location,
      COALESCE(NULLIF(enriched->>'country',''), v_location),
      v_image,
      v_gallery,
      v_rating,
      v_score, v_score, v_score, v_score,
      LEAST(5, GREATEST(0, 5 - v_score)),
      COALESCE(enriched->>'thesis', enriched->>'investment_thesis', itm.summary),
      COALESCE(enriched->>'strengths', array_to_string(v_highlights, E'\n• ')),
      COALESCE(enriched->>'risks', enriched->>'risk_factors'),
      COALESCE(enriched->>'suitable_investor_type', enriched->>'investor_type', 'Sophisticated investors'),
      COALESCE(enriched->>'key_watchpoints', enriched->>'watchpoints'),
      enriched,
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
      enriched->>'provenance',
      enriched->>'condition',
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
      v_score,
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
EXCEPTION WHEN check_violation THEN
  RETURN jsonb_build_object('ok', false, 'error', 'Promote blocked by table restrictions: ' || SQLERRM);
WHEN invalid_text_representation OR numeric_value_out_of_range THEN
  RETURN jsonb_build_object('ok', false, 'error', 'Promote blocked by invalid scraped numeric data: ' || SQLERRM);
END;
$function$;