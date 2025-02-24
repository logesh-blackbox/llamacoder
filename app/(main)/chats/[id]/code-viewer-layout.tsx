"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { ReactNode, useEffect, useState } from "react";
import FileExplorer from "@/components/FileExplorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export default function CodeViewerLayout({
  children,
  isShowing,
  onClose,
}: {
  children: ReactNode;
  isShowing: boolean;
  onClose: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeTab, setActiveTab] = useState<string>("code");

  useEffect(() => {
    // Fetch file structure when component mounts
    fetch("/api/file-structure")
      .then((res) => res.json())
      .then((data) => setFiles(data.files))
      .catch((error) => console.error("Error fetching file structure:", error));
  }, []);

  const handleFileSelect = (file: FileNode) => {
    // Handle file selection - can be implemented based on requirements
    console.log("Selected file:", file);
  };

  const renderContent = () => (
    <div className="flex h-full">
      <div className="w-1/4 min-w-[200px] border-r border-gray-200">
        <FileExplorer files={files} onFileSelect={handleFileSelect} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={isShowing} onClose={onClose}>
          <DrawerContent>
            <VisuallyHidden.Root>
              <DrawerTitle>Code</DrawerTitle>
              <DrawerDescription>Description</DrawerDescription>
            </VisuallyHidden.Root>

            <div className="h-[90vh]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="code" className="h-[calc(90vh-40px)] overflow-y-auto">
                  {children}
                </TabsContent>
                <TabsContent value="files" className="h-[calc(90vh-40px)] overflow-y-auto">
                  <FileExplorer files={files} onFileSelect={handleFileSelect} />
                </TabsContent>
              </Tabs>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <div
          className={`${isShowing ? "w-1/2" : "w-0"} hidden h-full overflow-hidden py-5 transition-[width] lg:block`}
        >
          <div className="ml-4 flex h-full flex-col rounded-l-xl shadow-lg shadow-gray-400/40">
            <div className="flex h-full flex-col rounded-l-xl shadow shadow-gray-800/50">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
