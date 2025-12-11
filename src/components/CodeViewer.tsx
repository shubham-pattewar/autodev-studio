import { FileNode } from "@/types/agent";
import { cn } from "@/lib/utils";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface CodeViewerProps {
  file: FileNode | null;
  className?: string;
}

export function CodeViewer({ file, className }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (file?.content) {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (file?.content) {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getLanguage = (filename: string): string => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  if (!file) {
    return (
      <div className={cn("flex flex-col h-full bg-card rounded-lg border border-border", className)}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <p className="text-sm">Select a file to view its contents</p>
            <p className="text-xs mt-1 opacity-60">Generated code will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  const lines = file.content?.split('\n') || [];

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-foreground">{file.path}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {getLanguage(file.name)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto scrollbar-thin">
        <pre className="p-4 text-sm">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex">
                <span className="line-number">{index + 1}</span>
                <span className="flex-1 font-mono">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
