import { useEffect, useRef } from "react";
import { LogEntry, AGENT_COLORS, AgentType } from "@/types/agent";
import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";

interface TerminalLogProps {
  logs: LogEntry[];
  className?: string;
}

export function TerminalLog({ logs, className }: TerminalLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Terminal className="h-4 w-4 text-primary" />
        <span className="font-mono text-sm font-medium">Agent Logs</span>
        <div className="flex gap-1.5 ml-auto">
          <div className="h-3 w-3 rounded-full bg-destructive/60" />
          <div className="h-3 w-3 rounded-full bg-warning/60" />
          <div className="h-3 w-3 rounded-full bg-success/60" />
        </div>
      </div>
      
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto bg-terminal-bg p-4 font-mono text-sm scrollbar-thin"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground flex items-center gap-2">
            <span className="text-primary">$</span>
            <span className="animate-typing">Waiting for input...</span>
            <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 animate-slide-in">
                <span className="text-muted-foreground flex-shrink-0">
                  [{formatTime(log.timestamp)}]
                </span>
                <span
                  className={cn(
                    "flex-shrink-0",
                    AGENT_COLORS[log.agent as AgentType]
                  )}
                >
                  [{log.agent}]
                </span>
                <span
                  className={cn(
                    log.type === "success" && "text-success",
                    log.type === "error" && "text-destructive",
                    log.type === "warning" && "text-warning",
                    log.type === "info" && "text-foreground"
                  )}
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
