/* <script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { currentFile, newFile, openFiles, type OpenFile } from "$lib/stores/editor";
  import { Tabs } from "bits-ui";
  import { PlusIcon, XCircle } from "lucide-svelte";
  import EmptyEditor from "./EmptyEditor";
  import ScriptEditor from "./ScriptEditor";
  import BlocksEditor from "./blocks/BlocksEditor.svelte";

  const handleCurrentFileChange = (handle: string | undefined) => {
    $currentFile = $openFiles.find((file) => file.handle === handle) ?? null;
  };

  const handleClose = (file: OpenFile) => () => {
    const openIndex = $openFiles.findIndex((f) => f.handle === file.handle);

    $openFiles = $openFiles.filter((f) => f.handle !== file.handle);

    if ($currentFile?.handle === file.handle) {
      $currentFile = $openFiles[openIndex] ?? null;
    }
  };

  const handleNewBlocksFile = () => {
    newFile({
      type: "block",
    });
  };

  const handleNewScriptFile = () => {
    newFile({
      type: "script",
    });
  };
</script> */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/lib/backend-client";
import { EMPTY_BLOCK_TEST } from "@/lib/stores/blocks/constants";
import type { BlockFile, OpenFile } from "@/lib/stores/editor";
import { exhaustive } from "@/lib/utils/typescript";
import { PlusIcon, XCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { forwardRef, useState, type HTMLAttributes } from "react";
import { EmptyEditor } from "./EmptyEditor";
import { ScriptEditor } from "./ScriptEditor";

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
        <XCircle size={16} className="text-slate-400" />
      </button>
    </div>
  );
});

interface TestEditorProps {
  file: OpenFile;
  project: Project;
}

function TestEditor({ file, project }: TestEditorProps) {
  switch (file.type) {
    case "script":
      return <ScriptEditor file={file} project={project} />;

    case "block":
      return <div>Blocks</div>;

    default:
      return exhaustive(file);
  }
}

interface EditorProps {
  project: Project;
}

function Editor({ project }: EditorProps) {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [currentFile, setCurrentFile] = useState<OpenFile | null>(null);

  function handleCurrentFileChange(handle: string | undefined) {
    setCurrentFile(openFiles.find((file) => file.handle === handle) ?? null);
  }

  function handleClose(file: OpenFile) {
    const index = openFiles.findIndex((f) => f.handle === file.handle);

    setCurrentFile(openFiles[index + 1] ?? openFiles[index - 1] ?? null);
    setOpenFiles(openFiles.filter((f) => f.handle !== file.handle));
  }

  function handleNewBlocksFile() {
    const newFile: BlockFile = {
      type: "block",
      name: "New Blocks",
      handle: nanoid(),
      path: {
        type: "new",
        initial: JSON.stringify(EMPTY_BLOCK_TEST),
      },
    };

    setOpenFiles([...openFiles, newFile]);
    setCurrentFile(newFile);
  }

  function handleNewScriptFile() {
    const newFile: OpenFile = {
      type: "script",
      name: "New Script",
      handle: nanoid(),
      path: {
        type: "new",
        initial: "",
      },
    };

    setOpenFiles([...openFiles, newFile]);
    setCurrentFile(newFile);
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
          <TabsContent key={file.handle} value={file.handle} className="flex-auto bg-white">
            <div className="border-[1px] border-[#F2F1F5] flex h-full flex-col">
              <TestEditor file={file} project={project} />
            </div>
          </TabsContent>
        );
      })}
      <TabsContent value={"empty"} className="flex-auto bg-white">
        <div className="border-[1px] border-[#F2F1F5] flex h-full flex-col">
          <EmptyEditor onNewBlocks={handleNewBlocksFile} onNewScript={handleNewScriptFile} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export { Editor };
