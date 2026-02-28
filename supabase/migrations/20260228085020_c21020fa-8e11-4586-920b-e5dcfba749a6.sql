
-- Role enum + user_roles table (proper security pattern)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- App events table for analytics
CREATE TABLE public.app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  module text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert events
CREATE POLICY "Authenticated users can insert events"
  ON public.app_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can read events
CREATE POLICY "Admins can read events"
  ON public.app_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for efficient aggregation queries
CREATE INDEX idx_app_events_created_at ON public.app_events (created_at DESC);
CREATE INDEX idx_app_events_module ON public.app_events (module);
CREATE INDEX idx_app_events_event_type ON public.app_events (event_type);
