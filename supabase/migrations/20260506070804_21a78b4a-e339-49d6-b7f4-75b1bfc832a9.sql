
-- Elite price estimator triggers — auto-fill price when scrapers/admin uploads omit it.

CREATE OR REPLACE FUNCTION public.estimate_price_if_missing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cat text := lower(coalesce(NEW.category, NEW.sub_category, ''));
  sub text := lower(coalesce(NEW.sub_category, ''));
  loc text := lower(coalesce(NEW.location, NEW.country, ''));
  rev numeric;
  est numeric;
  loc_mult numeric := 1;
BEGIN
  IF NEW.price IS NOT NULL AND NEW.price > 0 THEN
    RETURN NEW;
  END IF;

  -- Location multiplier (premium cities)
  loc_mult := CASE
    WHEN loc ~ '(london|new york|manhattan|hong kong|singapore|monaco|zurich|geneva|san francisco|tokyo)' THEN 2.5
    WHEN loc ~ '(uk|united kingdom|england|paris|berlin|dubai|sydney|los angeles|toronto)' THEN 1.6
    WHEN loc ~ '(europe|usa|united states|canada|australia|japan|germany|france|netherlands)' THEN 1.2
    ELSE 1.0
  END;

  -- Revenue multiple (businesses)
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
  END IF;

  -- Property
  IF est IS NULL AND cat ~ '(property|real_estate|real estate)' THEN
    IF NEW.square_footage IS NOT NULL AND NEW.square_footage > 0 THEN
      est := NEW.square_footage * 450 * loc_mult;
    ELSIF NEW.bedrooms IS NOT NULL AND NEW.bedrooms > 0 THEN
      est := NEW.bedrooms * 250000 * loc_mult;
    ELSE
      est := 600000 * loc_mult;
    END IF;
  END IF;

  -- Vehicles
  IF est IS NULL AND cat ~ '(vehicle|car|auto)' THEN
    est := CASE
      WHEN cat ~ '(classic|vintage|supercar|ferrari|porsche|lamborghini)' THEN 250000
      WHEN cat ~ '(luxury|premium)' THEN 120000
      ELSE 65000
    END;
  END IF;

  -- Watches / memorabilia / collectibles
  IF est IS NULL AND cat ~ '(watch|timepiece|memorabilia|collectible|luxury)' THEN
    est := CASE
      WHEN cat ~ '(rolex|patek|audemars|grand)' THEN 95000
      ELSE 28000
    END;
  END IF;

  -- Crypto / stocks / funds (minimum institutional ticket)
  IF est IS NULL AND cat ~ '(crypto|stock|equit|fund|etf)' THEN
    est := 10000;
  END IF;

  -- PE / VC / startup
  IF est IS NULL AND cat ~ '(private_equity|venture|startup|pe|vc|crowd)' THEN
    est := 500000;
  END IF;

  -- Commodities / energy / infra
  IF est IS NULL AND cat ~ '(commodit|gold|oil|energy|infra)' THEN
    est := 250000;
  END IF;

  -- Generic business / fallback
  IF est IS NULL THEN
    est := CASE
      WHEN cat ~ '(business|sme|acquisition)' THEN 850000 * loc_mult
      ELSE 250000 * loc_mult
    END;
  END IF;

  NEW.price := round(est, 0);
  IF NEW.price_currency IS NULL OR NEW.price_currency = '' THEN
    NEW.price_currency := CASE
      WHEN loc ~ '(usa|united states|new york|san francisco|los angeles|miami|texas)' THEN 'USD'
      WHEN loc ~ '(europe|paris|berlin|amsterdam|madrid|rome|frankfurt)' THEN 'EUR'
      ELSE 'GBP'
    END;
  END IF;

  -- Mark as estimated
  NEW.product_details := COALESCE(NEW.product_details, '{}'::jsonb)
    || jsonb_build_object('price_is_estimated', true, 'price_estimate_basis',
        CASE WHEN rev IS NOT NULL THEN 'revenue_multiple'
             WHEN cat ~ 'property' THEN 'property_comp'
             ELSE 'category_benchmark' END);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_estimate_price_op_products ON public.opportunity_products;
CREATE TRIGGER trg_estimate_price_op_products
  BEFORE INSERT ON public.opportunity_products
  FOR EACH ROW EXECUTE FUNCTION public.estimate_price_if_missing();


CREATE OR REPLACE FUNCTION public.estimate_ticket_if_missing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sec text := lower(coalesce(NEW.sector, NEW.sub_sector, ''));
  stage text := lower(coalesce(NEW.stage, ''));
  geo text := lower(coalesce(NEW.geography, NEW.country, ''));
  est numeric;
BEGIN
  IF NEW.ticket_size_min IS NOT NULL AND NEW.ticket_size_min > 0 THEN
    RETURN NEW;
  END IF;

  -- Stage-based institutional ticket
  est := CASE
    WHEN stage ~ '(pre.?seed|idea)' THEN 50000
    WHEN stage ~ '(seed)' THEN 250000
    WHEN stage ~ '(series a|early)' THEN 1000000
    WHEN stage ~ '(series b|growth)' THEN 5000000
    WHEN stage ~ '(series c|late|expansion)' THEN 15000000
    WHEN stage ~ '(buyout|pe|private equity)' THEN 25000000
    ELSE NULL
  END;

  -- Sector adjustment if no stage info
  IF est IS NULL THEN
    est := CASE
      WHEN sec ~ '(deep.?tech|biotech|pharma|hardware|semiconductor)' THEN 2000000
      WHEN sec ~ '(saas|software|fintech|ai)' THEN 750000
      WHEN sec ~ '(real estate|property|infra)' THEN 5000000
      WHEN sec ~ '(consumer|retail|ecommerce)' THEN 500000
      ELSE 500000
    END;
  END IF;

  -- Geo adjustment
  IF geo ~ '(usa|united states|silicon valley|london|singapore|hong kong)' THEN
    est := est * 1.5;
  END IF;

  NEW.ticket_size_min := round(est, 0);
  IF NEW.ticket_size_max IS NULL THEN
    NEW.ticket_size_max := round(est * 4, 0);
  END IF;
  IF NEW.currency IS NULL OR NEW.currency = '' THEN
    NEW.currency := CASE
      WHEN geo ~ '(usa|united states|new york|san francisco)' THEN 'USD'
      WHEN geo ~ '(europe|paris|berlin|amsterdam)' THEN 'EUR'
      ELSE 'GBP'
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_estimate_ticket_inv_finder ON public.investor_finder_opportunities;
CREATE TRIGGER trg_estimate_ticket_inv_finder
  BEFORE INSERT ON public.investor_finder_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.estimate_ticket_if_missing();
