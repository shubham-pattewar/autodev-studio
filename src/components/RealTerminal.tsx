import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { WebContainer } from "@webcontainer/api";
import { cn } from "@/lib/utils";

interface RealTerminalProps {
  webcontainer: WebContainer | null;
  className?: string;
}

export function RealTerminal({ webcontainer, className }: RealTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      theme: {
        background: '#0d0d12', // Matches your --terminal-bg
        foreground: '#e2e8f0',
      },
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    // Handle resizing
    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  // Initialize shell
  useEffect(() => {
    if (!webcontainer || !xtermRef.current) return;

    const startShell = async () => {
      const terminal = xtermRef.current!;
      
      const shellProcess = await webcontainer.spawn('jsh', {
        terminal: {
          cols: terminal.cols,
          rows: terminal.rows,
        },
      });

      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          },
        })
      );

      const input = terminal.onData((data) => {
        shellProcess.input.write(data);
      });

      return () => {
        input.dispose();
        shellProcess.kill();
      };
    };

    startShell();
  }, [webcontainer]);

  return (
    <div className={cn("h-full w-full bg-terminal-bg rounded-lg overflow-hidden border border-border", className)}>
      <div ref={terminalRef} className="h-full w-full p-2" />
    </div>
  );
}
