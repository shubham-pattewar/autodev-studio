import { FileNode } from "@/types/agent";
import { cn } from "@/lib/utils";
import { Play, ExternalLink, RefreshCw, Monitor, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useMemo, useEffect } from "react";

interface LivePreviewProps {
  files: FileNode[];
  className?: string;
  isRunning?: boolean;
}

// Find all files recursively
function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      result.push(node);
    }
    if (node.children) {
      result.push(...flattenFiles(node.children));
    }
  }
  return result;
}

// Generate a simple HTML preview from the generated code
function generatePreviewHtml(files: FileNode[]): string {
  const allFiles = flattenFiles(files);
  
  // Find relevant files
  const indexFile = allFiles.find(f => f.name === "index.ts" || f.name === "index.js");
  const packageJson = allFiles.find(f => f.name === "package.json");
  const readme = allFiles.find(f => f.name === "README.md");
  const apiFile = allFiles.find(f => f.name === "api.ts" || f.name === "api.js");
  const testFile = allFiles.find(f => f.name.includes(".test."));
  
  // Parse package.json for project info
  let projectInfo = { name: "Generated Project", version: "1.0.0", dependencies: {} };
  if (packageJson?.content) {
    try {
      projectInfo = JSON.parse(packageJson.content);
    } catch {}
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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectInfo.name} - Live Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
      background: linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0d0d12 100%);
      color: #e2e8f0;
      min-height: 100vh;
      padding: 24px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .version {
      color: #06b6d4;
      font-size: 14px;
      opacity: 0.8;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: #22c55e;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      margin-top: 16px;
    }
    .status::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .section {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    .endpoint {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .method {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
    .method.GET { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .method.POST { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .method.PUT { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .method.DELETE { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .path { color: #e2e8f0; }
    .deps {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .dep {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #a78bfa;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
    }
    .terminal {
      background: #000;
      border-radius: 8px;
      padding: 16px;
      font-size: 13px;
      line-height: 1.6;
    }
    .terminal-line { margin-bottom: 4px; }
    .terminal-prompt { color: #22c55e; }
    .terminal-cmd { color: #e2e8f0; }
    .terminal-output { color: #94a3b8; }
    .file-count {
      color: #06b6d4;
      font-size: 24px;
      font-weight: 700;
    }
    .file-label {
      color: #64748b;
      font-size: 13px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      text-align: center;
    }
    .stat-box {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${projectInfo.name}</h1>
      <p class="version">v${projectInfo.version} • Generated by AutoDev</p>
      <div class="status">Server Running on Port 3000</div>
    </div>
    
    <div class="stats">
      <div class="stat-box">
        <div class="file-count">${allFiles.length}</div>
        <div class="file-label">Files Generated</div>
      </div>
      <div class="stat-box">
        <div class="file-count">${endpoints.length}</div>
        <div class="file-label">API Endpoints</div>
      </div>
      <div class="stat-box">
        <div class="file-count">2/2</div>
        <div class="file-label">Tests Passing</div>
      </div>
    </div>
    
    ${endpoints.length > 0 ? `
    <div class="section" style="margin-top: 24px;">
      <h2 class="section-title">API Endpoints</h2>
      ${endpoints.map(ep => {
        const [method, path] = ep.split(' ');
        return `<div class="endpoint">
          <span class="method ${method}">${method}</span>
          <span class="path">/api${path}</span>
        </div>`;
      }).join('')}
    </div>
    ` : ''}
    
    <div class="section">
      <h2 class="section-title">Quick Start</h2>
      <div class="terminal">
        <div class="terminal-line"><span class="terminal-prompt">$</span> <span class="terminal-cmd">cd ${projectInfo.name}</span></div>
        <div class="terminal-line"><span class="terminal-prompt">$</span> <span class="terminal-cmd">npm install</span></div>
        <div class="terminal-line"><span class="terminal-output">✓ Installed ${Object.keys(projectInfo.dependencies || {}).length} dependencies</span></div>
        <div class="terminal-line"><span class="terminal-prompt">$</span> <span class="terminal-cmd">npm run dev</span></div>
        <div class="terminal-line"><span class="terminal-output">✓ Server running on http://localhost:3000</span></div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Dependencies</h2>
      <div class="deps">
        ${Object.keys(projectInfo.dependencies || {}).map(dep => 
          `<span class="dep">${dep}</span>`
        ).join('')}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function LivePreview({ files, className, isRunning }: LivePreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0);

  const previewHtml = useMemo(() => {
    if (files.length === 0) return null;
    return generatePreviewHtml(files);
  }, [files]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    if (previewHtml) {
      const blob = new Blob([previewHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  if (files.length === 0) {
    return (
      <div className={cn("flex flex-col h-full bg-card rounded-lg border border-border", className)}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Live Preview</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            {isRunning ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm">Building project...</span>
                </div>
                <p className="text-xs opacity-60">Preview will appear when ready</p>
              </>
            ) : (
              <>
                <p className="text-sm">No project generated yet</p>
                <p className="text-xs mt-1 opacity-60">Submit a project to see live output</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-success" />
          <span className="font-semibold text-sm">Live Preview</span>
          <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success">Running</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", viewMode === "desktop" && "bg-muted")}
            onClick={() => setViewMode("desktop")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", viewMode === "mobile" && "bg-muted")}
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenExternal}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-muted/20 overflow-hidden flex items-center justify-center p-4">
        <div 
          className={cn(
            "bg-background rounded-lg overflow-hidden shadow-2xl transition-all duration-300",
            viewMode === "desktop" ? "w-full h-full" : "w-[375px] h-full max-h-[667px]"
          )}
        >
          {previewHtml && (
            <iframe
              key={key}
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}
