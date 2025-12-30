-- ============================================
-- InstaCommand Multi-Tenant Workspace Schema
-- ============================================

-- 1. Create users table (application users linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create workspace_users table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.workspace_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Owner', 'Member')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

-- 4. Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (name IN ('Free', 'Pro', 'Agency', 'Enterprise')),
    max_accounts INT NOT NULL,
    price_per_month NUMERIC(10,2) NOT NULL DEFAULT 0,
    features_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    subscription_plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'canceled')) DEFAULT 'trialing',
    trial_ends_at TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create or update instagram_accounts to use workspace_id
DO $$ 
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'instagram_accounts'
    ) THEN
        -- Table exists, update it
        -- Add workspace_id column if it doesn't exist (nullable first)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'instagram_accounts' 
            AND column_name = 'workspace_id'
        ) THEN
            ALTER TABLE public.instagram_accounts 
            ADD COLUMN workspace_id UUID;
        END IF;

        -- Add new columns
        ALTER TABLE public.instagram_accounts
            ADD COLUMN IF NOT EXISTS external_id TEXT,
            ADD COLUMN IF NOT EXISTS account_type TEXT CHECK (account_type IN ('Business', 'Creator', 'Personal')),
            ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
            ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ DEFAULT now();

        -- Rename columns to match new schema
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'instagram_accounts' 
            AND column_name = 'avatar_url'
            AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'instagram_accounts' 
                AND column_name = 'profile_picture_url'
            )
        ) THEN
            ALTER TABLE public.instagram_accounts 
            RENAME COLUMN avatar_url TO profile_picture_url;
        END IF;

        -- Copy avatar_url to profile_picture_url if profile_picture_url is null
        UPDATE public.instagram_accounts
        SET profile_picture_url = avatar_url
        WHERE profile_picture_url IS NULL 
        AND avatar_url IS NOT NULL;

        -- Now add foreign key constraint if workspaces table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'workspaces'
        ) THEN
            -- Drop existing constraint if any
            ALTER TABLE public.instagram_accounts 
            DROP CONSTRAINT IF EXISTS instagram_accounts_workspace_id_fkey;
            
            -- Add foreign key constraint
            ALTER TABLE public.instagram_accounts 
            ADD CONSTRAINT instagram_accounts_workspace_id_fkey 
            FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
        END IF;

        -- Note: We keep user_id for now to preserve data. It will be dropped in a later migration
        -- or can be dropped manually after migrating data to workspaces
    ELSE
        -- Table doesn't exist, create it with new schema
        CREATE TABLE public.instagram_accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
            username TEXT NOT NULL,
            external_id TEXT,
            account_type TEXT CHECK (account_type IN ('Business', 'Creator', 'Personal')),
            profile_picture_url TEXT,
            access_token TEXT,
            connected_at TIMESTAMPTZ DEFAULT now(),
            last_synced_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    END IF;
END $$;

