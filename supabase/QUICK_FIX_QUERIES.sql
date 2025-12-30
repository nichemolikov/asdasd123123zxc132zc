-- ============================================
-- Quick Fix Queries for Supabase Setup
-- ============================================
-- Run these queries in Supabase Dashboard → SQL Editor
-- Copy and paste each section as needed

-- ============================================
-- 1. CHECK IF TABLES EXIST
-- ============================================
-- Run this first to see what's missing

SELECT 
    table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = t.table_name
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (VALUES 
    ('users'),
    ('workspaces'),
    ('workspace_users'),
    ('subscription_plans'),
    ('subscriptions'),
    ('instagram_accounts'),
    ('scheduled_posts'),
    ('analytics_snapshots'),
    ('post_performances'),
    ('alerts')
) AS t(table_name)
ORDER BY table_name;

-- ============================================
-- 2. CHECK IF RPC FUNCTIONS EXIST
-- ============================================

SELECT 
    routine_name,
    routine_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = r.routine_name
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (VALUES 
    ('signup_bootstrap'),
    ('me'),
    ('current_workspace'),
    ('dashboard_overview'),
    ('get_instagram_account_details'),
    ('invite_member'),
    ('user_has_workspace_access')
) AS r(routine_name)
ORDER BY routine_name;

-- ============================================
-- 3. CHECK RLS POLICIES
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 4. MANUAL TABLE CREATION (If migration fails)
-- ============================================
-- Only run this if the migration completely fails
-- Otherwise, use the migration files

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workspace_users table
CREATE TABLE IF NOT EXISTS public.workspace_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Owner', 'Member')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

-- ============================================
-- 5. CLEAN UP (Use with caution!)
-- ============================================
-- Only run if you want to start fresh
-- WARNING: This will delete all data!

/*
-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.post_performances CASCADE;
DROP TABLE IF EXISTS public.analytics_snapshots CASCADE;
DROP TABLE IF EXISTS public.scheduled_posts CASCADE;
DROP TABLE IF EXISTS public.instagram_accounts CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.workspace_users CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
*/

-- ============================================
-- 6. VERIFY CONNECTION
-- ============================================
-- Test if you can query the users table

SELECT COUNT(*) as user_count FROM public.users;
SELECT COUNT(*) as workspace_count FROM public.workspaces;
SELECT COUNT(*) as account_count FROM public.instagram_accounts;

-- ============================================
-- 7. CHECK ENVIRONMENT VARIABLES
-- ============================================
-- This query won't work in SQL, but check your .env file:
-- VITE_SUPABASE_URL should be set
-- VITE_SUPABASE_PUBLISHABLE_KEY should be set

