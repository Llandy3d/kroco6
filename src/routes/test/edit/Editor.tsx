import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/lib/backend-client";
import { NEW_SCRIPT } from "@/lib/files";
import { EMPTY_BLOCK_TEST } from "@/lib/stores/blocks/constants";
import type { BlockFile, VirtualFile } from "@/lib/stores/editor";
import { exhaustive } from "@/lib/utils/typescript";
import { useCurrentFile, useOpenFiles } from "@/routes/test/edit/atoms";
import { Box, FileCode, PlusIcon, X } from "lucide-react";
import { nanoid } from "nanoid";
import { forwardRef, type HTMLAttributes } from "react";
import { EmptyEditor } from "./EmptyEditor";
import { ScriptEditor } from "./ScriptEditor";
import { BlocksEditor } from "./blocks/BlocksEditor";

type TabButtonProps = HTMLAttributes<HTMLButtonElement> & {
  "data-state"?: string;
  onClose: () => void;
};

const TabButton = forwardRef<HTMLDivElement, TabButtonProps>(function TabButton(
  { onClose, "data-state": state, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-state={state}
      className="relative border-b-4 data-[state=active]:border-primary"
    >
      <button {...props} className="flex items-center gap-2 p-2 pr-8 hover:bg-slate-200 "></button>
      <button
        className="absolute bottom-0 right-2 top-0 flex items-center hover:scale-110"
        onClick={onClose}
      >
        <X size={14} className="text-slate-400" />
      </button>
    </div>
  );
});

interface TestEditorProps {
  file: VirtualFile;
  project: Project;
  onChange: (file: VirtualFile) => void;
}

function TestEditor({ file, project, onChange }: TestEditorProps) {
  switch (file.type) {
    case "script":
      return <ScriptEditor file={file} project={project} onChange={onChange} />;

    case "blocks":
      return <BlocksEditor file={file} project={project} environment={null} onChange={onChange} />;

    default:
      return exhaustive(file);
  }
}

interface EditorProps {
  project: Project;
}

function Editor({ project }: EditorProps) {
  const [openFiles, setOpenFiles] = useOpenFiles();
  const [currentFile, setCurrentFile] = useCurrentFile();

  function handleCurrentFileChange(handle: string | undefined) {
    setCurrentFile(handle ?? null);
  }

  function handleClose(file: VirtualFile) {
    const index = openFiles.findIndex((f) => f.handle === file.handle);

    setCurrentFile(openFiles[index + 1]?.handle ?? openFiles[index - 1]?.handle ?? null);
    setOpenFiles(openFiles.filter((f) => f.handle !== file.handle));
  }

  function handleNewBlocksFile() {
    const newFile: BlockFile = {
      type: "blocks",
      name: "New Blocks",
      handle: nanoid(),
      path: {
        type: "new",
        initial: JSON.stringify(EMPTY_BLOCK_TEST),
      },
      blocks: EMPTY_BLOCK_TEST,
    };

    setOpenFiles([...openFiles, newFile]);
    setCurrentFile(newFile.handle);
  }

  function handleNewScriptFile() {
    const newFile: VirtualFile = {
      type: "script",
      name: "New Script",
      handle: nanoid(),
      path: {
        type: "new",
        initial: NEW_SCRIPT,
      },
      script: NEW_SCRIPT,
    };

    setOpenFiles([...openFiles, newFile]);
    setCurrentFile(newFile.handle);
  }

  function handleFileChange(file: VirtualFile) {
    setOpenFiles(openFiles.map((current) => (current.handle === file.handle ? file : current)));
  }

  return (
    <Tabs
      value={currentFile?.handle ?? "empty"}
      className="flex flex-auto flex-col"
      onValueChange={handleCurrentFileChange}
    >
      <TabsList className="flex h-10 items-center justify-start gap-2 text-sm font-light">
        {openFiles.map((file) => {
          return (
            <TabsTrigger asChild key={file.handle} value={file.handle}>
              <TabButton onClose={() => handleClose(file)}>
                {file.type === "blocks" ? <Box size={14} /> : <FileCode size={14} />}
                {file.name}
                {file.path.type === "new" && "*"}
              </TabButton>
            </TabsTrigger>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 hover:bg-slate-200">
            <PlusIcon size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleNewBlocksFile}>Blocks</DropdownMenuItem>
            <DropdownMenuItem onClick={handleNewScriptFile}>Script</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TabsList>
      {openFiles.map((file) => {
        return (
          <TabsContent key={file.handle} value={file.handle} className="mt-0 flex-auto bg-white">
            <div className="border-[1px] border-[#F2F1F5] flex h-full flex-col">
              <TestEditor file={file} project={project} onChange={handleFileChange} />
            </div>
          </TabsContent>
        );
      })}
      <TabsContent value="empty" className="mt-0 flex-auto bg-white">
        <div className="border-[1px] border-[#F2F1F5] flex h-full flex-col">
          <EmptyEditor onNewBlocks={handleNewBlocksFile} onNewScript={handleNewScriptFile} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export { Editor };
