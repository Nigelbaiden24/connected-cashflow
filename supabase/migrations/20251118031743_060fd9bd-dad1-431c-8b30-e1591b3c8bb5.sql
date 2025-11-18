-- Add new role types to user_role enum
-- These must be in a separate transaction before being used
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'hr_admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'payroll_admin';