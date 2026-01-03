import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Eres un experto estratega de marketing digital con más de 20 años de experiencia en campañas publicitarias de alto impacto. Tu tarea es analizar la información de una empresa y generar un análisis PROFUNDO y DETALLADO para crear campañas publicitarias exitosas.

REGLAS ESTRICTAS:

1. REGLA DE PROFUNDIDAD: No seas superficial. Escribe análisis detallados de marketing. Explica el POR QUÉ de cada punto. Cada sección debe tener contenido sustancial que demuestre un análisis real.

2. REGLA DE SEGMENTACIÓN (CRÍTICA):
   - En la sección de "audience", DEBES generar OBLIGATORIAMENTE:
     - 10 Intereses Directos: Nichos exactos relacionados con el producto/servicio
     - 10 Intereses Indirectos: Comportamientos o gustos laterales que indican propensión a comprar

3. REGLA DE IDENTIDAD VISUAL:
   - Sugiere EXACTAMENTE 4 colores específicos con sus códigos Hexadecimales reales
   - Explica el significado psicológico de cada color para la marca

4. REGLA DE ESTRATEGIA:
   - Proporciona CTAs específicos y probados
   - Define el perfil de comprador ideal con detalle demográfico y psicográfico

Responde ÚNICAMENTE con un JSON válido siguiendo esta estructura exacta:

{
  "presentation": {
    "company_name": "Nombre de la empresa",
    "what_sells": "Descripción detallada de qué vende (mínimo 3 oraciones explicando el producto/servicio, sus características y beneficios principales)",
    "main_attraction": "Qué atrae a los clientes hacia esta marca (explicación psicológica detallada)",
    "uniqueness": "Qué hace única a esta empresa frente a la competencia (análisis competitivo profundo)",
    "competitive_advantages": ["Ventaja 1 con explicación", "Ventaja 2 con explicación", "Ventaja 3 con explicación", "Ventaja 4 con explicación", "Ventaja 5 con explicación"]
  },
  "audience": {
    "problems_solved": ["Problema 1 con contexto", "Problema 2 con contexto", "Problema 3 con contexto", "Problema 4 con contexto", "Problema 5 con contexto"],
    "direct_interests": ["Interés directo 1", "Interés directo 2", "Interés directo 3", "Interés directo 4", "Interés directo 5", "Interés directo 6", "Interés directo 7", "Interés directo 8", "Interés directo 9", "Interés directo 10"],
    "indirect_interests": ["Interés indirecto 1", "Interés indirecto 2", "Interés indirecto 3", "Interés indirecto 4", "Interés indirecto 5", "Interés indirecto 6", "Interés indirecto 7", "Interés indirecto 8", "Interés indirecto 9", "Interés indirecto 10"],
    "target_countries": ["País 1", "País 2", "País 3", "País 4", "País 5"],
    "buyer_demographics": "Descripción detallada del comprador ideal (edad, género, ingresos, educación, ubicación, etc.)"
  },
  "value_proposition": {
    "keywords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5", "palabra6", "palabra7", "palabra8", "palabra9", "palabra10"],
    "inspiring_phrases": ["Frase publicitaria 1", "Frase publicitaria 2", "Frase publicitaria 3", "Frase publicitaria 4", "Frase publicitaria 5"],
    "emotional_hooks": ["Gancho emocional 1", "Gancho emocional 2", "Gancho emocional 3"]
  },
  "visual_identity": {
    "recommended_colors": [
      {"hex": "#XXXXXX", "name": "Nombre del color", "psychology": "Significado psicológico para la marca"},
      {"hex": "#XXXXXX", "name": "Nombre del color", "psychology": "Significado psicológico para la marca"},
      {"hex": "#XXXXXX", "name": "Nombre del color", "psychology": "Significado psicológico para la marca"},
      {"hex": "#XXXXXX", "name": "Nombre del color", "psychology": "Significado psicológico para la marca"}
    ],
    "visual_style": "Descripción del estilo visual recomendado",
    "theme": "Tema visual general",
    "imagery_recommendations": "Recomendaciones específicas para imágenes y fotografías"
  },
  "social_analysis": {
    "top_content_types": ["Tipo de contenido 1", "Tipo de contenido 2", "Tipo de contenido 3", "Tipo de contenido 4", "Tipo de contenido 5"],
    "success_probability": "XX%",
    "competition_level": "Nivel de competencia con análisis",
    "recommended_platforms": ["Plataforma 1 con razón", "Plataforma 2 con razón", "Plataforma 3 con razón"],
    "posting_frequency": "Frecuencia de publicación recomendada con justificación"
  },
  "strategy": {
    "main_objective": "Objetivo principal de la campaña con KPIs sugeridos",
    "primary_cta": "CTA principal con explicación de por qué funciona",
    "secondary_ctas": ["CTA secundario 1", "CTA secundario 2", "CTA secundario 3"],
    "sales_profile": "Perfil de venta ideal con descripción detallada del cliente que más probabilidad tiene de comprar",
    "funnel_stages": ["Etapa 1 del funnel", "Etapa 2 del funnel", "Etapa 3 del funnel"],
    "budget_recommendation": "Recomendación de presupuesto inicial para testing"
  }
}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessInfo, country, city } = await req.json();

    console.log('Analyzing business info for:', country, city);
    console.log('Business info length:', businessInfo?.length || 0);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Analiza la siguiente información de empresa y genera un análisis de marketing completo:

