import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <>
      <Toaster />

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="flex flex-col">
          <div className="flex flex-auto flex-col bg-[#F9F8FC] p-4 pt-1">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}

export { Layout };
