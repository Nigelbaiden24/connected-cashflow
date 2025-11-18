-- Add new role types to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'hr_admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'payroll_admin';