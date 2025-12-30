-- Quick Fix: Create dashboard_overview function
-- Run this in Supabase SQL Editor if you're getting 404 errors

-- First, ensure user_has_workspace_access exists (from first migration)
CREATE OR REPLACE FUNCTION public.user_has_workspace_access(_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT id INTO v_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid();

    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.workspace_users
        WHERE workspace_id = _workspace_id
        AND user_id = v_user_id
    );
END;
$$;

-- Create dashboard_overview function
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
        'total_followers', COALESCE(SUM(ia.followers_count), 0),
        'total_posts', COALESCE(SUM(ia.posts_count), 0),
        'total_likes_last_30_days', COALESCE(SUM(pp.likes), 0),
        'average_engagement_rate', COALESCE(AVG(ia.engagement_rate), 0),
        'accounts', (
            SELECT json_agg(
                json_build_object(
                    'id', ia.id,
                    'username', ia.username,
                    'profile_picture_url', ia.profile_picture_url,
                    'followers', ia.followers_count,
                    'posts', ia.posts_count,
                    'engagement_rate', ia.engagement_rate,
                    'last_post_date', (
                        SELECT MAX(posted_at)
                        FROM public.post_performances
                        WHERE instagram_account_id = ia.id
                    ),
                    'engagement_score', LEAST(100, GREATEST(0,
                        (COALESCE(ia.engagement_rate, 0) * 10) +
                        (LOG(1 + COALESCE(ia.followers_count, 0)) * 2) +
                        (CASE WHEN COALESCE(ia.posts_count, 0) > 0 THEN 10 ELSE 0 END)
                    ))
                )
            )
            FROM public.instagram_accounts ia
            WHERE ia.workspace_id = p_workspace_id
        )
    ) INTO result
    FROM public.instagram_accounts ia
    LEFT JOIN public.post_performances pp ON pp.instagram_account_id = ia.id
        AND pp.posted_at >= now() - INTERVAL '30 days'
    WHERE ia.workspace_id = p_workspace_id;

    RETURN COALESCE(result, json_build_object(
        'total_followers', 0,
        'total_posts', 0,
        'total_likes_last_30_days', 0,
        'average_engagement_rate', 0,
        'accounts', '[]'::json
    ));
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.dashboard_overview(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_workspace_access(UUID) TO authenticated;

