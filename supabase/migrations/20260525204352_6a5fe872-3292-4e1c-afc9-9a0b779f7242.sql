
-- Expand opportunity_products.category to support the new investor-curated taxonomy
ALTER TABLE public.opportunity_products
  DROP CONSTRAINT IF EXISTS opportunity_products_category_check;

ALTER TABLE public.opportunity_products
  ADD CONSTRAINT opportunity_products_category_check
  CHECK (category = ANY (ARRAY[
    -- legacy values retained for backward compatibility
    'uk_property','vehicles','overseas_property','businesses','stocks','crypto',
    'private_equity','memorabilia','commodities','funds','real_estate',
    'private_business','collectibles_luxury','mini_bonds','timepieces',
    'private_credit','infrastructure_energy','bonds','music_royalties',
    -- new investor taxonomy
    'alternatives','esg','fractional_pe_vc','private_market_platforms',
    'capital_protected_notes','thematics_packaged','copy_trading',
    'royalties','fine_wine','art','collectibles','luxury_assets',
    'entertainment_finance','insurance_investments','sports_investments'
  ]));

-- Update promotion mapper to use the new taxonomy
CREATE OR REPLACE FUNCTION public.approve_pending_item(_item_id uuid, _target_table text DEFAULT NULL::text, _platform text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  itm RECORD;
  new_id uuid;
  enriched jsonb;
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
  v_location text;
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
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Item not found'); END IF;
  IF itm.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Item is not pending (status=' || itm.status || ')');
  END IF;

  enriched := COALESCE(itm.enriched_payload, itm.raw_payload, '{}'::jsonb);
  v_score := LEAST(5, GREATEST(0, COALESCE(itm.ai_score, 3.0)));

  -- Data Pipeline is investor-only Opportunity Intelligence.
  v_target := 'opportunity_products';
  v_stored_platform := COALESCE(NULLIF(_platform, ''), NULLIF(itm.target_platform, ''), 'investor');
  v_platform := CASE WHEN v_stored_platform = 'both' THEN NULL ELSE v_stored_platform END;

  -- Price extraction
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

  -- Strict thumbnail: NO generic stock photo fallbacks
  v_image := COALESCE(
    NULLIF(enriched->>'generated_thumbnail_url',''), NULLIF(enriched->>'ai_thumbnail_url',''),
    NULLIF(enriched->>'thumbnail_url',''), NULLIF(enriched->>'image_url',''),
    NULLIF(enriched->>'image',''), NULLIF(enriched->>'logo_url',''),
    NULLIF(enriched->>'cover_image',''), NULLIF(enriched->>'hero_image',''),
    NULLIF(enriched->>'og_image',''), NULLIF(enriched->>'imageUrl',''),
    NULLIF(enriched#>>'{metadata,image_url}',''), NULLIF(enriched#>>'{metadata,thumbnail_url}','')
  );
  IF v_image IS NULL AND jsonb_typeof(enriched->'images') = 'array' THEN
    SELECT v INTO v_image FROM jsonb_array_elements_text(enriched->'images') AS t(v)
    WHERE v ~* '^https?://' AND v !~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder' LIMIT 1;
  END IF;
  IF v_image ~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder' THEN
    v_image := NULL;
  END IF;

  IF jsonb_typeof(enriched->'gallery_images') = 'array' THEN
    SELECT ARRAY(SELECT v FROM jsonb_array_elements_text(enriched->'gallery_images') AS t(v)
      WHERE v ~* '^https?://' AND v !~* 'images\.unsplash\.com|source\.unsplash\.com|picsum\.photos|placehold\.co|placeholder'
    ) INTO v_gallery;
  ELSIF v_image IS NOT NULL THEN
    v_gallery := ARRAY[v_image];
  ELSE
    v_gallery := ARRAY[]::text[];
  END IF;

  v_highlights := CASE WHEN jsonb_typeof(enriched->'highlights') = 'array'
                       THEN ARRAY(SELECT jsonb_array_elements_text(enriched->'highlights'))
                       ELSE itm.ai_tags END;

  -- NEW investor taxonomy mapper
  v_text := lower(COALESCE(NULLIF(enriched->>'category',''), NULLIF(itm.category,''), NULLIF(enriched->>'sector',''), ''));
  v_category := CASE
    WHEN v_text ~ '(rent.to.rent|rent.to.serviced|residential|commercial|industrial|student.housing|holiday.rental|build.to.rent|land.banking|farmland|^land$|international.property|real.estate|property)' THEN 'real_estate'
    WHEN v_text ~ '(oil|natural.gas|wheat|coffee|livestock|commodit|gold|silver|metals|agricultur)' THEN 'commodities'
    WHEN v_text ~ '(esg|impact|sustainab|green|renewable)' THEN 'esg'
    WHEN v_text ~ '(fractional|crowdfund|syndicate|crowdcube|seedrs|republic|wefunder|angellist|moonfare)' THEN 'fractional_pe_vc'
    WHEN v_text ~ '(pre.?ipo|secondary|forge|equityzen|hiive|private.market)' THEN 'private_market_platforms'
    WHEN v_text ~ '(capital.protect|structured.note|income.note|autocall)' THEN 'capital_protected_notes'
    WHEN v_text ~ '(thematic|packaged|smart.beta|robo|model.portfolio|basket)' THEN 'thematics_packaged'
    WHEN v_text ~ '(copy.trading|mirror.trading|social.trading|etoro|zulutrade)' THEN 'copy_trading'
    WHEN v_text ~ '(music.royalt|film.royalt|publishing.royalt|patent.royalt|royalt|hipgnosis)' THEN 'royalties'
    WHEN v_text ~ '(mini.bond|loan.note)' THEN 'mini_bonds'
    WHEN v_text ~ '(rolex|patek|watch|timepiece)' THEN 'timepieces'
    WHEN v_text ~ '(fine.wine|wine|whisky|whiskey|bordeaux|burgundy)' AND v_text !~ 'collectible' THEN 'fine_wine'
    WHEN v_text ~ '(^art$|fine.art|painting|sculpture|artwork)' THEN 'art'
    WHEN v_text ~ '(sneaker|comic|trading.card|memorabilia|collectible)' THEN 'collectibles'
    WHEN v_text ~ '(yacht|jet|supercar|handbag|jewel|luxury.asset)' THEN 'luxury_assets'
    WHEN v_text ~ '(film.financ|tv.production|sports.right|esport|entertainment.financ)' THEN 'entertainment_finance'
    WHEN v_text ~ '(annuit|whole.life|universal.life|premium.financ|life.settlement|insurance)' THEN 'insurance_investments'
    WHEN v_text ~ '(football.club|athlete|racehorse|sports.invest|sports.trading)' THEN 'sports_investments'
    WHEN v_text ~ '(hedge.fund|alternative)' THEN 'alternatives'
    WHEN v_text ~ '(business|sme|acquisition|startup|company)' THEN 'businesses'
    ELSE 'alternatives'
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
    product_details, status, featured, platform, source
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
    COALESCE(enriched->>'suitable_investor_type', 'Sophisticated individual investors / HNW'),
    COALESCE(enriched->>'key_watchpoints', enriched->>'watchpoints'),
    enriched || jsonb_build_object('pipeline_source', itm.source, 'source_url', itm.source_url, 'resolved_image_url', v_image),
    'active', false, v_platform, 'pipeline'
  ) RETURNING id INTO new_id;

  UPDATE public.pipeline_pending_items
  SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid(),
      target_table = v_target, target_platform = v_stored_platform
  WHERE id = _item_id;

  RETURN jsonb_build_object('ok', true, 'id', new_id, 'target_table', v_target, 'platform', v_stored_platform, 'image_url', v_image);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$function$;
