import { cn } from "@/lib/utils";
import { Globe, Loader2, RefreshCw, ExternalLink, Power } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface LivePreviewProps {
  /**
   * The URL of the running server inside the WebContainer.
   * If null, it indicates the server hasn't started yet.
   */
  url: string | null;
  className?: string;
}

export function LivePreview({ url, className }: LivePreviewProps) {
  // Used to force iframe refresh by changing the key
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden", className)}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {url ? (
            <>
              <Globe className="h-4 w-4 text-success" />
              <span className="font-semibold text-sm">Live Preview</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/15 text-[10px] font-medium text-success border border-success/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                </span>
                Online
              </span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm text-muted-foreground">Live Preview</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                Offline
              </span>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {url && (
            <div className="hidden sm:flex items-center px-2 py-1 bg-background/50 border border-border rounded text-[10px] text-muted-foreground font-mono mr-2 max-w-[150px] truncate">
              {url}
            </div>
          )}
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 hover:bg-muted" 
            onClick={handleRefresh}
            disabled={!url}
            title="Refresh Preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 hover:bg-muted" 
            asChild
            disabled={!url}
            title="Open in New Tab"
          >
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <button disabled>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </Button>
        </div>
      </div>
      
      {/* Preview Area */}
      <div className="flex-1 bg-muted/10 overflow-hidden relative">
        {url ? (
          <iframe
            key={key}
            src={url}
            className="w-full h-full border-0 bg-white"
            title="Application Live Preview"
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write;"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-6 ring-1 ring-border">
              <Power className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Development Server Stopped</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The application is not currently running. Use the terminal to install dependencies and start the server.
            </p>
            
            <div className="mt-8 flex flex-col gap-2 w-full max-w-[280px]">
              <div className="flex items-center gap-3 p-3 rounded-md bg-card border border-border/50 shadow-sm text-xs font-mono text-muted-foreground">
                <span className="text-primary select-none">$</span>
                <span className="flex-1">npm install</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md bg-card border border-border/50 shadow-sm text-xs font-mono text-muted-foreground">
                <span className="text-primary select-none">$</span>
                <span className="flex-1">npm run dev</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/60">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Waiting for server on port 3000...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
