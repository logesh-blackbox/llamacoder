
"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, File } from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void;
}

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  onFileSelect?: (file: FileNode) => void;
}

const FileTreeItem = ({ node, level, onFileSelect }: FileTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const indent = level * 16; // 16px per level

  if (node.type === "directory") {
    return (
      <div>
        <div
          className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <span className="font-medium">{node.name}</span>
        </div>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child, index) => (
              <FileTreeItem
                key={`${child.name}-${index}`}
                node={child}
                level={level + 1}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer"
      style={{ paddingLeft: `${indent}px` }}
      onClick={() => onFileSelect?.(node)}
    >
      <File className="h-4 w-4 mr-1" />
      <span>{node.name}</span>
    </div>
  );
};

export default function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  return (
    <div className="h-full overflow-y-auto border-r border-gray-200">
      <div className="p-2">
        {files.map((file, index) => (
          <FileTreeItem
            key={`${file.name}-${index}`}
            node={file}
            level={0}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}
