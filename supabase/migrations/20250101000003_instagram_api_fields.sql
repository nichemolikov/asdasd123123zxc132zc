-- Add Instagram API fields to instagram_accounts table
-- This migration adds fields needed for Instagram Graph API integration

ALTER TABLE public.instagram_accounts
  ADD COLUMN IF NOT EXISTS instagram_account_id TEXT, -- Instagram Business Account ID from Graph API
  ADD COLUMN IF NOT EXISTS facebook_page_id TEXT, -- Connected Facebook Page ID
  ADD COLUMN IF NOT EXISTS access_token TEXT, -- Long-lived access token (encrypted in production)
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ, -- Token expiration date
  ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'LONG_LIVED', -- Token type (SHORT_LIVED, LONG_LIVED)
  ADD COLUMN IF NOT EXISTS bio TEXT, -- Account biography
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0, -- Current follower count
  ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ DEFAULT now(); -- When account was connected

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_instagram_id 
  ON public.instagram_accounts(instagram_account_id);

CREATE INDEX IF NOT EXISTS idx_instagram_accounts_facebook_page 
  ON public.instagram_accounts(facebook_page_id);

-- Add unique constraint to prevent duplicate connections
-- (One Instagram account per workspace)
CREATE UNIQUE INDEX IF NOT EXISTS idx_instagram_accounts_workspace_instagram 
  ON public.instagram_accounts(workspace_id, instagram_account_id) 
  WHERE instagram_account_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.instagram_accounts.instagram_account_id IS 'Instagram Business Account ID from Facebook Graph API';
COMMENT ON COLUMN public.instagram_accounts.facebook_page_id IS 'Facebook Page ID connected to this Instagram account';
COMMENT ON COLUMN public.instagram_accounts.access_token IS 'Long-lived access token for Instagram Graph API (60 days validity)';
COMMENT ON COLUMN public.instagram_accounts.token_expires_at IS 'When the access token expires (should refresh before this)';
COMMENT ON COLUMN public.instagram_accounts.token_type IS 'Type of access token: SHORT_LIVED (1 hour) or LONG_LIVED (60 days)';

