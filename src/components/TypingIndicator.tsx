interface TypingIndicatorProps {
  agentName: string;
}

export default function TypingIndicator({ agentName }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0 text-primary-foreground text-xs font-semibold">
        {agentName.charAt(0)}
      </div>

      <div className="glass border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
