import { useState } from "react";
import { FileNode } from "@/types/agent";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedPath?: string;
}

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  onFileSelect: (file: FileNode) => void;
  selectedPath?: string;
}

function FileTreeItem({ node, depth, onFileSelect, selectedPath }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === "directory";

  const getFileIcon = (name: string) => {
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return '📘';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return '📒';
    if (name.endsWith('.json')) return '📋';
    if (name.endsWith('.md')) return '📝';
    if (name.endsWith('.css')) return '🎨';
    if (name.endsWith('.html')) return '🌐';
    if (name === 'package.json') return '📦';
    if (name === '.env' || name === '.env.example') return '🔐';
    return null;
  };

  const fileEmoji = getFileIcon(node.name);

  return (
    <div>
      <button
        onClick={() => {
          if (isDirectory) {
            setIsOpen(!isOpen);
          } else {
            onFileSelect(node);
          }
        }}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1 text-sm rounded hover:bg-muted/50 transition-colors text-left",
          isSelected && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 text-warning flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-warning flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            {fileEmoji ? (
              <span className="text-sm flex-shrink-0">{fileEmoji}</span>
            ) : (
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </>
        )}
        <span className="truncate font-mono">{node.name}</span>
      </button>
      
      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect, selectedPath }: FileExplorerProps) {
  return (
    <div className="h-full overflow-auto scrollbar-thin py-2">
      {files.length === 0 ? (
        <div className="px-4 py-8 text-center text-muted-foreground text-sm">
          No files generated yet
        </div>
      ) : (
        files.map((file) => (
          <FileTreeItem
            key={file.path}
            node={file}
            depth={0}
            onFileSelect={onFileSelect}
            selectedPath={selectedPath}
          />
        ))
      )}
    </div>
  );
}