-- 7. Create or update scheduled_posts to use workspace_id
DO $$ 
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scheduled_posts'
    ) THEN
        -- Table exists, update it
        -- Add workspace_id column if it doesn't exist (nullable first)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'scheduled_posts' 
            AND column_name = 'workspace_id'
        ) THEN
            ALTER TABLE public.scheduled_posts 
            ADD COLUMN workspace_id UUID;
        END IF;

        -- Add instagram_account_id if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'scheduled_posts' 
            AND column_name = 'instagram_account_id'
        ) THEN
            ALTER TABLE public.scheduled_posts 
            ADD COLUMN instagram_account_id UUID;
        END IF;

        -- Copy account_id to instagram_account_id if instagram_account_id is null
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'scheduled_posts' 
            AND column_name = 'account_id'
        ) THEN
            UPDATE public.scheduled_posts
            SET instagram_account_id = account_id
            WHERE instagram_account_id IS NULL 
            AND account_id IS NOT NULL;
        END IF;

        -- Update scheduled_posts schema
        ALTER TABLE public.scheduled_posts
            ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image',
            ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS hashtags TEXT,
            ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS external_post_id TEXT,
            ADD COLUMN IF NOT EXISTS error_message TEXT;

        -- Convert media_urls from TEXT[] to JSONB if needed
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'scheduled_posts' 
            AND column_name = 'media_urls'
            AND data_type = 'ARRAY'
        ) THEN
            -- This will be handled by application layer or a separate migration
            -- For now, we keep both columns
        END IF;

        -- Rename scheduled_for to scheduled_at if exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'scheduled_posts' 
            AND column_name = 'scheduled_for'
            AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'scheduled_posts' 
                AND column_name = 'scheduled_at'
            )
        ) THEN
            ALTER TABLE public.scheduled_posts 
            RENAME COLUMN scheduled_for TO scheduled_at;
        END IF;

        -- Copy scheduled_for to scheduled_at if scheduled_at is null
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'scheduled_posts' 
            AND column_name = 'scheduled_for'
        ) THEN
            UPDATE public.scheduled_posts
            SET scheduled_at = scheduled_for
            WHERE scheduled_at IS NULL 
            AND scheduled_for IS NOT NULL;
        END IF;

        -- Add foreign key constraints if tables exist
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'workspaces'
        ) THEN
            ALTER TABLE public.scheduled_posts 
            DROP CONSTRAINT IF EXISTS scheduled_posts_workspace_id_fkey;
            
            ALTER TABLE public.scheduled_posts 
            ADD CONSTRAINT scheduled_posts_workspace_id_fkey 
            FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'instagram_accounts'
        ) THEN
            ALTER TABLE public.scheduled_posts 
            DROP CONSTRAINT IF EXISTS scheduled_posts_instagram_account_id_fkey;
            
            ALTER TABLE public.scheduled_posts 
            ADD CONSTRAINT scheduled_posts_instagram_account_id_fkey 
            FOREIGN KEY (instagram_account_id) REFERENCES public.instagram_accounts(id) ON DELETE CASCADE;
        END IF;

        -- Note: We keep user_id and account_id for now to preserve data
    ELSE
        -- Table doesn't exist, create it with new schema
        CREATE TABLE public.scheduled_posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
            instagram_account_id UUID REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
            media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'carousel')) DEFAULT 'image',
            media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
            caption TEXT,
            hashtags TEXT,
            scheduled_at TIMESTAMPTZ NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('scheduled', 'processing', 'published', 'failed', 'canceled')) DEFAULT 'scheduled',
            published_at TIMESTAMPTZ,
            external_post_id TEXT,
            error_message TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;
END $$;

