import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ success: false, error: "Imagem não fornecida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não está configurada");
    }

    console.log("Processando imagem de comprovante de pagamento...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em extrair valores monetários de comprovantes de pagamento brasileiros (PIX, transferências, depósitos).
            
Analise a imagem e extraia TODOS os valores de pagamentos/transferências encontrados.

REGRAS:
1. A imagem pode conter UM ou MÚLTIPLOS comprovantes (ex: colagem, print com vários comprovantes)
2. Extraia o valor PRINCIPAL de CADA comprovante encontrado
3. Os valores devem estar em formato numérico (ex: 150.00, 1234.56)
4. Ignore taxas, saldos anteriores ou outros valores secundários de cada comprovante
5. Se não conseguir identificar nenhum valor, retorne array vazio`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extraia os valores de pagamento/transferência de todos os comprovantes nesta imagem. Responda APENAS com um JSON no formato: {\"valores\": [123.45, 67.89]} ou {\"valores\": []} se não encontrar nenhum."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Créditos insuficientes para processamento de IA." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Erro da API:", response.status, errorText);
      throw new Error(`Erro ao processar imagem: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("Resposta da IA:", content);

    // Extract JSON from response
    let extractedValues: number[] = [];
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*"valores"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.valores)) {
          extractedValues = parsed.valores
            .filter((v: unknown) => v !== null && !isNaN(Number(v)))
            .map((v: unknown) => Number(v));
        }
      }
    } catch (parseError) {
      console.error("Erro ao parsear resposta:", parseError);
    }

    if (extractedValues.length > 0) {
      console.log("Valores extraídos com sucesso:", extractedValues);
      return new Response(
        JSON.stringify({ success: true, valores: extractedValues }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Não foi possível identificar valores no comprovante." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Erro ao processar comprovante:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
