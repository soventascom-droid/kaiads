-- Create table for AI system prompts
CREATE TABLE public.ai_system_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_key TEXT NOT NULL UNIQUE,
  system_instruction TEXT NOT NULL DEFAULT '',
  description TEXT,
  model_config JSONB DEFAULT '{"model": "gpt-4o", "temperature": 0.7}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_system_prompts ENABLE ROW LEVEL SECURITY;

-- Public read access (so the app/edge functions can read prompts)
CREATE POLICY "Anyone can read AI prompts"
ON public.ai_system_prompts
FOR SELECT
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert AI prompts"
ON public.ai_system_prompts
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update AI prompts"
ON public.ai_system_prompts
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete AI prompts"
ON public.ai_system_prompts
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_ai_system_prompts_updated_at
BEFORE UPDATE ON public.ai_system_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data (3 initial modules)
INSERT INTO public.ai_system_prompts (module_key, system_instruction, description, model_config) VALUES
(
  'configurar_empresa',
  'Eres un experto en marketing digital y análisis de mercado. Tu tarea es analizar la información del negocio proporcionada y generar insights estratégicos para campañas publicitarias.',
  'Análisis de mercado y estrategia para configuración de empresa',
  '{"model": "gpt-4o", "temperature": 0.7}'
),
(
  'soporte_flotante',
  'Eres un asistente de soporte técnico amigable para KAI ADS PRO. Ayudas a los usuarios a entender cómo usar la plataforma de publicidad.',
  'Chatbot de ayuda flotante para soporte al usuario',
  '{"model": "gpt-4o", "temperature": 0.5}'
),
(
  'copywriter_ads',
  'Eres un copywriter experto en publicidad digital. Creas textos persuasivos y creativos para anuncios de Facebook e Instagram.',
  'Generador de copys para anuncios publicitarios',
  '{"model": "gpt-4o", "temperature": 0.8}'
);