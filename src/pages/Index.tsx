import { useState, useEffect } from "react";
import { WebContainer } from "@webcontainer/api";
import { Header } from "@/components/Header";
import { AgentGrid } from "@/components/AgentGrid";
import { TerminalLog } from "@/components/TerminalLog";
import { RealTerminal } from "@/components/RealTerminal";
import { FileExplorer } from "@/components/FileExplorer";
import { CodeViewer } from "@/components/CodeViewer";
import { LivePreview } from "@/components/LivePreview";
import { JobForm } from "@/components/JobForm";
import { useAgentSimulation } from "@/hooks/useAgentSimulation";
import { FileNode } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderTree, RotateCcw, Download, Package, Code, Play, Terminal, Activity, Loader2 } from "lucide-react";
import { convertFilesToWebContainer } from "@/lib/fileSystem";
import { toast } from "sonner";

const Index = () => {
  const { logs, files, isRunning, activeAgent, agentStatuses, runSimulation, reset } = useAgentSimulation();
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [bottomTab, setBottomTab] = useState<string>("logs");
  
  // WebContainer State
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(false);

  // 1. Boot WebContainer on mount
  useEffect(() => {
    async function boot() {
      if (webcontainer) return;
      setIsBooting(true);
      try {
        const instance = await WebContainer.boot();
        setWebcontainer(instance);
        
        instance.on('server-ready', (port, url) => {
          setPreviewUrl(url);
          toast.success(`Server running on port ${port}`);
        });
        
      } catch (error) {
        console.error("Failed to boot WebContainer:", error);
        toast.error("Failed to start development environment. Check console.");
      } finally {
        setIsBooting(false);
      }
    }
    boot();
  }, []);

  // 2. Sync Files to WebContainer when generation finishes
  useEffect(() => {
    if (webcontainer && files.length > 0 && !isRunning && agentStatuses.reviewer === 'completed') {
      const syncFiles = async () => {
        try {
          const fileTree = convertFilesToWebContainer(files);
          // Assuming the first folder is the project root (e.g., "my-project")
          const rootDir = files[0].name;
          
          await webcontainer.mount(fileTree);
          
          toast.success("Files mounted to virtual container");
          setBottomTab("terminal");
          
          // Optional: Auto-install dependencies
          // This simulates "auto-run" behavior
          const terminal = document.querySelector('.xterm-helper-textarea');
          if (terminal) {
             // We can programmatically write to terminal or just notify user
             toast.info("Tip: Run 'cd " + rootDir + " && npm install && npm run dev'");
          }
        } catch (error) {
          console.error("File sync error:", error);
          toast.error("Failed to write files to container");
        }
      };
      syncFiles();
    }
  }, [webcontainer, files, isRunning, agentStatuses]);

  const handleSubmit = (name: string, story: string) => {
    setSelectedFile(null);
    setActiveTab("preview");
    setPreviewUrl(null);
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
    setPreviewUrl(null);
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
                  <LivePreview url={previewUrl} className="h-full" />
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
                  {isBooting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Terminal className="h-4 w-4" />}
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
                  <RealTerminal webcontainer={webcontainer} className="h-full" />
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
