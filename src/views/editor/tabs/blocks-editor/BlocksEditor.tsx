import { useProjectValue } from "@/atoms/project";
import { useSetCurrentRun } from "@/atoms/runs";
import { useSetCurrentTab, useSetOpenTabs } from "@/atoms/tabs";
import { Button } from "@/components/base/button";
import { TabsContent } from "@/components/base/tabs";
import { useToast } from "@/components/base/use-toast";
import {
  runScriptInCloud,
  runScriptLocally,
  type Environment,
  type ProjectConfig,
} from "@/lib/backend-client";
import { convertToScript } from "@/lib/stores/blocks/convert";
import type { Test } from "@/lib/stores/blocks/model/loose";
import type { BlockTab, FileTab, TestResultsTab } from "@/lib/stores/editor";
import { EMPTY_ENVIRONMENT } from "@/lib/stores/projects";
import {
  EditorTabs,
  EditorTabsList,
  EditorTabsTrigger,
} from "@/views/editor/tabs/EditorTabs";
import { Canvas } from "@/views/editor/tabs/blocks-editor/Canvas";
import { ScriptPreview } from "@/views/editor/tabs/blocks-editor/ScriptPreview";
import { testAtom, useTest } from "@/views/editor/tabs/blocks-editor/atoms";
import { Library } from "@/views/editor/tabs/blocks-editor/library/Library";
import { Provider, createStore } from "jotai";
import { Book, Code, Layers, ScrollText } from "lucide-react";
import { nanoid } from "nanoid";
import type { OpenAPIV3 } from "openapi-types";
import { useEffect, useState } from "react";
import { useMemoOne } from "use-memo-one";
import { TestToolbar } from "../../../../routes/test/edit/TestToolbar";

interface BlocksEditorContainerProps {
  tab: BlockTab;
  environment: Environment | null;
  onSave: (file: FileTab) => void;
  onStarted: () => void;
}

function BlocksEditorContainer({
  tab: file,
  environment,
  onSave,
  onStarted,
}: BlocksEditorContainerProps) {
  const { toast } = useToast();

  const setCurrentRun = useSetCurrentRun();
  const project = useProjectValue();

  const [test, setTest] = useTest();
  const [tab, setTab] = useState("build");
  const [running, setRunning] = useState(false);

  async function runTestLocally() {
    const settings = project?.settings;

    if (settings === undefined) {
      return;
    }

    try {
      setRunning(true);

      const script = await convertToScript(
        environment ?? EMPTY_ENVIRONMENT,
        test,
      );

      setCurrentRun(
        runScriptLocally(settings, script)
          .then(console.log)
          .catch(console.error),
      );

      onStarted();
    } catch (error) {
      console.error(error);
    } finally {
      setRunning(false);
    }
  }

  async function runTestInCloud(config: ProjectConfig) {
    if (environment === null) {
      toast({
        variant: "destructive",
        description:
          "No environment selected. Please select an environment to run the test in cloud.",
      });

      return;
    }

    try {
      setRunning(true);

      const script = await convertToScript(environment, test);
      const results = await runScriptInCloud({
        script,
        projectId: config.cloud_project_id,
      });

      open(results);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error running test in cloud. Check your configuration.",
      });
      console.error(error);
    } finally {
      setRunning(false);
    }
  }

  async function handleConvertToScript() {
    try {
      // const script = await convertToScript(environment ?? EMPTY_ENVIRONMENT, test);
      // newFile({
      //   type: "script",
      //   initial: script,
      // });
    } catch {
      toast({
        variant: "destructive",
        description:
          "The script could not be generated because the blocks contain errors.",
      });
    }
  }

  function handleTestChange(test: Test) {
    setTest(test);
  }

  function handleLibraryChange(library: OpenAPIV3.Document) {
    setTest((test) => {
      return {
        ...test,
        library,
      };
    });
  }

  return (
    <div className="flex flex-auto">
      <EditorTabs value={tab} onValueChange={setTab}>
        <EditorTabsList className="justify-between">
          <div className="flex">
            <EditorTabsTrigger value="build">
              <Layers size={14} /> Build
            </EditorTabsTrigger>
            <EditorTabsTrigger value="library">
              <Book size={14} /> Library
            </EditorTabsTrigger>
            <EditorTabsTrigger value="script">
              <Code size={14} /> Script
            </EditorTabsTrigger>
          </div>
          <div className="flex items-center">
            <Button
              size="icon"
              className="rounded-full"
              variant="ghost"
              onClick={handleConvertToScript}
            >
              <ScrollText size={14} />
            </Button>
            <TestToolbar
              file={file}
              running={running}
              onRunLocally={runTestLocally}
              onRunInCloud={runTestInCloud}
              onSave={onSave}
            />
          </div>
        </EditorTabsList>

        <TabsContent value="build" className="mt-0 flex-auto">
          <Canvas test={test} onChange={handleTestChange} />
        </TabsContent>
        <TabsContent value="library" className="mt-0 flex-auto">
          <Library library={test.library} onChange={handleLibraryChange} />
        </TabsContent>
        <TabsContent value="script" className="mt-0 flex-auto">
          <ScriptPreview test={test} />
        </TabsContent>
      </EditorTabs>
    </div>
  );
}

interface BlocksEditorProps {
  tab: BlockTab;
  environment: Environment | null;
  onChange: (file: BlockTab) => void;
  onSave: (file: FileTab) => void;
}

function BlocksEditor({
  tab: file,
  environment,
  onChange,
  onSave,
}: BlocksEditorProps) {
  const setOpenTabs = useSetOpenTabs();
  const setCurrentTab = useSetCurrentTab();

  const store = useMemoOne(() => {
    return createStore();
  }, []);

  useEffect(() => {
    store.set(testAtom, file.blocks);

    const unsubTest = store.sub(testAtom, () => {
      const test = store.get(testAtom);

      onChange({
        ...file,
        blocks: test,
      });
    });

    return () => {
      unsubTest();
    };
  }, [file, store]);

  function handleStarted() {
    const tab: TestResultsTab = {
      handle: nanoid(),
      name: "Test Results",
      type: "test-results",
    };

    setTimeout(() => {
      setOpenTabs((tabs) => [...tabs, tab]);
      setCurrentTab(tab.handle);
    }, 0);
  }

  return (
    <Provider store={store}>
      <BlocksEditorContainer
        tab={file}
        environment={environment}
        onSave={onSave}
        onStarted={handleStarted}
      />
    </Provider>
  );
}

export { BlocksEditor };
