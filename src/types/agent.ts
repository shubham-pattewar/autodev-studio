export type AgentType = 
  | 'parser' 
  | 'refiner' 
  | 'codegen' 
  | 'file' 
  | 'test' 
  | 'reviewer';

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  agent: AgentType;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

export interface Job {
  id: string;
  name: string;
  story: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  files: FileNode[];
  logs: LogEntry[];
}

export const AGENTS: Record<AgentType, Agent> = {
  parser: {
    id: 'parser',
    name: 'StoryParserAgent',
    description: 'Parses user stories into structured requirements',
    status: 'idle',
  },
  refiner: {
    id: 'refiner',
    name: 'PromptRefinerAgent',
    description: 'Refines prompts for optimal code generation',
    status: 'idle',
  },
  codegen: {
    id: 'codegen',
    name: 'CodeGenAgent',
    description: 'Generates production-ready code',
    status: 'idle',
  },
  file: {
    id: 'file',
    name: 'FileManagerAgent',
    description: 'Manages file system operations',
    status: 'idle',
  },
  test: {
    id: 'test',
    name: 'TestRunnerAgent',
    description: 'Runs tests and validates code',
    status: 'idle',
  },
  reviewer: {
    id: 'reviewer',
    name: 'CodeReviewerAgent',
    description: 'Reviews code quality and best practices',
    status: 'idle',
  },
};

export const AGENT_COLORS: Record<AgentType, string> = {
  parser: 'text-agent-parser',
  refiner: 'text-agent-refiner',
  codegen: 'text-agent-codegen',
  file: 'text-agent-file',
  test: 'text-agent-test',
  reviewer: 'text-agent-reviewer',
};

export const AGENT_BG_COLORS: Record<AgentType, string> = {
  parser: 'bg-agent-parser/20',
  refiner: 'bg-agent-refiner/20',
  codegen: 'bg-agent-codegen/20',
  file: 'bg-agent-file/20',
  test: 'bg-agent-test/20',
  reviewer: 'bg-agent-reviewer/20',
};
