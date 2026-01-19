-- Add column to store the full AI analysis JSON
ALTER TABLE public.business_configurations 
ADD COLUMN IF NOT EXISTS analysis_data jsonb DEFAULT NULL;