-- 8. Create or update analytics_snapshots
DO $$ 
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'analytics_snapshots'
    ) THEN
        -- Table exists, update it
        -- Add instagram_account_id if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'analytics_snapshots' 
            AND column_name = 'instagram_account_id'
        ) THEN
            ALTER TABLE public.analytics_snapshots
            ADD COLUMN instagram_account_id UUID;
        END IF;

        -- Copy account_id to instagram_account_id if instagram_account_id is null
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'analytics_snapshots' 
            AND column_name = 'account_id'
        ) THEN
            UPDATE public.analytics_snapshots
            SET instagram_account_id = account_id
            WHERE instagram_account_id IS NULL 
            AND account_id IS NOT NULL;
        END IF;

        -- Add other columns if they don't exist
        ALTER TABLE public.analytics_snapshots
            ADD COLUMN IF NOT EXISTS snapshot_date DATE DEFAULT CURRENT_DATE,
            ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS posts_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS total_likes INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS total_comments INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC(6,3) DEFAULT 0;

        -- Add foreign key constraint if instagram_accounts exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'instagram_accounts'
        ) THEN
            ALTER TABLE public.analytics_snapshots 
            DROP CONSTRAINT IF EXISTS analytics_snapshots_instagram_account_id_fkey;
            
            ALTER TABLE public.analytics_snapshots 
            ADD CONSTRAINT analytics_snapshots_instagram_account_id_fkey 
            FOREIGN KEY (instagram_account_id) REFERENCES public.instagram_accounts(id) ON DELETE CASCADE;
        END IF;

        -- Update unique constraint
        DROP INDEX IF EXISTS analytics_snapshots_account_id_snapshot_date_key;
        DROP INDEX IF EXISTS analytics_snapshots_account_snapshot_unique;
        
        -- Only create unique constraint if instagram_account_id is not null
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'analytics_snapshots' 
            AND column_name = 'instagram_account_id'
        ) THEN
            CREATE UNIQUE INDEX IF NOT EXISTS analytics_snapshots_account_snapshot_unique 
                ON public.analytics_snapshots(instagram_account_id, snapshot_date)
                WHERE instagram_account_id IS NOT NULL;
        END IF;

        -- Note: We keep account_id for now to preserve data
    ELSE
        -- Table doesn't exist, create it with new schema
        CREATE TABLE public.analytics_snapshots (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            instagram_account_id UUID NOT NULL REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
            snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
            followers_count INT NOT NULL DEFAULT 0,
            posts_count INT NOT NULL DEFAULT 0,
            total_likes INT NOT NULL DEFAULT 0,
            total_comments INT NOT NULL DEFAULT 0,
            engagement_rate NUMERIC(6,3) NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE (instagram_account_id, snapshot_date)
        );
    END IF;
END $$;

