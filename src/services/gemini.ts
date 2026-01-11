import { NicheConfig, NicheIntent, defaultFallbackTemplate } from '@/data/niches';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
}

interface ChatContext {
  userName: string;
  businessName: string;
  extraValue: string;
  niche: NicheConfig;
}

interface GeminiModelInfo {
  name: string;
  supportedGenerationMethods?: string[];
}

function normalizeGeminiModel(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) return 'gemini-2.0-flash';
  return trimmed.replace(/^models\//i, '');
}

async function listGeminiModels(apiKey: string): Promise<GeminiModelInfo[]> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!response.ok) return [];
  const data = (await response.json().catch(() => null)) as { models?: GeminiModelInfo[] } | null;
  return data?.models ?? [];
}

function pickGenerateContentModel(models: GeminiModelInfo[]): string | null {
  const supported = models.filter(m => (m.supportedGenerationMethods ?? []).includes('generateContent'));
  const normalized = supported.map(m => normalizeGeminiModel(m.name));

  const preferred = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
  ];

  for (const candidate of preferred) {
    const idx = normalized.findIndex(n => n === candidate);
    if (idx >= 0) return normalized[idx];
  }

  return normalized[0] ?? null;
}

function isModelUnsupportedError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('call listmodels') ||
    m.includes('not found for api version') ||
    m.includes('not supported for generatecontent') ||
    m.includes('model') && m.includes('not found')
  );
}

// Call Gemini API
export async function callGemini(
  messages: GeminiMessage[],
  systemPrompt: string,
  config: GeminiConfig
): Promise<string> {
  const body = {
    contents: messages,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: config.temperature,
      topP: config.topP,
      maxOutputTokens: config.maxOutputTokens,
    },
  };

  const requestOnce = async (model: string): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({} as any));
      throw new Error(error.error?.message || 'Erro ao chamar Gemini API');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar sua mensagem.';
  };

  const normalizedModel = normalizeGeminiModel(config.model);

  try {
    return await requestOnce(normalizedModel);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!isModelUnsupportedError(message)) throw err;

    const models = await listGeminiModels(config.apiKey);
    const fallbackModel = pickGenerateContentModel(models);
    if (!fallbackModel || fallbackModel === normalizedModel) throw err;

    return await requestOnce(fallbackModel);
  }
}

// Test Gemini connection
export async function testGeminiConnection(
  apiKey: string,
  model: string = 'gemini-2.0-flash'
): Promise<{ success: boolean; message: string }> {
  try {
    const normalizedModel = normalizeGeminiModel(model);
    const requestOnce = async (selectedModel: string) => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Diga apenas "OK" para testar a conexão.' }] }],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({} as any));
        throw new Error(error.error?.message || 'Erro de conexão');
      }
    };

    try {
      await requestOnce(normalizedModel);
      return { success: true, message: 'Conexão estabelecida com sucesso!' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!isModelUnsupportedError(message)) {
        return { success: false, message };
      }

      const models = await listGeminiModels(apiKey);
      const fallbackModel = pickGenerateContentModel(models);
      if (!fallbackModel || fallbackModel === normalizedModel) {
        return { success: false, message };
      }

      await requestOnce(fallbackModel);
      return { success: true, message: `Conectou com sucesso usando ${fallbackModel}.` };
    }
  } catch (error) {
    return { success: false, message: 'Erro de rede. Verifique sua conexão.' };
  }
}

// Template engine - fallback when no API key
export function matchIntent(message: string, intents: NicheIntent[]): NicheIntent | null {
  const lowerMessage = message.toLowerCase();
  
  for (const intent of intents) {
    for (const keyword of intent.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return intent;
      }
    }
  }
  
  return null;
}

export function fillTemplate(template: string, context: ChatContext): string {
  return template
    .replace(/{USER_NAME}/g, context.userName || 'você')
    .replace(/{BUSINESS_NAME}/g, context.businessName || 'nossa empresa')
    .replace(/{EXTRA_VALUE}/g, context.extraValue || '')
    .replace(/{AGENT_NAME}/g, context.niche.agentName)
    .replace(/{NICHO}/g, context.niche.name);
}

export function generateTemplateResponse(
  message: string,
  context: ChatContext
): string {
  const intent = matchIntent(message, context.niche.intents);
  
  if (intent) {
    return fillTemplate(intent.template, context);
  }
  
  return fillTemplate(defaultFallbackTemplate, context);
}

// Build system prompt with context
export function buildSystemPrompt(niche: NicheConfig, context: Omit<ChatContext, 'niche'>): string {
  const { userName, businessName, extraValue } = context;
  
  let prompt = niche.systemPrompt + '\n\n';
  
  prompt += '=== CONTEXTO DO ATENDIMENTO ===\n';
  if (userName) prompt += `- Nome do cliente: ${userName}\n`;
  if (businessName) prompt += `- Nome do negócio: ${businessName}\n`;
  if (extraValue) prompt += `- ${niche.onboarding.extraFieldName}: ${extraValue}\n`;
  prompt += '\n';
  
  prompt += '=== REGRAS DE COMPORTAMENTO ===\n';
  if (niche.rules.useVariables) {
    prompt += '- SEMPRE use o nome do cliente e do negócio nas respostas quando fizer sentido.\n';
  }
  if (niche.rules.oneQuestionAtTime) {
    prompt += '- Faça apenas UMA pergunta por vez.\n';
  }
  if (niche.rules.suggestNextSteps) {
    prompt += '- Sempre sugira o próximo passo (agendar, conhecer, tirar dúvida).\n';
  }
  if (niche.rules.keepResponsesShort) {
    prompt += '- Mantenha as respostas curtas e objetivas (máximo 3-4 frases).\n';
  }
  
  if (niche.restrictions) {
    prompt += `\n=== RESTRIÇÕES ===\n${niche.restrictions}\n`;
  }
  
  prompt += '\n=== INSTRUÇÕES ESPECIAIS ===\n';
  prompt += '- Quando anotar algo importante, inclua: "✅ Anotado (demo): [resumo]"\n';
  prompt += '- Este é um ambiente de demonstração. Simule agendamentos e anotações.\n';
  prompt += '- Seja sempre empático e profissional.\n';
  
  return prompt;
}

// Main function to generate agent reply
export async function generateAgentReply(
  userMessage: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  context: ChatContext,
  config: {
    apiKey: string;
    model: string;
    temperature: number;
    topP: number;
    maxOutputTokens: number;
  }
): Promise<{ response: string; usedFallback: boolean }> {
  // Try Gemini first
  if (config.apiKey) {
    try {
      const geminiMessages: GeminiMessage[] = chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
      
      geminiMessages.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
      
      const systemPrompt = buildSystemPrompt(context.niche, context);
      
      const response = await callGemini(geminiMessages, systemPrompt, config);
      return { response, usedFallback: false };
    } catch (error) {
      console.warn('Gemini API error, falling back to templates:', error);
    }
  }
  
  // Fallback to templates
  const response = generateTemplateResponse(userMessage, context);
  return { response, usedFallback: true };
}
