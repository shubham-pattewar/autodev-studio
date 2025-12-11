import { useState } from "react";
import { Header } from "@/components/Header";
import { AgentGrid } from "@/components/AgentGrid";
import { TerminalLog } from "@/components/TerminalLog";
import { InteractiveTerminal } from "@/components/InteractiveTerminal";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeViewer } from "@/components/CodeViewer";
import { LivePreview } from "@/components/LivePreview";
import { JobForm } from "@/components/JobForm";
import { useAgentSimulation } from "@/hooks/useAgentSimulation";
import { FileNode } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderTree, RotateCcw, Download, Package, Code, Play, Terminal, Activity } from "lucide-react";

const Index = () => {
  const { logs, files, isRunning, activeAgent, agentStatuses, runSimulation, reset } = useAgentSimulation();
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [bottomTab, setBottomTab] = useState<string>("logs");
  const [isServerRunning, setIsServerRunning] = useState(false);

  const handleSubmit = (name: string, story: string) => {
    setSelectedFile(null);
    setActiveTab("preview");
    setIsServerRunning(false);
    runSimulation(name, story);
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      setSelectedFile(file);
      setActiveTab("code");
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    setIsServerRunning(false);
  };

  const handleServerStart = () => {
    setIsServerRunning(true);
  };

  const handleServerStop = () => {
    setIsServerRunning(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      <Header />

      <main className="flex-1 container py-6 h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
        {/* Agent Grid */}
        <section className="mb-4 animate-fade-in flex-shrink-0">
          <AgentGrid activeAgent={activeAgent} agentStatuses={agentStatuses} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left Panel */}
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 h-full">
            <div className="bg-card rounded-lg border border-border p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Project
                </h2>
                {(files.length > 0 || logs.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <JobForm onSubmit={handleSubmit} isRunning={isRunning} />
            </div>

            {files.length > 0 && (
              <div className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-warning" />
                    <span className="font-semibold text-sm">Explorer</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <FileExplorer
                    files={files}
                    onFileSelect={handleFileSelect}
                    selectedPath={selectedFile?.path}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center Panel */}
          <div className="lg:col-span-5 flex flex-col min-h-0 h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-2 flex-shrink-0">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Live Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code View
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 min-h-0 relative">
                <TabsContent value="preview" className="absolute inset-0 mt-0">
                  <LivePreview 
                    files={files} 
                    isAppRunning={isServerRunning}
                    className="h-full" 
                  />
                </TabsContent>
                <TabsContent value="code" className="absolute inset-0 mt-0">
                  <CodeViewer file={selectedFile} className="h-full" />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-4 flex flex-col min-h-0 h-full">
            <Tabs value={bottomTab} onValueChange={setBottomTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-2 flex-shrink-0">
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Agent Logs
                </TabsTrigger>
                <TabsTrigger value="terminal" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Terminal
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 min-h-0 relative">
                <TabsContent value="logs" className="absolute inset-0 mt-0">
                  <div className="bg-card rounded-lg border border-border overflow-hidden h-full">
                    <TerminalLog logs={logs} />
                  </div>
                </TabsContent>
                <TabsContent value="terminal" className="absolute inset-0 mt-0">
                  <InteractiveTerminal 
                    files={files}
                    onServerStart={handleServerStart}
                    onServerStop={handleServerStop}
                    isServerRunning={isServerRunning}
                    className="h-full" 
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
