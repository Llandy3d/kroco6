import { useProjectValue } from "@/atoms/project";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/base/resizable";
import { Editor } from "@/views/editor/Editor";
import { Sidebar } from "../views/sidebar/Sidebar";

function Main() {
  const project = useProjectValue();

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
        <Sidebar />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="flex h-screen flex-auto flex-col overflow-hidden bg-[#F9F8FC] p-4 pt-1">
        {project && <Editor project={project} />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export { Main };