import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback prompt in case DB fetch fails
const fallbackSystemPrompt = `Eres un experto estratega de marketing digital. Analiza la información de la empresa y genera un análisis detallado en formato JSON.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create client with user's auth token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseAuth.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const { businessInfo, country, city } = await req.json();

    console.log('Analyzing business info for:', country, city);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Use service role key for database operations
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let systemPrompt = fallbackSystemPrompt;
    let modelConfig = { model: "gpt-4o", temperature: 0.7 };

    const { data: promptData, error: promptError } = await supabase
      .from('ai_system_prompts')
      .select('system_instruction, model_config')
      .eq('module_key', 'configurar_empresa')
      .maybeSingle();

    if (promptError) {
      console.error("Error fetching prompt from DB:", promptError);
    } else if (promptData) {
      systemPrompt = promptData.system_instruction || fallbackSystemPrompt;
      if (promptData.model_config) {
        modelConfig = promptData.model_config as { model: string; temperature: number };
      }
      console.log("Loaded prompt from DB, length:", systemPrompt.length);
      console.log("Model config:", modelConfig);
    } else {
      console.log("No prompt found in DB, using fallback");
    }

    // Add JSON schema instructions to ensure proper output
    const fullSystemPrompt = `${systemPrompt}

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido siguiendo esta estructura exacta:

{
  "presentation": {
    "company_name": "Nombre de la empresa",
    "what_sells": "Descripción detallada de qué vende (mínimo 3 oraciones)",
    "main_attraction": "Qué atrae a los clientes hacia esta marca",
    "uniqueness": "Qué hace única a esta empresa",
    "competitive_advantages": ["Ventaja 1", "Ventaja 2", "Ventaja 3", "Ventaja 4", "Ventaja 5"]
  },
  "audience": {
    "problems_solved": ["Problema 1", "Problema 2", "Problema 3", "Problema 4", "Problema 5"],
    "direct_interests": ["Interés 1", "Interés 2", "Interés 3", "Interés 4", "Interés 5", "Interés 6", "Interés 7", "Interés 8", "Interés 9", "Interés 10"],
    "indirect_interests": ["Interés 1", "Interés 2", "Interés 3", "Interés 4", "Interés 5", "Interés 6", "Interés 7", "Interés 8", "Interés 9", "Interés 10"],
    "target_countries": ["País 1", "País 2", "País 3", "País 4", "País 5"],
    "buyer_demographics": "Descripción del comprador ideal"
  },
  "value_proposition": {
    "keywords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5", "palabra6", "palabra7", "palabra8", "palabra9", "palabra10"],
    "inspiring_phrases": ["Frase 1", "Frase 2", "Frase 3", "Frase 4", "Frase 5"],
    "emotional_hooks": ["Gancho 1", "Gancho 2", "Gancho 3"]
  },
  "visual_identity": {
    "recommended_colors": [
      {"hex": "#XXXXXX", "name": "Nombre", "psychology": "Significado"},
      {"hex": "#XXXXXX", "name": "Nombre", "psychology": "Significado"},
      {"hex": "#XXXXXX", "name": "Nombre", "psychology": "Significado"},
      {"hex": "#XXXXXX", "name": "Nombre", "psychology": "Significado"}
    ],
    "visual_style": "Estilo visual recomendado",
    "theme": "Tema visual general",
    "imagery_recommendations": "Recomendaciones para imágenes"
  },
  "social_analysis": {
    "top_content_types": ["Tipo 1", "Tipo 2", "Tipo 3", "Tipo 4", "Tipo 5"],
    "success_probability": "XX%",
    "competition_level": "Nivel de competencia",
    "recommended_platforms": ["Plataforma 1", "Plataforma 2", "Plataforma 3"],
    "posting_frequency": "Frecuencia recomendada"
  },
  "strategy": {
    "main_objective": "Objetivo principal",
    "primary_cta": "CTA principal",
    "secondary_ctas": ["CTA 1", "CTA 2", "CTA 3"],
    "sales_profile": "Perfil de venta ideal",
    "funnel_stages": ["Etapa 1", "Etapa 2", "Etapa 3"],
    "budget_recommendation": "Recomendación de presupuesto"
  }
}`;

    const userPrompt = `Analiza la siguiente información de empresa y genera un análisis de marketing completo:

INFORMACIÓN DE LA EMPRESA:
${businessInfo}

UBICACIÓN GEOGRÁFICA PRINCIPAL:
- País: ${country}
- Ciudad: ${city || 'No especificada'}

Genera un análisis profundo y detallado. Recuerda incluir EXACTAMENTE 10 intereses directos y 10 intereses indirectos. Los colores deben tener códigos hexadecimales reales y válidos.`;

    console.log("Calling OpenAI API with model:", modelConfig.model);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: modelConfig.temperature,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from AI");
    }

    console.log("AI response received, parsing JSON...");

    // OpenAI with response_format: json_object should return valid JSON
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content preview:", content.substring(0, 500));
      
      // Try to extract JSON from markdown if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1]);
      } else {
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          analysis = JSON.parse(content.substring(start, end + 1));
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }
    }

    console.log("Analysis parsed successfully");

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-business-pdf function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
