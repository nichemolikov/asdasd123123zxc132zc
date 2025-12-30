-- ============================================
-- RPC Functions for InstaCommand
-- ============================================

-- 1. signup_bootstrap: Create user, workspace, and subscription after signup
CREATE OR REPLACE FUNCTION public.signup_bootstrap(workspace_name TEXT DEFAULT 'My Workspace')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_workspace_id UUID;
    v_subscription_id UUID;
    v_free_plan_id UUID;
    result JSON;
BEGIN
    -- Get the auth user ID
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Check if user already exists
    SELECT id INTO v_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid();

    -- If user doesn't exist, create them
    IF v_user_id IS NULL THEN
        INSERT INTO public.users (auth_user_id, name)
        VALUES (auth.uid(), COALESCE((auth.jwt() ->> 'full_name'), 'User'))
        RETURNING id INTO v_user_id;
    END IF;

    -- Check if user already has a workspace
    SELECT w.id INTO v_workspace_id
    FROM public.workspaces w
    JOIN public.workspace_users wu ON wu.workspace_id = w.id
    WHERE wu.user_id = v_user_id
    LIMIT 1;

    -- If no workspace exists, create one
    IF v_workspace_id IS NULL THEN
        INSERT INTO public.workspaces (name, owner_user_id)
        VALUES (COALESCE(workspace_name, 'InstaCommand Workspace'), v_user_id)
        RETURNING id INTO v_workspace_id;

        -- Add user as Owner
        INSERT INTO public.workspace_users (workspace_id, user_id, role)
        VALUES (v_workspace_id, v_user_id, 'Owner');

        -- Get Free plan ID
        SELECT id INTO v_free_plan_id
        FROM public.subscription_plans
        WHERE name = 'Free'
        LIMIT 1;

        -- Create subscription
        IF v_free_plan_id IS NOT NULL THEN
            INSERT INTO public.subscriptions (
                workspace_id,
                subscription_plan_id,
                status,
                trial_ends_at,
                current_period_end
            )
            VALUES (
                v_workspace_id,
                v_free_plan_id,
                'trialing',
                now() + INTERVAL '14 days',
                now() + INTERVAL '14 days'
            )
            RETURNING id INTO v_subscription_id;
        END IF;
    END IF;

    -- Return result
    SELECT json_build_object(
        'user_id', v_user_id,
        'workspace_id', v_workspace_id,
        'subscription_id', v_subscription_id
    ) INTO result;

    RETURN result;
END;
$$;

