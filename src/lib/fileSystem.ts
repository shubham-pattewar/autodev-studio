import { FileNode } from "@/types/agent";
import { FileSystemTree } from "@webcontainer/api";

export function convertFilesToWebContainer(files: FileNode[]): FileSystemTree {
  const tree: FileSystemTree = {};

  files.forEach((file) => {
    if (file.type === "directory" && file.children) {
      tree[file.name] = {
        directory: convertFilesToWebContainer(file.children),
      };
    } else if (file.type === "file") {
      tree[file.name] = {
        file: {
          contents: file.content || "",
        },
      };
    }
  });

  return tree;
}
