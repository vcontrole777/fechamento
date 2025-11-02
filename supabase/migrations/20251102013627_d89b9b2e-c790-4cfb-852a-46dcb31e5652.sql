-- Fix public data exposure in equipes table
-- Drop the insecure public policies
DROP POLICY IF EXISTS "Allow public users to select from equipes" ON public.equipes;
DROP POLICY IF EXISTS "Allow public users to create equipes" ON public.equipes;

-- Create secure policy: users can only view their own team or admins can view all
CREATE POLICY "Teams can view own team" 
ON public.equipes 
FOR SELECT 
USING (is_admin() OR id = get_user_equipe_id());

-- Create secure policy: only authenticated users can create teams
CREATE POLICY "Authenticated users can create teams" 
ON public.equipes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);