-- 2. me: Get current user with workspaces and active subscription
CREATE OR REPLACE FUNCTION public.me()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    result JSON;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Get user ID
    SELECT id INTO v_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Build result with user, workspaces, and active subscription
    SELECT json_build_object(
        'user', (
            SELECT json_build_object(
                'id', u.id,
                'name', u.name,
                'created_at', u.created_at
            )
            FROM public.users u
            WHERE u.id = v_user_id
        ),
        'workspaces', (
            SELECT json_agg(
                json_build_object(
                    'id', w.id,
                    'name', w.name,
                    'role', wu.role,
                    'created_at', w.created_at
                )
            )
            FROM public.workspaces w
            JOIN public.workspace_users wu ON wu.workspace_id = w.id
            WHERE wu.user_id = v_user_id
        ),
        'active_subscription', (
            SELECT json_build_object(
                'id', s.id,
                'workspace_id', s.workspace_id,
                'plan', json_build_object(
                    'id', sp.id,
                    'name', sp.name,
                    'max_accounts', sp.max_accounts,
                    'price_per_month', sp.price_per_month
                ),
                'status', s.status,
                'trial_ends_at', s.trial_ends_at,
                'current_period_end', s.current_period_end
            )
            FROM public.subscriptions s
            JOIN public.subscription_plans sp ON sp.id = s.subscription_plan_id
            JOIN public.workspace_users wu ON wu.workspace_id = s.workspace_id
            WHERE wu.user_id = v_user_id
            AND s.status IN ('active', 'trialing')
            ORDER BY s.created_at DESC
            LIMIT 1
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- 3. current_workspace: Get active workspace for current user
CREATE OR REPLACE FUNCTION public.current_workspace()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    result JSON;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    SELECT id INTO v_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    SELECT json_build_object(
        'workspace', (
            SELECT json_build_object(
                'id', w.id,
                'name', w.name,
                'owner_user_id', w.owner_user_id,
                'created_at', w.created_at
            )
            FROM public.workspaces w
            JOIN public.workspace_users wu ON wu.workspace_id = w.id
            WHERE wu.user_id = v_user_id
            ORDER BY w.created_at ASC
            LIMIT 1
        ),
        'subscription', (
            SELECT json_build_object(
                'id', s.id,
                'plan', json_build_object(
                    'name', sp.name,
                    'max_accounts', sp.max_accounts,
                    'price_per_month', sp.price_per_month
                ),
                'status', s.status
            )
            FROM public.subscriptions s
            JOIN public.subscription_plans sp ON sp.id = s.subscription_plan_id
            JOIN public.workspace_users wu ON wu.workspace_id = s.workspace_id
            WHERE wu.user_id = v_user_id
            AND s.status IN ('active', 'trialing')
            ORDER BY s.created_at DESC
            LIMIT 1
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- 4. dashboard_overview: Get dashboard stats for a workspace
CREATE OR REPLACE FUNCTION public.dashboard_overview(p_workspace_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check workspace access
    IF NOT public.user_has_workspace_access(p_workspace_id) THEN
        RAISE EXCEPTION 'Access denied to workspace';
    END IF;

    SELECT json_build_object(
        'total_followers', COALESCE(SUM(latest.followers_count), 0),
        'total_posts', COALESCE(SUM(latest.posts_count), 0),
        'total_likes_last_30_days', COALESCE(SUM(pp.likes), 0),
        'average_engagement_rate', COALESCE(AVG(latest.engagement_rate), 0),
        'accounts', (
            SELECT json_agg(
                json_build_object(
                    'id', ia.id,
                    'username', ia.username,
                    'profile_picture_url', ia.profile_picture_url,
                    'followers', latest.followers_count,
                    'posts', latest.posts_count,
                    'engagement_rate', latest.engagement_rate,
                    'last_post_date', (
                        SELECT MAX(posted_at)
                        FROM public.post_performances
                        WHERE instagram_account_id = ia.id
                    ),
                    'engagement_score', (
                        -- Simple engagement score calculation (0-100)
                        LEAST(100, GREATEST(0,
                            (latest.engagement_rate * 10) +
                            (LOG(1 + latest.followers_count) * 2) +
                            (CASE WHEN latest.posts_count > 0 THEN 10 ELSE 0 END)
                        ))
                    )
                )
            )
            FROM public.instagram_accounts ia
            LEFT JOIN LATERAL (
                SELECT 
                    followers_count,
                    posts_count,
                    engagement_rate
                FROM public.analytics_snapshots
                WHERE instagram_account_id = ia.id
                ORDER BY snapshot_date DESC
                LIMIT 1
            ) latest ON true
            WHERE ia.workspace_id = p_workspace_id
        )
    ) INTO result
    FROM public.instagram_accounts ia
    LEFT JOIN LATERAL (
        SELECT 
            followers_count,
            posts_count,
            engagement_rate
        FROM public.analytics_snapshots
        WHERE instagram_account_id = ia.id
        ORDER BY snapshot_date DESC
        LIMIT 1
    ) latest ON true
    LEFT JOIN public.post_performances pp ON pp.instagram_account_id = ia.id
        AND pp.posted_at >= now() - INTERVAL '30 days'
    WHERE ia.workspace_id = p_workspace_id;

    RETURN result;
END;
$$;

-- 5. get_instagram_account_details: Get detailed account info with analytics
CREATE OR REPLACE FUNCTION public.get_instagram_account_details(p_account_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workspace_id UUID;
    result JSON;
BEGIN
    -- Get workspace_id and check access
    SELECT workspace_id INTO v_workspace_id
    FROM public.instagram_accounts
    WHERE id = p_account_id;

    IF v_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Account not found';
    END IF;

    IF NOT public.user_has_workspace_access(v_workspace_id) THEN
        RAISE EXCEPTION 'Access denied to account';
    END IF;

    SELECT json_build_object(
        'account', (
            SELECT json_build_object(
                'id', ia.id,
                'username', ia.username,
                'account_type', ia.account_type,
                'profile_picture_url', ia.profile_picture_url,
                'connected_at', ia.connected_at,
                'last_synced_at', ia.last_synced_at
            )
            FROM public.instagram_accounts ia
            WHERE ia.id = p_account_id
        ),
        'latest_snapshot', (
            SELECT json_build_object(
                'snapshot_date', snapshot_date,
                'followers_count', followers_count,
                'posts_count', posts_count,
                'total_likes', total_likes,
                'total_comments', total_comments,
                'engagement_rate', engagement_rate
            )
            FROM public.analytics_snapshots
            WHERE instagram_account_id = p_account_id
            ORDER BY snapshot_date DESC
            LIMIT 1
        ),
        'engagement_score', (
            SELECT LEAST(100, GREATEST(0,
                (COALESCE(MAX(engagement_rate), 0) * 10) +
                (LOG(1 + COALESCE(MAX(followers_count), 0)) * 2) +
                (CASE WHEN COUNT(*) > 0 THEN 10 ELSE 0 END)
            ))
            FROM public.analytics_snapshots
            WHERE instagram_account_id = p_account_id
        ),
        'best_time_to_post', (
            SELECT json_agg(
                json_build_object(
                    'day_of_week', day_of_week,
                    'hour_of_day', hour_of_day,
                    'avg_engagement', avg_engagement
                )
                ORDER BY avg_engagement DESC
            )
            FROM (
                SELECT 
                    EXTRACT(DOW FROM posted_at)::INTEGER as day_of_week,
                    EXTRACT(HOUR FROM posted_at)::INTEGER as hour_of_day,
                    AVG(engagement_rate) as avg_engagement
                FROM public.post_performances
                WHERE instagram_account_id = p_account_id
                AND posted_at >= now() - INTERVAL '90 days'
                GROUP BY day_of_week, hour_of_day
                HAVING COUNT(*) >= 2
                ORDER BY avg_engagement DESC
                LIMIT 3
            ) best_times
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- 6. invite_member: Invite a member to workspace (stub - sends email via trigger/edge function)
CREATE OR REPLACE FUNCTION public.invite_member(
    p_workspace_id UUID,
    p_email TEXT,
    p_role TEXT DEFAULT 'Member'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_invited_user_id UUID;
    result JSON;
BEGIN
    -- Check workspace access
    IF NOT public.user_has_workspace_access(p_workspace_id) THEN
        RAISE EXCEPTION 'Access denied to workspace';
    END IF;

    -- Validate role
    IF p_role NOT IN ('Owner', 'Member') THEN
        RAISE EXCEPTION 'Invalid role. Must be Owner or Member';
    END IF;

    -- Get current user ID
    SELECT id INTO v_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid();

    -- Check if user with email exists
    SELECT u.id INTO v_invited_user_id
    FROM public.users u
    JOIN auth.users au ON au.id = u.auth_user_id
    WHERE au.email = p_email;

    -- If user exists, add them to workspace
    IF v_invited_user_id IS NOT NULL THEN
        INSERT INTO public.workspace_users (workspace_id, user_id, role)
        VALUES (p_workspace_id, v_invited_user_id, p_role)
        ON CONFLICT (workspace_id, user_id) DO UPDATE
        SET role = EXCLUDED.role;

        SELECT json_build_object(
            'success', true,
            'message', 'User added to workspace',
            'user_id', v_invited_user_id
        ) INTO result;
    ELSE
        -- User doesn't exist - would typically send invitation email here
        -- For now, just return success (edge function would handle email)
        SELECT json_build_object(
            'success', true,
            'message', 'Invitation will be sent to ' || p_email,
            'email', p_email
        ) INTO result;
    END IF;

    RETURN result;
END;
$$;

