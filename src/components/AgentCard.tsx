import { Agent, AGENT_COLORS, AGENT_BG_COLORS, AgentType } from "@/types/agent";
import { cn } from "@/lib/utils";
import { Bot, CheckCircle2, Loader2, AlertCircle, Circle } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
}

const statusIcons = {
  idle: Circle,
  running: Loader2,
  completed: CheckCircle2,
  error: AlertCircle,
};

export function AgentCard({ agent, isActive }: AgentCardProps) {
  const StatusIcon = statusIcons[agent.status];
  const colorClass = AGENT_COLORS[agent.id as AgentType];
  const bgClass = AGENT_BG_COLORS[agent.id as AgentType];

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-card p-4 transition-all duration-300",
        isActive && "border-primary/50 shadow-lg shadow-primary/10",
        agent.status === "running" && "animate-pulse-glow"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
            bgClass
          )}
        >
          <Bot className={cn("h-5 w-5", colorClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-mono text-sm font-semibold truncate", colorClass)}>
              {agent.name}
            </h3>
            <StatusIcon
              className={cn(
                "h-4 w-4 flex-shrink-0",
                agent.status === "running" && "animate-spin text-primary",
                agent.status === "completed" && "text-success",
                agent.status === "error" && "text-destructive",
                agent.status === "idle" && "text-muted-foreground"
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {agent.description}
          </p>
        </div>
      </div>
      
      {agent.status === "running" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted overflow-hidden rounded-b-lg">
          <div className="h-full bg-gradient-to-r from-primary to-primary-glow animate-shimmer bg-[length:200%_100%]" />
        </div>
      )}
    </div>
  );
}
