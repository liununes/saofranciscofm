
-- Allow admins to view all profiles for user management
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert into radio_config (in case it's empty)
CREATE POLICY "Authenticated can insert radio config" ON public.radio_config
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
