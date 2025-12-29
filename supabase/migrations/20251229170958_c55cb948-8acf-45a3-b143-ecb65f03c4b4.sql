-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create instagram_accounts table
CREATE TABLE public.instagram_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    username TEXT NOT NULL,
    instagram_id TEXT,
    avatar_url TEXT,
    access_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    followers_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    avg_likes_per_post NUMERIC(10,2) DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table for Instagram posts
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.instagram_accounts(id) ON DELETE CASCADE NOT NULL,
    instagram_post_id TEXT,
    caption TEXT,
    media_type TEXT NOT NULL DEFAULT 'image',
    media_urls TEXT[] DEFAULT '{}',
    hashtags TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_posts table
CREATE TABLE public.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.instagram_accounts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    caption TEXT,
    media_type TEXT NOT NULL DEFAULT 'image',
    media_urls TEXT[] DEFAULT '{}',
    hashtags TEXT[] DEFAULT '{}',
    first_comment TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    published_post_id UUID REFERENCES public.posts(id),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_snapshots table for historical tracking
CREATE TABLE public.analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.instagram_accounts(id) ON DELETE CASCADE NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    followers_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (account_id, snapshot_date)
);

-- Create best_posting_times table for AI recommendations
CREATE TABLE public.best_posting_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.instagram_accounts(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    hour_of_day INTEGER NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
    engagement_score NUMERIC(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (account_id, day_of_week, hour_of_day)
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.best_posting_times ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for instagram_accounts
CREATE POLICY "Users can view their own Instagram accounts"
ON public.instagram_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Instagram accounts"
ON public.instagram_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram accounts"
ON public.instagram_accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Instagram accounts"
ON public.instagram_accounts FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for posts
CREATE POLICY "Users can view posts from their accounts"
ON public.posts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.instagram_accounts
        WHERE instagram_accounts.id = posts.account_id
        AND instagram_accounts.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert posts to their accounts"
ON public.posts FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.instagram_accounts
        WHERE instagram_accounts.id = posts.account_id
        AND instagram_accounts.user_id = auth.uid()
    )
);

-- RLS Policies for scheduled_posts
CREATE POLICY "Users can view their own scheduled posts"
ON public.scheduled_posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts"
ON public.scheduled_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts"
ON public.scheduled_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts"
ON public.scheduled_posts FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view analytics for their accounts"
ON public.analytics_snapshots FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.instagram_accounts
        WHERE instagram_accounts.id = analytics_snapshots.account_id
        AND instagram_accounts.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert analytics for their accounts"
ON public.analytics_snapshots FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.instagram_accounts
        WHERE instagram_accounts.id = analytics_snapshots.account_id
        AND instagram_accounts.user_id = auth.uid()
    )
);

-- RLS Policies for best_posting_times
CREATE POLICY "Users can view best times for their accounts"
ON public.best_posting_times FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.instagram_accounts
        WHERE instagram_accounts.id = best_posting_times.account_id
        AND instagram_accounts.user_id = auth.uid()
    )
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instagram_accounts_updated_at
    BEFORE UPDATE ON public.instagram_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at
    BEFORE UPDATE ON public.scheduled_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();