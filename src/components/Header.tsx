import { Bot, Github, Zap } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center glow-effect">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gradient">AutoDev</span>
            </h1>
            <p className="text-xs text-muted-foreground">Multi-Agent Development Platform</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Zap className="h-4 w-4 text-warning" />
            <span className="hidden sm:inline">6 Agents Active</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
