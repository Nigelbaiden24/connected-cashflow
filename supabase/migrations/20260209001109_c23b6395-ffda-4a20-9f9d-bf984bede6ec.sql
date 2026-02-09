-- Drop the old category check constraint
ALTER TABLE public.opportunity_products DROP CONSTRAINT opportunity_products_category_check;

-- Add new category check constraint with all the new categories
ALTER TABLE public.opportunity_products ADD CONSTRAINT opportunity_products_category_check 
CHECK (category = ANY (ARRAY[
  'uk_property'::text, 
  'vehicles'::text, 
  'overseas_property'::text, 
  'businesses'::text, 
  'stocks'::text, 
  'crypto'::text, 
  'private_equity'::text, 
  'memorabilia'::text, 
  'commodities'::text, 
  'funds'::text,
  -- Keep legacy values for backward compatibility
  'real_estate'::text, 
  'private_business'::text, 
  'collectibles_luxury'::text
]));