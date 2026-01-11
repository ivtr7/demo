import { ChatMessage } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: ChatMessage;
  agentName: string;
  index: number;
}

export default function ChatBubble({ message, agentName, index }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'flex gap-3 animate-slide-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0 text-primary-foreground text-xs font-semibold">
          {agentName.charAt(0)}
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'gradient-primary text-primary-foreground rounded-br-md'
            : 'glass border border-border/50 rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-1',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {time}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-foreground text-xs font-semibold">
          Eu
        </div>
      )}
    </div>
  );
}
