-- Add RLS policies for tables with RLS enabled but no policies

-- Body Measurements
DROP POLICY IF EXISTS "Admins can manage body_measurements" ON public.body_measurements;
CREATE POLICY "Admins can manage body_measurements" ON public.body_measurements
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Client Photos
DROP POLICY IF EXISTS "Admins can manage client_photos" ON public.client_photos;
CREATE POLICY "Admins can manage client_photos" ON public.client_photos
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Clients
DROP POLICY IF EXISTS "Admins can manage clients" ON public.clients;
CREATE POLICY "Admins can manage clients" ON public.clients
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Daily Logs
DROP POLICY IF EXISTS "Admins can manage daily_logs" ON public.daily_logs;
CREATE POLICY "Admins can manage daily_logs" ON public.daily_logs
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Foods
DROP POLICY IF EXISTS "Admins can manage foods" ON public.foods;
CREATE POLICY "Admins can manage foods" ON public.foods
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Meal Items
DROP POLICY IF EXISTS "Admins can manage meal_items" ON public.meal_items;
CREATE POLICY "Admins can manage meal_items" ON public.meal_items
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Meal Plans
DROP POLICY IF EXISTS "Admins can manage meal_plans" ON public.meal_plans;
CREATE POLICY "Admins can manage meal_plans" ON public.meal_plans
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Meals
DROP POLICY IF EXISTS "Admins can manage meals" ON public.meals;
CREATE POLICY "Admins can manage meals" ON public.meals
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- MP Requests
DROP POLICY IF EXISTS "Admins can manage mp_requests" ON public.mp_requests;
CREATE POLICY "Admins can manage mp_requests" ON public.mp_requests
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- MP Requests V2
DROP POLICY IF EXISTS "Admins can manage mp_requests_v2" ON public.mp_requests_v2;
CREATE POLICY "Admins can manage mp_requests_v2" ON public.mp_requests_v2
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Radio Clients
DROP POLICY IF EXISTS "Admins can manage radio_clients" ON public.radio_clients;
CREATE POLICY "Admins can manage radio_clients" ON public.radio_clients
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Radio Plans
DROP POLICY IF EXISTS "Admins can manage radio_plans" ON public.radio_plans;
CREATE POLICY "Admins can manage radio_plans" ON public.radio_plans
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Water Goals
DROP POLICY IF EXISTS "Admins can manage water_goals" ON public.water_goals;
CREATE POLICY "Admins can manage water_goals" ON public.water_goals
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Workout Exercises
DROP POLICY IF EXISTS "Admins can manage workout_exercises" ON public.workout_exercises;
CREATE POLICY "Admins can manage workout_exercises" ON public.workout_exercises
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));

-- Workouts
DROP POLICY IF EXISTS "Admins can manage workouts" ON public.workouts;
CREATE POLICY "Admins can manage workouts" ON public.workouts
FOR ALL USING ((select public.has_role(auth.uid(), 'admin')));
