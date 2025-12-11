import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileNode } from "@/types/agent";

interface InteractiveTerminalProps {
  files: FileNode[];
  onServerStart: () => void;
  onServerStop: () => void;
  isServerRunning: boolean;
  className?: string;
}

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "system" | "success";
  content: string;
  cwd?: string;
}

export function InteractiveTerminal({ 
  files, 
  onServerStart, 
  onServerStop, 
  isServerRunning,
  className 
}: InteractiveTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: "init", type: "system", content: "AutoDev Terminal v1.0.0" },
    { id: "help", type: "system", content: "Type 'help' for available commands" }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [cwd, setCwd] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize CWD when files are loaded
  useEffect(() => {
    if (files.length > 0 && cwd.length === 0) {
      setCwd([files[0].name]);
    }
  }, [files]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Simulate server logs when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isServerRunning) {
      const logs = [
        "GET /api/todos 200 45ms",
        "POST /api/todos 201 120ms",
        "GET /api/todos/1 200 12ms",
        "Client connected: socket_id_123",
        "Database connection maintained...",
        "Watcher: file changed, rebuilding..."
      ];
      
      interval = setInterval(() => {
        if (Math.random() > 0.7) {
          const randomLog = logs[Math.floor(Math.random() * logs.length)];
          const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
          addLine("output", `[INFO] ${timestamp} - ${randomLog}`);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isServerRunning]);

  const addLine = (type: TerminalLine["type"], content: string) => {
    setLines(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, content, cwd: cwd.join("/") }]);
  };

  const findNode = (path: string[]): FileNode | undefined => {
    if (path.length === 0) return undefined;
    let current: FileNode | undefined = files.find(f => f.name === path[0]);
    
    for (let i = 1; i < path.length; i++) {
      if (!current || !current.children) return undefined;
      current = current.children.find(f => f.name === path[i]);
    }
    return current;
  };

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);
    addLine("input", trimmedCmd);

    const parts = trimmedCmd.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        addLine("system", "Available commands:");
        addLine("system", "  ls              List directory contents");
        addLine("system", "  cd <dir>        Change directory");
        addLine("system", "  cat <file>      View file contents");
        addLine("system", "  clear           Clear terminal");
        addLine("system", "  npm install     Install dependencies");
        addLine("system", "  npm run dev     Start development server");
        break;

      case "clear":
        setLines([]);
        break;

      case "ls": {
        const currentNode = findNode(cwd);
        if (currentNode && currentNode.children) {
          const fileList = currentNode.children.map(c => 
            c.type === "directory" ? `${c.name}/` : c.name
          ).join("  ");
          addLine("output", fileList);
        } else {
          addLine("error", "Current directory not found");
        }
        break;
      }

      case "cd": {
        if (!args[0]) break;
        if (args[0] === "..") {
          if (cwd.length > 1) {
            setCwd(prev => prev.slice(0, -1));
          }
        } else if (args[0] === ".") {
          // Do nothing
        } else if (args[0].startsWith("/")) {
           // Basic absolute path support relative to project root
           const parts = args[0].split("/").filter(Boolean);
           if (parts[0] === files[0]?.name) {
             const node = findNode(parts);
             if (node && node.type === "directory") {
               setCwd(parts);
             } else {
                addLine("error", `cd: ${args[0]}: No such directory`);
             }
           } else {
              addLine("error", `cd: ${args[0]}: No such directory`);
           }
        } else {
          const targetPath = [...cwd, args[0]];
          const node = findNode(targetPath);
          if (node && node.type === "directory") {
            setCwd(targetPath);
          } else {
            addLine("error", `cd: ${args[0]}: No such directory`);
          }
        }
        break;
      }

      case "cat": {
        if (!args[0]) {
          addLine("error", "cat: missing file operand");
          break;
        }
        const targetPath = [...cwd, args[0]];
        const node = findNode(targetPath);
        if (node && node.type === "file") {
          addLine("output", node.content || "");
        } else {
          addLine("error", `cat: ${args[0]}: No such file`);
        }
        break;
      }

      case "npm": {
        if (args[0] === "install" || args[0] === "i") {
          addLine("system", "Installing dependencies...");
          setTimeout(() => {
            addLine("success", "added 142 packages in 2s");
            addLine("success", "15 packages are looking for funding");
          }, 1500);
        } else if (args[0] === "run" && (args[1] === "dev" || args[1] === "start")) {
          addLine("system", "> project@1.0.0 dev");
          addLine("system", "> vite");
          setTimeout(() => {
            addLine("success", "  VITE v5.4.19  ready in 345 ms");
            addLine("success", "  ➜  Local:   http://localhost:3000/");
            addLine("success", "  ➜  Network: use --host to expose");
            onServerStart();
          }, 1000);
        } else {
          addLine("error", `npm: unknown command ${args[0]}`);
        }
        break;
      }

      default:
        addLine("error", `${command}: command not found`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentInput);
      setCurrentInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-terminal-bg border border-border rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium">Terminal</span>
        </div>
        <div className="flex gap-2">
           {isServerRunning ? (
             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/20 text-xs text-success font-medium animate-pulse">
               <span className="w-1.5 h-1.5 rounded-full bg-success"/> Running
             </span>
           ) : (
             <span className="text-xs text-muted-foreground">Stopped</span>
           )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div key={line.id} className="mb-1 break-words">
            {line.type === "input" && (
              <div className="flex gap-2 text-foreground">
                <span className="text-success font-bold">➜</span>
                <span className="text-blue-400 font-bold">{line.cwd ? line.cwd.split('/').pop() : '~'}</span>
                <span>{line.content}</span>
              </div>
            )}
            {line.type === "output" && <div className="text-foreground/80 whitespace-pre-wrap ml-4">{line.content}</div>}
            {line.type === "error" && <div className="text-destructive ml-4">{line.content}</div>}
            {line.type === "success" && <div className="text-success ml-4">{line.content}</div>}
            {line.type === "system" && <div className="text-muted-foreground ml-4 italic">{line.content}</div>}
          </div>
        ))}
        
        <div className="flex gap-2 items-center text-foreground mt-2">
          <span className="text-success font-bold">➜</span>
          <span className="text-blue-400 font-bold">{cwd.length > 0 ? cwd[cwd.length - 1] : '~'}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-foreground p-0 focus:ring-0"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
