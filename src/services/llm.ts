import { NicheConfig } from '@/data/niches';
import { supabase } from '@/integrations/supabase/client';

interface ChatContext {
  userName: string;
  businessName: string;
  extraValue: string;
  phone?: string;
  niche: NicheConfig;
}

async function callAI(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context: ChatContext
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('chat', {
    body: {
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      systemPrompt: context.niche.systemPrompt,
      nicheContext: {
        agentName: context.niche.agentName,
        nicheName: context.niche.name,
        userName: context.userName,
        businessName: context.businessName,
        extraValue: context.extraValue,
        phone: context.phone ?? '',
        extraFieldName: context.niche.onboarding.extraFieldName,
        restrictions: context.niche.restrictions,
        rules: context.niche.rules,
      }
    }
  });

  if (error) {
    console.error('AI error:', error);
    throw new Error(error.message || 'Erro ao chamar IA');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.response || 'Desculpe, não consegui processar sua mensagem.';
}

export async function generateAgentReply(
  userMessage: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  context: ChatContext
): Promise<{ response: string; source: 'ai' | 'error' }> {
  const fullHistory = [...chatHistory, { role: 'user' as const, content: userMessage }];

  try {
    const response = await callAI(fullHistory, context);
    return { response, source: 'ai' };
  } catch (error) {
    console.error('AI also failed:', error);
    return { 
      response: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.", 
      source: 'error' 
    };
  }
}
