import { useState } from "react";
import { Header } from "@/components/Header";
import { AgentGrid } from "@/components/AgentGrid";
import { TerminalLog } from "@/components/TerminalLog";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeViewer } from "@/components/CodeViewer";
import { JobForm } from "@/components/JobForm";
import { useAgentSimulation } from "@/hooks/useAgentSimulation";
import { FileNode } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { FolderTree, RotateCcw, Download, Package } from "lucide-react";

const Index = () => {
  const { logs, files, isRunning, activeAgent, agentStatuses, runSimulation, reset } =
    useAgentSimulation();
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const handleSubmit = (name: string, story: string) => {
    setSelectedFile(null);
    runSimulation(name, story);
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      setSelectedFile(file);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      <Header />

      <main className="flex-1 container py-6">
        {/* Agent Grid */}
        <section className="mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Agent Status
          </h2>
          <AgentGrid activeAgent={activeAgent} agentStatuses={agentStatuses} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Job Form */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">New Project</h2>
                {(files.length > 0 || logs.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <JobForm onSubmit={handleSubmit} isRunning={isRunning} />
            </div>

            {/* File Explorer */}
            {files.length > 0 && (
              <div className="mt-4 bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-warning" />
                    <span className="font-semibold text-sm">Files</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-64 overflow-auto">
                  <FileExplorer
                    files={files}
                    onFileSelect={handleFileSelect}
                    selectedPath={selectedFile?.path}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center Panel - Code Viewer */}
          <div className="lg:col-span-5">
            <CodeViewer file={selectedFile} className="h-[500px]" />
          </div>

          {/* Right Panel - Terminal Logs */}
          <div className="lg:col-span-4">
            <div className="bg-card rounded-lg border border-border overflow-hidden h-[500px]">
              <TerminalLog logs={logs} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            AutoDev Multi-Agent Platform • Powered by{" "}
            <span className="text-primary">Gemini AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
