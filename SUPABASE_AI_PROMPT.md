# Supabase AI Prompt - Fix Database Connection

Copy and paste this entire prompt into **Supabase Dashboard → SQL Editor → AI Assistant** (or Supabase AI Chat):

---

## Prompt for Supabase AI

```
I'm getting this error: "Could not find the table 'public.users' in the schema cache"

I need help setting up my database schema. I have migration files that should create these tables:

Required tables:
1. users - Application users linked to auth.users
2. workspaces - Multi-tenant workspaces
3. workspace_users - Many-to-many relationship
4. subscription_plans - Subscription tiers
5. subscriptions - Workspace subscriptions
6. instagram_accounts - Instagram account connections
7. scheduled_posts - Posts scheduled for publishing
8. analytics_snapshots - Daily analytics data
9. post_performances - Individual post metrics
10. alerts - System alerts

Please:
1. Check which tables currently exist in my database
2. Create any missing tables with the correct schema
3. Ensure foreign key relationships are correct
4. Set up Row Level Security (RLS) policies
5. Create the helper function: user_has_workspace_access()

Here's the schema I need:

**users table:**
- id UUID PRIMARY KEY
- auth_user_id UUID UNIQUE REFERENCES auth.users(id)
- name TEXT
- created_at, updated_at TIMESTAMPTZ

**workspaces table:**
- id UUID PRIMARY KEY
- name TEXT NOT NULL
- owner_user_id UUID REFERENCES users(id)
- created_at, updated_at TIMESTAMPTZ

**workspace_users table:**
- id UUID PRIMARY KEY
- workspace_id UUID REFERENCES workspaces(id)
- user_id UUID REFERENCES users(id)
- role TEXT CHECK (role IN ('Owner', 'Member'))
- UNIQUE (workspace_id, user_id)

**subscription_plans table:**
- id UUID PRIMARY KEY
- name TEXT CHECK (name IN ('Free', 'Pro', 'Agency', 'Enterprise'))
- max_accounts INT
- price_per_month NUMERIC(10,2)
- features_json JSONB

**subscriptions table:**
- id UUID PRIMARY KEY
- workspace_id UUID REFERENCES workspaces(id)
- subscription_plan_id UUID REFERENCES subscription_plans(id)
- status TEXT CHECK (status IN ('active', 'trialing', 'canceled'))
- trial_ends_at, current_period_end TIMESTAMPTZ

**instagram_accounts table:**
- id UUID PRIMARY KEY
- workspace_id UUID REFERENCES workspaces(id)
- username TEXT NOT NULL
- external_id TEXT
- account_type TEXT CHECK (account_type IN ('Business', 'Creator', 'Personal'))
- profile_picture_url TEXT
- access_token TEXT
- connected_at, last_synced_at TIMESTAMPTZ
- created_at, updated_at TIMESTAMPTZ

**scheduled_posts table:**
- id UUID PRIMARY KEY
- workspace_id UUID REFERENCES workspaces(id)
- instagram_account_id UUID REFERENCES instagram_accounts(id)
- media_type TEXT CHECK (media_type IN ('image', 'video', 'carousel'))
- media_urls JSONB
- caption TEXT
- hashtags TEXT
- scheduled_at TIMESTAMPTZ NOT NULL
- status TEXT CHECK (status IN ('scheduled', 'processing', 'published', 'failed', 'canceled'))
- published_at TIMESTAMPTZ
- external_post_id TEXT
- error_message TEXT
- created_at, updated_at TIMESTAMPTZ

**analytics_snapshots table:**
- id UUID PRIMARY KEY
- instagram_account_id UUID REFERENCES instagram_accounts(id)
- snapshot_date DATE NOT NULL
- followers_count INT DEFAULT 0
- posts_count INT DEFAULT 0
- total_likes INT DEFAULT 0
- total_comments INT DEFAULT 0
- engagement_rate NUMERIC(6,3) DEFAULT 0
- created_at TIMESTAMPTZ
- UNIQUE (instagram_account_id, snapshot_date)

**post_performances table:**
- id UUID PRIMARY KEY
- instagram_account_id UUID REFERENCES instagram_accounts(id)
- external_post_id TEXT
- posted_at TIMESTAMPTZ
- likes INT DEFAULT 0
- comments INT DEFAULT 0
- reach INT
- saves INT
- engagement_rate NUMERIC(6,3)
- created_at TIMESTAMPTZ

**alerts table:**
- id UUID PRIMARY KEY
- workspace_id UUID REFERENCES workspaces(id)
- instagram_account_id UUID REFERENCES instagram_accounts(id)
- type TEXT CHECK (type IN ('engagement_drop', 'posting_low', 'growth_spike'))
- message TEXT NOT NULL
- created_at TIMESTAMPTZ
- is_read BOOLEAN DEFAULT false

Please:
1. First check what exists
2. Create missing tables
3. Add indexes for performance
4. Enable RLS on all tables
5. Create basic RLS policies for multi-tenant access
6. Seed subscription_plans with Free, Pro, Agency, Enterprise plans

Use CREATE TABLE IF NOT EXISTS to avoid errors if tables already exist.
```

---

## Alternative: Manual SQL

If the AI doesn't work, you can also:

1. Go to **Supabase Dashboard → SQL Editor**
2. Open the file: `supabase/migrations/20250101000000_workspace_multi_tenant.sql`
3. Copy the entire file content
4. Paste into SQL Editor
5. Click **"Run"**

Then do the same for:
- `supabase/migrations/20250101000001_rpc_functions.sql`

