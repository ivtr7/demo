import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PhoneMockupProps {
  className?: string;
}

const DEMO_MESSAGES: Message[] = [
  { id: '1', role: 'user', content: 'Olá, quero agendar' },
  { id: '2', role: 'assistant', content: 'Olá! 😊 Qual dia e horário?' },
  { id: '3', role: 'user', content: 'Amanhã às 14h' },
  { id: '4', role: 'assistant', content: '✅ Agendado! Amanhã, 14h. Envio lembrete!' },
  { id: '5', role: 'user', content: 'Obrigado!' },
  { id: '6', role: 'assistant', content: '😊 Por nada! Até amanhã!' },
];

type PhoneScreen = 'chat' | 'confirming' | 'agenda';

export default function PhoneMockup({ className }: PhoneMockupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const [screen, setScreen] = useState<PhoneScreen>('chat');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const agendaTransitionStartedRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-play demo messages
  useEffect(() => {
    if (currentDemoIndex < DEMO_MESSAGES.length) {
      const delay = currentDemoIndex === 0 ? 1000 : 2000;
      
      const timer = setTimeout(() => {
        const nextMessage = DEMO_MESSAGES[currentDemoIndex];
        
        if (nextMessage.role === 'assistant') {
          setIsTyping(true);
          setTimeout(() => {
            setMessages(prev => [...prev, nextMessage]);
            setIsTyping(false);
            setCurrentDemoIndex(prev => prev + 1);
          }, 1200);
        } else {
          setMessages(prev => [...prev, nextMessage]);

          if (nextMessage.id === '3') {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(14, 0, 0, 0);
            setScheduledAt(tomorrow);
          }

          setCurrentDemoIndex(prev => prev + 1);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentDemoIndex]);

  useEffect(() => {
    if (currentDemoIndex !== DEMO_MESSAGES.length) return;
    if (agendaTransitionStartedRef.current) return;
    agendaTransitionStartedRef.current = true;

    const t1 = window.setTimeout(() => setScreen('confirming'), 700);
    const t2 = window.setTimeout(() => setScreen('agenda'), 2000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [currentDemoIndex]);

  const handleSend = () => {
    if (!input.trim() || isTyping || screen !== 'chat') return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulated response
    setTimeout(() => {
      const response: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '✅ Anotado! Vou verificar a disponibilidade e confirmo em breve. Posso ajudar com mais alguma coisa?',
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const scheduleLabel = scheduledAt
    ? {
        primary: 'Amanhã, 14h',
        secondary: `${scheduledAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} • ${scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      }
    : { primary: 'Amanhã, 14h', secondary: '—' };

  return (
    <div className={cn("relative", className)}>
      {/* Phone Frame */}
      <div className="relative mx-auto w-[200px] sm:w-[240px] h-[400px] sm:h-[460px] bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl">
        {/* Inner Frame */}
        <div className="relative w-full h-full bg-background rounded-[1.5rem] overflow-hidden flex flex-col">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
          
          {/* Status Bar */}
          <div className="h-8 flex items-end justify-center pb-0.5">
            <span className="text-[10px] text-muted-foreground">9:41</span>
          </div>
          
          {screen === 'agenda' ? (
            <div className="px-2 py-1.5 border-b bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground text-[10px] font-bold">AI</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xs">Agenda</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-muted-foreground">Confirmado</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-2 py-1.5 border-b bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground text-[10px] font-bold">AI</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xs">Assistente IA</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {screen === 'agenda' ? (
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2 animate-fade-in">
                <div className="rounded-xl border bg-card/60 backdrop-blur p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold">Atendimento marcado</div>
                      <div className="text-[10px] text-muted-foreground">{scheduleLabel.secondary}</div>
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400">
                      ✓
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] rounded-lg bg-muted/70 p-2">
                    {scheduleLabel.primary}
                  </div>
                </div>

                <div className="rounded-xl border bg-card/60 backdrop-blur p-2">
                  <div className="text-[11px] font-semibold">Próximos passos</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Lembrete e confirmação enviados automaticamente.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[85%] px-2 py-1.5 rounded-xl text-[11px] animate-fade-in",
                    msg.role === 'user'
                      ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              
              {isTyping && (
                <div className="max-w-[85%] px-2 py-1.5 rounded-xl rounded-bl-sm bg-muted">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Input */}
          {screen === 'chat' && (
            <div className="p-2 border-t bg-card/50 backdrop-blur">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-1.5"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Mensagem..."
                  className="text-[11px] h-7 rounded-full bg-muted border-0 px-2.5"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 h-7 w-7 rounded-full gradient-primary"
                  disabled={!input.trim() || isTyping}
                >
                  {isTyping ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </form>
            </div>
          )}

          {screen === 'confirming' && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="rounded-2xl border bg-card/90 shadow-lg px-3 py-2 flex items-center gap-2 animate-fade-in">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="text-[11px] font-medium">
                  Marcando na agenda…
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating badges */}
      <div className="absolute -top-2 -right-2 sm:-right-4 bg-card border shadow-lg rounded-full px-2 py-1 flex items-center gap-1 animate-float">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-[10px] font-medium">24h</span>
      </div>
      
      <div className="absolute -bottom-2 -left-2 sm:-left-4 bg-card border shadow-lg rounded-full px-2 py-1 flex items-center gap-1 animate-float" style={{ animationDelay: '1s' }}>
        <span className="text-[10px]">🤖</span>
        <span className="text-[10px] font-medium">IA</span>
      </div>
    </div>
  );
}
