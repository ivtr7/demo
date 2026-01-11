import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { generateAgentReply } from '@/services/llm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Settings, Send, Download, AlertCircle, Sparkles } from 'lucide-react';
import { ICON_MAP } from '@/data/niches';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  onBack: () => void;
  onOpenSettings: () => void;
}

export default function ChatInterface({ onBack, onOpenSettings }: ChatInterfaceProps) {
  const {
    currentNiche,
    chatState,
    setChatState,
    addMessage,
    globalConfig,
  } = useApp();

  const [input, setInput] = useState('');
  const [aiSource, setAiSource] = useState<'ai' | 'error' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use ref to always have the latest chatState in async callbacks
  const chatStateRef = useRef(chatState);
  useEffect(() => {
    chatStateRef.current = chatState;
  }, [chatState]);

  const Icon = currentNiche ? ICON_MAP[currentNiche.icon] : null;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatState.messages, chatState.isTyping]);

  const greetingSent = useRef(false);

  useEffect(() => {
    greetingSent.current = false;
  }, [currentNiche?.id]);

  useEffect(() => {
    if (!currentNiche) return;
    if (chatState.messages.length !== 0) return;
    if (greetingSent.current) return;

    greetingSent.current = true;
    setChatState(prev => ({ ...prev, isTyping: true }));

    const typingDelay = 800 + Math.random() * 500;
    let cancelled = false;

    setTimeout(() => {
      if (cancelled) return;

      const greeting = `Olá! Eu sou ${currentNiche.agentName}. Qual é o seu nome?`;
      addMessage({ role: 'assistant', content: greeting });
      setAiSource(null);
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        onboarding: { ...prev.onboarding, step: 'collect_name' },
      }));
    }, typingDelay);

    return () => {
      cancelled = true;
    };
  }, [currentNiche?.id, chatState.messages.length]);

  const isNameSkipMessage = (message: string): boolean => {
    const text = message.trim().toLowerCase();
    if (!text) return true;
    const patterns = [
      /^pular$/i,
      /^prefiro não$/i,
      /^prefiro nao$/i,
      /não\s+quero\s+informar/i,
      /nao\s+quero\s+informar/i,
      /não\s+vou\s+informar/i,
      /nao\s+vou\s+informar/i,
      /sem\s+nome/i,
      /an[oô]nimo/i,
    ];
    return patterns.some(p => p.test(text));
  };

  const normalizePhone = (message: string): string => {
    const digits = message.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length < 8) return '';
    if (digits.length > 13) return digits.slice(0, 13);
    return digits;
  };

  const handleSend = async () => {
    if (!input.trim() || !currentNiche || chatState.isTyping) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setChatState(prev => ({ ...prev, isTyping: true }));

    // Delay for typing effect
    const typingDelay = 900 + Math.random() * 500;

    setTimeout(async () => {
      // Get the LATEST state via ref
      const currentState = chatStateRef.current;
      const { messages, onboarding } = currentState;
      
      let response = '';
      let source: 'ai' | 'error' | null = null;

      if (onboarding.step !== 'complete') {
        if (onboarding.step === 'collect_name') {
          if (isNameSkipMessage(userMessage)) {
            setChatState(prev => ({
              ...prev,
              onboarding: { ...prev.onboarding, userName: '', step: 'complete' },
            }));
            response = 'Sem problemas. Como posso te ajudar hoje?';
          } else {
            const userName = userMessage;
            setChatState(prev => ({
              ...prev,
              onboarding: { ...prev.onboarding, userName, step: 'collect_phone' },
            }));
            response = `Perfeito, ${userName}! Se quiser, pode me passar um telefone para confirmação (opcional). Se preferir, diga "pular".`;
          }

          addMessage({ role: 'assistant', content: response });
          setChatState(prev => ({ ...prev, isTyping: false }));
          return;
        }

        if (onboarding.step === 'collect_phone') {
          if (isNameSkipMessage(userMessage)) {
            setChatState(prev => ({
              ...prev,
              onboarding: { ...prev.onboarding, phone: '', step: 'complete' },
            }));
            response = 'Beleza! Como posso te ajudar hoje?';
          } else {
            const phone = normalizePhone(userMessage);
            setChatState(prev => ({
              ...prev,
              onboarding: { ...prev.onboarding, phone, step: 'complete' },
            }));
            response = phone
              ? 'Perfeito! Como posso te ajudar hoje?'
              : 'Sem problemas. Se quiser depois, me mande seu telefone (opcional). Como posso te ajudar hoje?';
          }

          addMessage({ role: 'assistant', content: response });
          setChatState(prev => ({ ...prev, isTyping: false }));
          return;
        }
      }

      try {
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        const historyWithoutCurrentUserMessage =
          history.length > 0 && history[history.length - 1]?.role === 'user' && history[history.length - 1]?.content === userMessage
            ? history.slice(0, -1)
            : history;

        const result = await generateAgentReply(userMessage, historyWithoutCurrentUserMessage, {
          userName: onboarding.userName,
          businessName: '',
          extraValue: '',
          phone: onboarding.phone,
          niche: currentNiche,
        });

        response = result.response;
        source = result.source;
        setAiSource(source);

        if (source === 'error') {
          toast.error('Erro ao processar mensagem');
        }
      } catch (error) {
        console.error('AI error:', error);
        response = 'Desculpe, estou com dificuldades técnicas. Tente novamente.';
        source = 'error';
        setAiSource(source);
      }

      addMessage({ role: 'assistant', content: response });
      setChatState(prev => ({ ...prev, isTyping: false }));
    }, typingDelay);
  };

  const handleQuickReply = (message: string) => {
    setInput(message);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleExport = () => {
    const { onboarding, messages } = chatState;
    let content = `=== Exportação de Conversa ===\n`;
    content += `Nicho: ${currentNiche?.name}\n`;
    content += `Agente: ${currentNiche?.agentName}\n`;
    content += `\n=== Dados Coletados ===\n`;
    content += `Nome: ${onboarding.userName}\n`;
    content += `Telefone: ${onboarding.phone}\n`;
    content += `\n=== Histórico ===\n\n`;
    
    messages.forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR');
      const role = msg.role === 'user' ? 'Você' : currentNiche?.agentName;
      content += `[${time}] ${role}:\n${msg.content}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversa-${currentNiche?.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentNiche) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in">
      {/* Chat Header */}
      <div className="glass-strong border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {Icon && (
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{currentNiche.agentName}</h2>
                <Badge variant="outline" className="text-xs">Demo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentNiche.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleExport}>
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onOpenSettings}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {chatState.messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              agentName={currentNiche.agentName}
              index={index}
            />
          ))}
          
          {chatState.isTyping && <TypingIndicator agentName={currentNiche.agentName} />}
        </div>
      </ScrollArea>

      {/* Quick Replies */}
      {!chatState.isTyping && (
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {currentNiche.quickReplies.map(qr => (
                  <Button
                    key={qr.id}
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-full"
                    onClick={() => handleQuickReply(qr.message)}
                  >
                    {qr.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="glass-strong border-t p-4">
        <div className="max-w-3xl mx-auto space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="bg-secondary/50"
              disabled={chatState.isTyping}
            />
            <Button 
              type="submit" 
              className="gradient-primary shrink-0"
              disabled={!input.trim() || chatState.isTyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>{globalConfig.demoWarning}</span>
            </div>
            {aiSource && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                {aiSource === 'ai' ? (
                  <>
                    <Sparkles className="h-3 w-3" />
                    IA
                  </>
                ) : 'Erro'}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
