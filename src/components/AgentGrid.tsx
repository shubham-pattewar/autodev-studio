import { AGENTS, Agent, AgentType } from "@/types/agent";
import { AgentCard } from "./AgentCard";

interface AgentGridProps {
  activeAgent?: AgentType;
  agentStatuses: Record<AgentType, Agent['status']>;
}

export function AgentGrid({ activeAgent, agentStatuses }: AgentGridProps) {
  const agents = Object.values(AGENTS).map(agent => ({
    ...agent,
    status: agentStatuses[agent.id] || 'idle',
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isActive={activeAgent === agent.id}
        />
      ))}
    </div>
  );
}
