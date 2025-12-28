-- Create table for business configuration
CREATE TABLE public.business_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_manager_id TEXT,
  business_manager_name TEXT,
  ad_account_id TEXT,
  ad_account_name TEXT,
  facebook_page_id TEXT,
  facebook_page_name TEXT,
  pixel_id TEXT,
  pixel_name TEXT,
  whatsapp_account_id TEXT,
  whatsapp_phone TEXT,
  website_url TEXT,
  is_configured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.business_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own configuration"
ON public.business_configurations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configuration"
ON public.business_configurations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configuration"
ON public.business_configurations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configuration"
ON public.business_configurations
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_business_configurations_updated_at
BEFORE UPDATE ON public.business_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();