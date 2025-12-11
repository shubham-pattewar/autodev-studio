import { FileNode } from "@/types/agent";
import { cn } from "@/lib/utils";
import {
  Globe,
  Loader2,
  RefreshCw,
  ExternalLink,
  Monitor,
  Smartphone,
  Power,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState, useMemo } from "react";

interface LivePreviewProps {
  files?: FileNode[];            // optional, defaulted in component
  url?: string | null;           // optional
  className?: string;
  isRunning?: boolean;           // Agent generation running status
  isAppRunning?: boolean;        // Compiled app running status
}

// Find all files recursively
function flattenFiles(nodes: FileNode[] = []): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") result.push(node);
    if (node.children) result.push(...flattenFiles(node.children));
  }
  return result;
}

// Generate a simple HTML preview from the generated code
function generatePreviewHtml(files: FileNode[]): string {
  const allFiles = flattenFiles(files);

  // Find relevant files
  const packageJson = allFiles.find((f) => f.name === "package.json");
  const apiFile = allFiles.find((f) => f.name === "api.ts" || f.name === "api.js");

  // Parse package.json for project info
  let projectInfo: any = { name: "Generated Project", version: "1.0.0", dependencies: {} };
  if (packageJson?.content) {
    try {
      projectInfo = JSON.parse(packageJson.content);
    } catch {
      /* ignore parse errors */
    }
  }

  // Extract endpoints from api file
  const endpoints: string[] = [];
  if (apiFile?.content) {
    const routeMatches = apiFile.content.matchAll(/router\.(get|post|put|delete)\(['"]([^'"]+)['"]/g);
    for (const match of routeMatches) {
      endpoints.push(`${match[1].toUpperCase()} ${match[2]}`);
    }
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${projectInfo.name} - Live Preview</title>
<style>
  /* minimal styling */
  body { font-family: monospace; background:#0f1724; color:#e2e8f0; padding:24px; }
  .section { margin-bottom:16px; }
</style>
</head>
<body>
  <h1>${projectInfo.name}</h1>
  <p>v${projectInfo.version}</p>
  <div class="section">
    <h2>Files</h2>
    <p>${allFiles.length} files</p>
  </div>
  <div class="section">
    <h2>API Endpoints</h2>
    <ul>
      ${endpoints.map(e => `<li>${e}</li>`).join("")}
    </ul>
  </div>
  <div class="section">
    <h2>Dependencies</h2>
    <ul>
      ${Object.keys(projectInfo.dependencies || {}).map(d => `<li>${d}</li>`).join("")}
    </ul>
  </div>
</body>
</html>
  `;
}

export function LivePreview({
  files = [],
  url = null,
  className,
  isRunning,
  isAppRunning,
}: LivePreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0);

  const previewHtml = useMemo(() => {
    if (!files?.length) return null;
    return generatePreviewHtml(files);
  }, [files]);

  const handleRefresh = () => setKey((p) => p + 1);

  const handleOpenExternal = () => {
    // If file preview exists, open blob preview; otherwise open url if present
    if (previewHtml) {
      const blob = new Blob([previewHtml], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob); // renamed to blobUrl to avoid shadowing
      window.open(blobUrl, "_blank");
      return;
    }
    if (url) {
      window.open(url, "_blank", "noopener");
    }
  };

  // If neither url nor files -> waiting UI
  if (!url && (!files || files.length === 0)) {
    return (
      <div className={cn("flex flex-col h-full bg-card rounded-lg border border-border", className)}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm text-muted-foreground">Live Preview</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p className="text-sm">Waiting for server to start...</p>
          <p className="text-xs mt-2 opacity-60">Run 'npm run dev' in the terminal</p>
        </div>
      </div>
    );
  }

  // If a URL is present and no files, render URL iframe
  if (url && (!files || files.length === 0)) {
    return (
      <div className={cn("flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden", className)}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-success" />
            <span className="font-semibold text-sm">Live Preview</span>
            <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Online
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="bg-background/50 px-3 py-1 rounded text-xs text-muted-foreground font-mono truncate max-w-[200px]">
              {url}
            </div>
            <div className="w-px h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(url!, "_blank", "noopener")}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <iframe key={key} src={url!} className="w-full h-full border-0 bg-white" title="Live Preview" />
      </div>
    );
  }

  // Otherwise render file-based preview (srcDoc)
  return (
    <div className={cn("flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {isAppRunning ? (
            <>
              <Globe className="h-4 w-4 text-success" />
              <span className="font-semibold text-sm">Live Preview</span>
              <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Online
              </span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm text-muted-foreground">Live Preview</span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Offline</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", viewMode === "desktop" && "bg-muted")} onClick={() => setViewMode("desktop")}>
            <Monitor className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", viewMode === "mobile" && "bg-muted")} onClick={() => setViewMode("mobile")}>
            <Smartphone className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={!isAppRunning}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenExternal} disabled={!isAppRunning && !previewHtml}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-muted/20 overflow-hidden flex items-center justify-center p-4 relative">
        {!isAppRunning && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Power className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Application Stopped</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              The development server is not running. Use the terminal to start the application.
            </p>
            <div className="bg-black/50 rounded px-3 py-1.5 font-mono text-xs text-primary border border-primary/20">
              npm run dev
            </div>
          </div>
        )}

        <div className={cn("bg-background rounded-lg overflow-hidden shadow-2xl transition-all duration-300", viewMode === "desktop" ? "w-full h-full" : "w-[375px] h-full max-h-[667px]")}>
          {previewHtml && isAppRunning ? (
            <iframe key={key} srcDoc={previewHtml} className="w-full h-full border-0" title="Live Preview" sandbox="allow-scripts" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card">
              <div className="text-center text-muted-foreground opacity-20">
                <Monitor className="h-16 w-16 mx-auto mb-2" />
                <span className="font-mono text-sm">Waiting for server...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
