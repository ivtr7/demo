import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt: string;
  nicheContext: {
    agentName: string;
    nicheName: string;
    userName: string;
    businessName: string;
    extraValue: string;
    extraFieldName: string;
    restrictions?: string;
    rules: {
      useVariables: boolean;
      oneQuestionAtTime: boolean;
      suggestNextSteps: boolean;
      keepResponsesShort: boolean;
    };
  };
}

function buildSystemPrompt(request: ChatRequest): string {
  const { systemPrompt, nicheContext } = request;
  const { userName, businessName, extraValue, extraFieldName, restrictions, rules } = nicheContext;
  
  let prompt = systemPrompt + '\n\n';
  
  prompt += '=== CONTEXTO DO ATENDIMENTO ===\n';
  if (userName) prompt += `- Nome do cliente: ${userName}\n`;
  if (businessName) prompt += `- Nome do negócio: ${businessName}\n`;
  if (extraValue) prompt += `- ${extraFieldName}: ${extraValue}\n`;
  prompt += '\n';
  
  prompt += '=== REGRAS DE COMPORTAMENTO ===\n';
  if (rules.useVariables) {
    prompt += '- SEMPRE use o nome do cliente e do negócio nas respostas quando fizer sentido.\n';
  }
  if (rules.oneQuestionAtTime) {
    prompt += '- Faça apenas UMA pergunta por vez.\n';
  }
  if (rules.suggestNextSteps) {
    prompt += '- Sempre sugira o próximo passo (agendar, conhecer, tirar dúvida).\n';
  }
  if (rules.keepResponsesShort) {
    prompt += '- Mantenha as respostas curtas e objetivas (máximo 3-4 frases).\n';
  }
  
  if (restrictions) {
    prompt += `\n=== RESTRIÇÕES ===\n${restrictions}\n`;
  }
  
  prompt += '\n=== INSTRUÇÕES ESPECIAIS ===\n';
  prompt += '- Quando anotar algo importante, inclua: "✅ Anotado (demo): [resumo]"\n';
  prompt += '- Este é um ambiente de demonstração. Simule agendamentos e anotações.\n';
  prompt += '- Seja sempre empático e profissional.\n';
  prompt += '- Responda em português brasileiro.\n';
  
  return prompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ChatRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ 
        error: "Serviço de IA não configurado",
        response: "Desculpe, estou com dificuldades técnicas. Tente novamente em alguns instantes."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the full system prompt
    const fullSystemPrompt = buildSystemPrompt(requestData);
    
    // Prepare messages for the AI
    const aiMessages = [
      { role: "system", content: fullSystemPrompt },
      ...requestData.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit excedido. Tente novamente em alguns segundos.",
          response: "Estou recebendo muitas mensagens agora. Por favor, aguarde um momento e tente novamente."
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Créditos esgotados.",
          response: "O serviço de IA está temporariamente indisponível. Configure uma API Key do Gemini no Admin para continuar."
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: "Erro no serviço de IA",
        response: "Desculpe, não consegui processar sua mensagem. Tente novamente."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";
    
    console.log("AI response received successfully");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      source: 'lovable-ai'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido",
      response: "Desculpe, ocorreu um erro. Tente novamente."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