-- 9. Create post_performances table
CREATE TABLE IF NOT EXISTS public.post_performances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_account_id UUID NOT NULL REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
    external_post_id TEXT,
    posted_at TIMESTAMPTZ,
    likes INT NOT NULL DEFAULT 0,
    comments INT NOT NULL DEFAULT 0,
    reach INT,
    saves INT,
    engagement_rate NUMERIC(6,3),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    instagram_account_id UUID REFERENCES public.instagram_accounts(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('engagement_drop', 'posting_low', 'growth_spike')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_user_id ON public.workspaces(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_users_workspace_id ON public.workspace_users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_users_user_id ON public.workspace_users(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_id ON public.subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_workspace_id ON public.instagram_accounts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_workspace_id ON public.scheduled_posts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON public.scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_account_id ON public.analytics_snapshots(instagram_account_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_snapshot_date ON public.analytics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_post_performances_account_id ON public.post_performances(instagram_account_id);
CREATE INDEX IF NOT EXISTS idx_post_performances_posted_at ON public.post_performances(posted_at);
CREATE INDEX IF NOT EXISTS idx_alerts_workspace_id ON public.alerts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON public.alerts(is_read);

-- ============================================
-- Seed Subscription Plans
-- ============================================

INSERT INTO public.subscription_plans (name, max_accounts, price_per_month, features_json) VALUES
    ('Free', 1, 0, '{"scheduled_posts": 10, "analytics": "basic", "support": "email"}'::jsonb),
    ('Pro', 5, 29.00, '{"scheduled_posts": -1, "analytics": "advanced", "support": "priority", "team_members": 3}'::jsonb),
    ('Agency', -1, 99.00, '{"scheduled_posts": -1, "analytics": "advanced", "support": "dedicated", "team_members": -1, "white_label": true, "api_access": true}'::jsonb),
    ('Enterprise', -1, 299.00, '{"scheduled_posts": -1, "analytics": "advanced", "support": "dedicated", "team_members": -1, "white_label": true, "api_access": true, "custom_integrations": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- Enable RLS
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Helper function to check if user has access to workspace
CREATE OR REPLACE FUNCTION public.user_has_workspace_access(_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_users wu
        JOIN public.users u ON u.id = wu.user_id
        WHERE wu.workspace_id = _workspace_id
        AND u.auth_user_id = auth.uid()
    );
$$;

-- Users: Can view/update their own user record
CREATE POLICY "Users can view their own user record"
    ON public.users FOR SELECT
    USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own user record"
    ON public.users FOR UPDATE
    USING (auth_user_id = auth.uid());

-- Workspaces: Can view/update workspaces they belong to
CREATE POLICY "Users can view workspaces they belong to"
    ON public.workspaces FOR SELECT
    USING (public.user_has_workspace_access(id));

CREATE POLICY "Users can update workspaces they belong to"
    ON public.workspaces FOR UPDATE
    USING (public.user_has_workspace_access(id));

-- Workspace Users: Can view workspace_users for workspaces they belong to
CREATE POLICY "Users can view workspace_users for their workspaces"
    ON public.workspace_users FOR SELECT
    USING (public.user_has_workspace_access(workspace_id));

-- Subscription Plans: Readable by all authenticated users
CREATE POLICY "Authenticated users can view subscription plans"
    ON public.subscription_plans FOR SELECT
    USING (auth.role() = 'authenticated');

-- Subscriptions: Can view subscriptions for workspaces they belong to
CREATE POLICY "Users can view subscriptions for their workspaces"
    ON public.subscriptions FOR SELECT
    USING (public.user_has_workspace_access(workspace_id));

-- Instagram Accounts: Can view/update accounts in their workspaces
CREATE POLICY "Users can view instagram_accounts in their workspaces"
    ON public.instagram_accounts FOR SELECT
    USING (workspace_id IS NULL OR public.user_has_workspace_access(workspace_id));

CREATE POLICY "Users can insert instagram_accounts in their workspaces"
    ON public.instagram_accounts FOR INSERT
    WITH CHECK (public.user_has_workspace_access(workspace_id));

CREATE POLICY "Users can update instagram_accounts in their workspaces"
    ON public.instagram_accounts FOR UPDATE
    USING (public.user_has_workspace_access(workspace_id));

CREATE POLICY "Users can delete instagram_accounts in their workspaces"
    ON public.instagram_accounts FOR DELETE
    USING (public.user_has_workspace_access(workspace_id));

-- Scheduled Posts: Can view/update posts in their workspaces
CREATE POLICY "Users can view scheduled_posts in their workspaces"
    ON public.scheduled_posts FOR SELECT
    USING (public.user_has_workspace_access(workspace_id));

CREATE POLICY "Users can insert scheduled_posts in their workspaces"
    ON public.scheduled_posts FOR INSERT
    WITH CHECK (public.user_has_workspace_access(workspace_id));

CREATE POLICY "Users can update scheduled_posts in their workspaces"
    ON public.scheduled_posts FOR UPDATE
    USING (public.user_has_workspace_access(workspace_id));

CREATE POLICY "Users can delete scheduled_posts in their workspaces"
    ON public.scheduled_posts FOR DELETE
    USING (public.user_has_workspace_access(workspace_id));

-- Analytics Snapshots: Can view snapshots for accounts in their workspaces
CREATE POLICY "Users can view analytics_snapshots for their accounts"
    ON public.analytics_snapshots FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.instagram_accounts ia
            WHERE ia.id = analytics_snapshots.instagram_account_id
            AND public.user_has_workspace_access(ia.workspace_id)
        )
    );

-- Post Performances: Can view performances for accounts in their workspaces
CREATE POLICY "Users can view post_performances for their accounts"
    ON public.post_performances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.instagram_accounts ia
            WHERE ia.id = post_performances.instagram_account_id
            AND public.user_has_workspace_access(ia.workspace_id)
        )
    );

-- Alerts: Can view/update alerts in their workspaces
CREATE POLICY "Users can view alerts in their workspaces"
    ON public.alerts FOR SELECT
    USING (public.user_has_workspace_access(workspace_id));

CREATE POLICY "Users can update alerts in their workspaces"
    ON public.alerts FOR UPDATE
    USING (public.user_has_workspace_access(workspace_id));

-- ============================================
-- Updated Timestamp Trigger
-- ============================================

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

