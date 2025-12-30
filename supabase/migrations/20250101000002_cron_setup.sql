-- ============================================
-- Cron Job Setup for Edge Functions
-- ============================================
-- Note: These cron jobs need to be set up in Supabase Dashboard
-- This file documents the required cron schedule

-- To set up cron jobs in Supabase:
-- 1. Go to Database → Cron Jobs
-- 2. Create new cron job for process_scheduled_posts
--    - Schedule: */5 * * * * (every 5 minutes)
--    - SQL: SELECT net.http_post(
--        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process_scheduled_posts',
--        headers := jsonb_build_object(
--          'Content-Type', 'application/json',
--          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--        ),
--        body := '{}'::jsonb
--      ) as request_id;

-- 3. Create new cron job for daily_analytics_snapshot
--    - Schedule: 0 2 * * * (daily at 2 AM UTC)
--    - SQL: SELECT net.http_post(
--        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily_analytics_snapshot',
--        headers := jsonb_build_object(
--          'Content-Type', 'application/json',
--          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--        ),
--        body := '{}'::jsonb
--      ) as request_id;

-- 4. Create new cron job for refresh_instagram_tokens
--    - Schedule: 0 3 * * * (daily at 3 AM UTC)
--    - SQL: SELECT net.http_post(
--        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-instagram-tokens',
--        headers := jsonb_build_object(
--          'Content-Type', 'application/json',
--          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--        ),
--        body := '{}'::jsonb
--      ) as request_id;

-- Alternative: Use pg_cron extension (if enabled)
-- This is a placeholder - actual cron setup is done via Supabase Dashboard

-- Enable pg_cron extension (if available)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Example cron job SQL (uncomment and modify with your project details):
/*
SELECT cron.schedule(
    'process-scheduled-posts',
    '*/5 * * * *', -- Every 5 minutes
    $$
    SELECT net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process_scheduled_posts',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
        ),
        body := '{}'::jsonb
    ) as request_id;
    $$
);

SELECT cron.schedule(
    'daily-analytics-snapshot',
    '0 2 * * *', -- Daily at 2 AM UTC
    $$
    SELECT net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily_analytics_snapshot',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
        ),
        body := '{}'::jsonb
    ) as request_id;
    $$
);

SELECT cron.schedule(
    'refresh-instagram-tokens',
    '0 3 * * *', -- Daily at 3 AM UTC
    $$
    SELECT net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-instagram-tokens',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
        ),
        body := '{}'::jsonb
    ) as request_id;
    $$
);
*/
