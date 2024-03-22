import { useSetProject } from "@/atoms/project";
import { useCurrentTab, useOpenTabs } from "@/atoms/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/base/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/base/tabs";
import { ProjectIcon } from "@/components/icons/ProjectIcon";
import { saveFile, type Project } from "@/lib/backend-client";
import { NEW_SCRIPT } from "@/lib/files";
import { EMPTY_BLOCK_TEST } from "@/lib/stores/blocks/constants";
import type { BlockTab, EditorTab, FileTab } from "@/lib/stores/editor";
import { exhaustive } from "@/lib/utils/typescript";
import { ProjectSettingsEditor } from "@/views/editor/tabs/project-settings/ProjectSettingsEditor";
import { TestResultsView } from "@/views/editor/tabs/test-results/TestResultsView";
import { Box, FileCode, LineChart, PlusIcon, X } from "lucide-react";
import { nanoid } from "nanoid";
import { forwardRef, useEffect, type HTMLAttributes } from "react";
import { EmptyEditor } from "./EmptyEditor";
import { BlocksEditor } from "./tabs/blocks-editor/BlocksEditor";
import { ScriptEditor } from "./tabs/script-editor/ScriptEditor";

function saveTab(project: Project, tab: FileTab) {
  const content =
    tab.type === "blocks"
      ? JSON.stringify(tab.blocks)
      : tab.type === "project-settings"
        ? JSON.stringify(tab.settings)
        : tab.script;

  return saveFile(project, tab, content);
}

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
      <button
        {...props}
        className="flex items-center gap-2 p-2 pr-8 hover:bg-slate-200 "
      ></button>
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
  tab: EditorTab;
  onChange: (file: FileTab) => void;
  onSave: (file: FileTab) => void;
}

function TestEditor({ tab, onChange, onSave }: TestEditorProps) {
  switch (tab.type) {
    case "script":
      return <ScriptEditor tab={tab} onChange={onChange} onSave={onSave} />;

    case "blocks":
      return (
        <BlocksEditor
          tab={tab}
          environment={null}
          onChange={onChange}
          onSave={onSave}
        />
      );

    case "project-settings":
      return (
        <ProjectSettingsEditor tab={tab} onChange={onChange} onSave={onSave} />
      );

    case "test-results":
      return <TestResultsView />;

    default:
      return exhaustive(tab);
  }
}

interface TabTextProps {
  file: EditorTab;
}

function TabText({ file }: TabTextProps) {
  if (file.type === "project-settings") {
    return (
      <>
        <ProjectIcon size={14} /> Project settings
      </>
    );
  }

  if (file.type === "test-results") {
    return (
      <>
        <LineChart size={14} /> Test Results
      </>
    );
  }

  return (
    <>
      {file.type === "blocks" ? <Box size={14} /> : <FileCode size={14} />}
      {file.name}
      {file.path.type === "new" && "*"}
    </>
  );
}

interface EditorProps {
  project: Project;
}

function Editor({ project }: EditorProps) {
  const setProject = useSetProject();

  const [openTabs, setOpenTabs] = useOpenTabs();
  const [currentTab, setCurrentTab] = useCurrentTab();

  function handleCurrentTabChange(handle: string | undefined) {
    setCurrentTab(handle ?? null);
  }

  function handleClose(file: EditorTab) {
    const index = openTabs.findIndex((f) => f.handle === file.handle);

    setCurrentTab(
      openTabs[index + 1]?.handle ?? openTabs[index - 1]?.handle ?? null,
    );
    setOpenTabs(openTabs.filter((f) => f.handle !== file.handle));
  }

  function handleSave(file: FileTab) {
    saveTab(project, file).then(({ project, tab }) => {
      setOpenTabs((files) =>
        files.map((current) => (current.handle === tab.handle ? tab : current)),
      );

      setProject(project);
    });
  }

  function handleNewBlocksFile() {
    const newTab: BlockTab = {
      type: "blocks",
      name: "New Blocks",
      handle: nanoid(),
      path: {
        type: "new",
        initial: JSON.stringify(EMPTY_BLOCK_TEST),
      },
      blocks: EMPTY_BLOCK_TEST,
    };

    setOpenTabs([...openTabs, newTab]);
    setCurrentTab(newTab.handle);
  }

  function handleNewScriptFile() {
    const newTab: EditorTab = {
      type: "script",
      name: "New Script",
      handle: nanoid(),
      path: {
        type: "new",
        initial: NEW_SCRIPT,
      },
      script: NEW_SCRIPT,
    };

    setOpenTabs([...openTabs, newTab]);
    setCurrentTab(newTab.handle);
  }

  function handleTabChange(tab: EditorTab) {
    setOpenTabs(
      openTabs.map((current) =>
        current.handle === tab.handle ? tab : current,
      ),
    );
  }

  useEffect(() => {
    console.log("open tabs", openTabs);
  }, [openTabs]);

  return (
    <Tabs
      value={currentTab?.handle ?? "empty"}
      className="flex flex-auto flex-col"
      onValueChange={handleCurrentTabChange}
    >
      <TabsList className="flex h-10 items-center justify-start gap-2 text-sm font-light">
        {openTabs.map((file) => {
          return (
            <TabsTrigger asChild key={file.handle} value={file.handle}>
              <TabButton onClose={() => handleClose(file)}>
                <TabText file={file} />
              </TabButton>
            </TabsTrigger>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 hover:bg-slate-200">
            <PlusIcon size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleNewBlocksFile}>
              Blocks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNewScriptFile}>
              Script
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TabsList>
      {openTabs.map((file) => {
        return (
          <TabsContent
            key={file.handle}
            value={file.handle}
            className="mt-0 flex-auto bg-white"
          >
            <div className="border-[1px] border-[#F2F1F5] flex h-full flex-col">
              <TestEditor
                tab={file}
                onChange={handleTabChange}
                onSave={handleSave}
              />
            </div>
          </TabsContent>
        );
      })}
      <TabsContent value="empty" className="mt-0 flex-auto bg-white">
        <div className="border-[1px] border-[#F2F1F5] flex h-full flex-col">
          <EmptyEditor
            onNewBlocks={handleNewBlocksFile}
            onNewScript={handleNewScriptFile}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export { Editor };
