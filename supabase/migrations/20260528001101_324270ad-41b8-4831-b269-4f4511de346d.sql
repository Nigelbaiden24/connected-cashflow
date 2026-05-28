
-- Fix opportunity pricing: stop fabricating absurd prices; only estimate when there is a real signal
-- and pick a currency that matches the location.

CREATE OR REPLACE FUNCTION public.estimate_price_if_missing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cat text := lower(coalesce(NEW.category, NEW.sub_category, ''));
  sub text := lower(coalesce(NEW.sub_category, ''));
  ttl text := lower(coalesce(NEW.title, ''));
  loc text := lower(coalesce(NEW.location, NEW.country, ''));
  rev numeric;
  est numeric;
  basis text;
  ccy text;
  loc_mult numeric := 1;
BEGIN
  -- If a real price already exists, leave it alone.
  IF NEW.price IS NOT NULL AND NEW.price > 0 THEN
    RETURN NEW;
  END IF;

  -- Currency picker driven by location (so USA assets aren't stored in GBP).
  ccy := CASE
    WHEN loc ~ '(usa|united states|new york|san francisco|los angeles|miami|texas|chicago|boston|phoenix|arizona|florida|california|canada|toronto|vancouver)' THEN 'USD'
    WHEN loc ~ '(europe|euro|paris|france|berlin|germany|amsterdam|netherlands|madrid|spain|rome|italy|frankfurt|greece|malta|portugal|ireland)' THEN 'EUR'
    WHEN loc ~ '(uk|united kingdom|england|london|scotland|wales|bath|midlands|manchester|birmingham)' THEN 'GBP'
    WHEN loc ~ '(swiss|switzerland|zurich|geneva)' THEN 'CHF'
    WHEN loc ~ '(japan|tokyo)' THEN 'JPY'
    WHEN loc ~ '(australia|sydney|melbourne)' THEN 'AUD'
    WHEN loc ~ '(hong kong|hk|singapore)' THEN 'USD'
    ELSE 'GBP'
  END;

  loc_mult := CASE
    WHEN loc ~ '(london|new york|manhattan|hong kong|singapore|monaco|zurich|geneva|san francisco|tokyo)' THEN 1.8
    WHEN loc ~ '(paris|berlin|dubai|sydney|los angeles|toronto|miami|boston|chicago|amsterdam)' THEN 1.3
    ELSE 1.0
  END;

  -- 1) Revenue-multiple businesses (real signal)
  rev := NEW.annual_revenue;
  IF rev IS NOT NULL AND rev > 0 THEN
    est := rev * CASE
      WHEN cat ~ '(saas|software|tech|ai)' THEN 6
      WHEN cat ~ 'fintech' THEN 5
      WHEN cat ~ '(biotech|pharma|health)' THEN 7
      WHEN cat ~ '(service|consult|agency)' THEN 1.5
      WHEN cat ~ '(retail|ecommerce|consumer)' THEN 2.0
      ELSE 2.5
    END;
    basis := 'revenue_multiple';
  END IF;

  -- 2) Property with real measurable signal
  IF est IS NULL AND cat ~ '(property|real_estate|real estate)' THEN
    IF NEW.square_footage IS NOT NULL AND NEW.square_footage > 0 THEN
      est := NEW.square_footage * 450 * loc_mult;
      basis := 'property_sqft';
    ELSIF NEW.bedrooms IS NOT NULL AND NEW.bedrooms > 0 THEN
      est := NEW.bedrooms * 220000 * loc_mult;
      basis := 'property_bedrooms';
    END IF;
  END IF;

  -- 3) Bullion / coin / precious-metal physical items — narrow realistic bands
  IF est IS NULL AND (cat ~ '(commodit|gold|silver|platinum|palladium|metals|bullion)'
                      OR ttl ~ '(oz|ounce|coin|bar|bullion|maple leaf|eagle|britannia|krugerrand|buffalo)') THEN
    est := CASE
      WHEN ttl ~ '(1/20|0\.05 oz)'                          THEN 200
      WHEN ttl ~ '(1/10|0\.1 oz)'                           THEN 400
      WHEN ttl ~ '(1/4|0\.25 oz)'                           THEN 900
      WHEN ttl ~ '(1/2|0\.5 oz)'                            THEN 1700
      WHEN ttl ~ '(silver|copper)' AND ttl ~ '(1 oz|1oz|oz)' THEN 50
      WHEN ttl ~ '(platinum|palladium)' AND ttl ~ 'oz'       THEN 1200
      WHEN ttl ~ '(100 ?g|100 gram)'                         THEN 8500
      WHEN ttl ~ '(10 ?oz|10oz)' AND ttl ~ 'silver'          THEN 350
      WHEN ttl ~ '(1 oz|1oz|ounce)'                          THEN 2500   -- gold default
      WHEN ttl ~ '(rare|certified|pcgs|ngc|numismatic)'      THEN 1500
      WHEN ttl ~ '(fund|etf|tracker)'                        THEN NULL    -- leave NULL; tradeable per unit
      ELSE NULL
    END;
    IF est IS NOT NULL THEN basis := 'bullion_band'; END IF;
  END IF;

  -- 4) Vehicles
  IF est IS NULL AND cat ~ '(vehicle|car|auto)' THEN
    est := CASE
      WHEN ttl ~ '(ferrari|lamborghini|mclaren|bugatti|pagani|koenigsegg)' THEN 350000
      WHEN ttl ~ '(porsche|aston martin|bentley|rolls)'                    THEN 180000
      WHEN ttl ~ '(classic|vintage)'                                       THEN 95000
      ELSE NULL
    END;
    IF est IS NOT NULL THEN basis := 'vehicle_band'; END IF;
  END IF;

  -- 5) Watches
  IF est IS NULL AND (cat ~ '(watch|timepiece)' OR ttl ~ '(rolex|patek|audemars|vacheron|richard mille)') THEN
    est := CASE
      WHEN ttl ~ '(patek|richard mille|grand complication)' THEN 120000
      WHEN ttl ~ '(rolex|audemars|vacheron)'                THEN 35000
      ELSE 12000
    END;
    basis := 'watch_band';
  END IF;

  -- 6) Crypto / equity / ETF / fund — minimum institutional ticket only if no real price
  IF est IS NULL AND cat ~ '(crypto|stock|equit|^fund$|etf)' THEN
    est := 10000;
    basis := 'min_ticket';
  END IF;

  -- 7) PE / VC / startup / private market
  IF est IS NULL AND cat ~ '(private_equity|venture|startup|^pe$|vc|crowd|fractional_pe_vc|private_market)' THEN
    est := 25000 * loc_mult;
    basis := 'pe_vc_min_ticket';
  END IF;

  -- IMPORTANT: do NOT fabricate huge generic fallbacks. If we still have no estimate, leave price NULL.
  IF est IS NULL THEN
    NEW.price := NULL;
    NEW.price_currency := COALESCE(NULLIF(NEW.price_currency,''), ccy);
    NEW.product_details := COALESCE(NEW.product_details, '{}'::jsonb)
      || jsonb_build_object('price_is_estimated', false, 'price_unavailable', true);
    RETURN NEW;
  END IF;

  NEW.price := round(est, 0);
  NEW.price_currency := COALESCE(NULLIF(NEW.price_currency,''), ccy);
  NEW.product_details := COALESCE(NEW.product_details, '{}'::jsonb)
    || jsonb_build_object('price_is_estimated', true, 'price_estimate_basis', basis);

  RETURN NEW;
END;
$function$;
