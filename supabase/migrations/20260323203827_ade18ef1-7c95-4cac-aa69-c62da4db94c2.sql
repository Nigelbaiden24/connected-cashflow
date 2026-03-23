
-- =====================================================
-- SECURITY HARDENING BATCH 2 - Authenticated but unscoped tables
-- =====================================================

-- Helper: check if user owns an employee record
CREATE OR REPLACE FUNCTION public.owns_employee(_user_id uuid, _employee_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.employees WHERE id = _employee_id AND user_id = _user_id) $$;

-- Helper: check if user is the team member
CREATE OR REPLACE FUNCTION public.owns_team_member(_user_id uuid, _member_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.team_members WHERE id = _member_id AND user_id = _user_id) $$;

-- 1. benefits - HR admin or employee owner
DROP POLICY IF EXISTS "Authenticated users can manage benefits" ON public.benefits;
DROP POLICY IF EXISTS "Authenticated users can view benefits" ON public.benefits;
CREATE POLICY "Employee owner or admin can view benefits" ON public.benefits FOR SELECT TO authenticated
USING (public.owns_employee(auth.uid(), employee_id) OR public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admin can manage benefits" ON public.benefits FOR ALL TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));

-- 2. compliance_rules - Creator or admin
DROP POLICY IF EXISTS "Authenticated users can manage compliance rules" ON public.compliance_rules;
DROP POLICY IF EXISTS "Authenticated users can view compliance rules" ON public.compliance_rules;
CREATE POLICY "Auth users can view compliance rules" ON public.compliance_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creator or admin can manage compliance rules" ON public.compliance_rules FOR ALL TO authenticated
USING (created_by = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (created_by = auth.uid() OR public.is_admin(auth.uid()));

-- 3. financial_plan_sections - Plan owner or admin
DROP POLICY IF EXISTS "Authenticated users can manage plan sections" ON public.financial_plan_sections;
DROP POLICY IF EXISTS "Authenticated users can view plan sections" ON public.financial_plan_sections;
CREATE POLICY "Plan owner or admin can view plan sections" ON public.financial_plan_sections FOR SELECT TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Plan owner or admin can manage plan sections" ON public.financial_plan_sections FOR ALL TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));

-- 4. income_sources - Plan owner or admin
DROP POLICY IF EXISTS "Authenticated users can manage income sources" ON public.income_sources;
DROP POLICY IF EXISTS "Authenticated users can view income sources" ON public.income_sources;
CREATE POLICY "Plan owner or admin can view income sources" ON public.income_sources FOR SELECT TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Plan owner or admin can manage income sources" ON public.income_sources FOR ALL TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));

-- 5. plan_milestones - Plan owner or admin
DROP POLICY IF EXISTS "Authenticated users can manage plan milestones" ON public.plan_milestones;
DROP POLICY IF EXISTS "Authenticated users can view plan milestones" ON public.plan_milestones;
CREATE POLICY "Plan owner or admin can view plan milestones" ON public.plan_milestones FOR SELECT TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Plan owner or admin can manage plan milestones" ON public.plan_milestones FOR ALL TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));

-- 6. plan_recommendations - Plan owner or admin
DROP POLICY IF EXISTS "Anyone can manage recommendations" ON public.plan_recommendations;
DROP POLICY IF EXISTS "Authenticated users can view plan recommendations" ON public.plan_recommendations;
CREATE POLICY "Plan owner or admin can view plan recommendations" ON public.plan_recommendations FOR SELECT TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));
CREATE POLICY "Plan owner or admin can manage plan recommendations" ON public.plan_recommendations FOR ALL TO authenticated
USING (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()))
WITH CHECK (public.owns_plan(auth.uid(), plan_id) OR public.is_admin(auth.uid()));

-- 7. roles - CRITICAL: Admin only (privilege escalation risk)
DROP POLICY IF EXISTS "Authenticated users can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
CREATE POLICY "Auth users can view roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage roles" ON public.roles FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 8. team_members - Own record or admin/HR
DROP POLICY IF EXISTS "Anyone authenticated can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone authenticated can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone authenticated can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Anyone authenticated can view team members" ON public.team_members;
CREATE POLICY "Auth users can view team members" ON public.team_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));
CREATE POLICY "Admin or HR can manage team members" ON public.team_members FOR ALL TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));

-- 9. time_off_requests - Employee own or HR admin
DROP POLICY IF EXISTS "Authenticated users can manage time off requests" ON public.time_off_requests;
DROP POLICY IF EXISTS "Authenticated users can view time off requests" ON public.time_off_requests;
CREATE POLICY "Employee or admin can view time off requests" ON public.time_off_requests FOR SELECT TO authenticated
USING (public.owns_employee(auth.uid(), employee_id) OR public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));
CREATE POLICY "Employee can insert own time off requests" ON public.time_off_requests FOR INSERT TO authenticated
WITH CHECK (public.owns_employee(auth.uid(), employee_id) OR public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));
CREATE POLICY "HR admin can manage time off requests" ON public.time_off_requests FOR ALL TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));

-- 10. vacancies - Owner or admin
DROP POLICY IF EXISTS "Anyone can view vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Anyone can insert vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Authenticated users can manage vacancies" ON public.vacancies;
CREATE POLICY "Auth users can view vacancies" ON public.vacancies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner or admin can manage vacancies" ON public.vacancies FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can update vacancies" ON public.vacancies FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin can delete vacancies" ON public.vacancies FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 11. workload_items - Team member owner or admin
DROP POLICY IF EXISTS "Authenticated users can manage workload items" ON public.workload_items;
DROP POLICY IF EXISTS "Authenticated users can view workload items" ON public.workload_items;
CREATE POLICY "Member or admin can view workload items" ON public.workload_items FOR SELECT TO authenticated
USING (public.owns_team_member(auth.uid(), member_id) OR public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));
CREATE POLICY "Admin can manage workload items" ON public.workload_items FOR ALL TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()) OR public.is_hr_admin(auth.uid()));