INFORMACIÓN DE LA EMPRESA:
${businessInfo}

UBICACIÓN GEOGRÁFICA PRINCIPAL:
- País: ${country}
- Ciudad: ${city || 'No especificada'}

Genera un análisis profundo y detallado siguiendo todas las reglas del sistema. Recuerda incluir EXACTAMENTE 10 intereses directos y 10 intereses indirectos. Los colores deben tener códigos hexadecimales reales y válidos.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from AI");
    }

    console.log("AI response received, parsing JSON...");

    const extractJsonCandidate = (raw: string) => {
      let text = raw.trim();

      // Handle markdown code fences
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fenceMatch?.[1]) text = fenceMatch[1].trim();

      // Fallback: extract the first JSON object-like chunk
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        text = text.slice(start, end + 1);
      }

      return text.trim();
    };

    const removeTrailingCommas = (s: string) => s.replace(/,\s*([}\]])/g, "$1");

    const decodeEscapedJson = (s: string) =>
      // Handles payloads like: {\n  \"presentation\": ... }
      s
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"');

    const candidate = extractJsonCandidate(content);

    // If the model returns JSON with escaped quotes/newlines (invalid JSON), decode it.
    // Typical signature: starts with `{\n  \"presentation\": ... }`
    const looksLikeEscapedJson =
      candidate.includes('\\"') &&
      candidate.includes('\\"presentation\\"') &&
      !candidate.includes('"presentation"');

    const attempts: string[] = [candidate, removeTrailingCommas(candidate)];

    if (looksLikeEscapedJson) {
      attempts.push(decodeEscapedJson(candidate));
      attempts.push(decodeEscapedJson(removeTrailingCommas(candidate)));
    }

    let analysis: any | undefined;
    let lastParseError: unknown;

    for (const attempt of attempts) {
      try {
        analysis = JSON.parse(attempt);
        break;
      } catch (e) {
        lastParseError = e;
      }
    }

    if (!analysis) {
      console.error("Failed to parse AI JSON after attempts.");
      console.error("Last parse error:", lastParseError);
      console.error("Candidate preview (first 500 chars):", candidate.substring(0, 500));
      console.error(
        "Candidate preview (last 500 chars):",
        candidate.substring(Math.max(0, candidate.length - 500))
      );

      throw new Error(
        `Failed to parse AI response as JSON: ${
          lastParseError instanceof Error ? lastParseError.message : "Unknown parse error"
        }`
      );
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
