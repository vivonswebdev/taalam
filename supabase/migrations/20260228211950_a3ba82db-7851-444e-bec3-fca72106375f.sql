
-- Communities table
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  language text DEFAULT 'ar',
  region text DEFAULT '',
  category text DEFAULT 'general',
  requires_approval boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Authenticated can create communities" ON public.communities FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update community" ON public.communities FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete community" ON public.communities FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Community members
CREATE TABLE public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community members" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can remove members" ON public.community_members FOR DELETE TO authenticated USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_members.community_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
  )
);

-- Join requests for moderated groups
CREATE TABLE public.community_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own join requests" ON public.community_join_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON public.community_join_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view group requests" ON public.community_join_requests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_join_requests.community_id AND cm.user_id = auth.uid() AND cm.role = 'admin')
);
CREATE POLICY "Admins can update requests" ON public.community_join_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_join_requests.community_id AND cm.user_id = auth.uid() AND cm.role = 'admin')
);
CREATE POLICY "Admins can delete requests" ON public.community_join_requests FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_join_requests.community_id AND cm.user_id = auth.uid() AND cm.role = 'admin')
);

-- Community messages (chat)
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT '',
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  message_type text NOT NULL DEFAULT 'text',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view messages" ON public.community_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_messages.community_id AND cm.user_id = auth.uid())
);
CREATE POLICY "Members can send messages" ON public.community_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_messages.community_id AND cm.user_id = auth.uid())
);
CREATE POLICY "Author or admin can delete messages" ON public.community_messages FOR DELETE TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_messages.community_id AND cm.user_id = auth.uid() AND cm.role = 'admin')
);
CREATE POLICY "Admin can update messages" ON public.community_messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_messages.community_id AND cm.user_id = auth.uid() AND cm.role = 'admin')
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
