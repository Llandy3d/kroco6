import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  runScriptInCloud,
  runScriptLocally,
  saveFile,
  type Environment,
  type Project,
  type ProjectConfig,
} from "@/lib/backend-client";
import { convertToScript } from "@/lib/stores/blocks/convert";
import type { Test } from "@/lib/stores/blocks/model/loose";
import type { BlockTab } from "@/lib/stores/editor";
import { EMPTY_ENVIRONMENT } from "@/lib/stores/projects";
import { useSetCurrentFile, useSetOpenFiles } from "@/routes/test/edit/atoms";
import { Canvas } from "@/views/blocks-editor/Canvas";
import { ScriptPreview } from "@/views/blocks-editor/ScriptPreview";
import { testAtom, useTest } from "@/views/blocks-editor/atoms";
import { Library } from "@/views/blocks-editor/library/Library";
import { Provider, createStore } from "jotai";
import { Book, Code, Layers, ScrollText } from "lucide-react";
import type { OpenAPIV3 } from "openapi-types";
import { useEffect, useState } from "react";
import { useMemoOne } from "use-memo-one";
import { TestToolbar } from "../../routes/test/edit/TestToolbar";
import { TabButton } from "./TabButton";

interface BlocksEditorProps {
  file: BlockTab;
  project: Project;
  environment: Environment | null;
  onChange: (file: BlockTab) => void;
}

function BlocksEditorContainer({ file, project, environment }: BlocksEditorProps) {
  const { toast } = useToast();

  const [test, setTest] = useTest();
  const [tab, setTab] = useState("build");
  const [running, setRunning] = useState(false);

  const setOpenFiles = useSetOpenFiles();
  const setCurrentFile = useSetCurrentFile();

  async function runTestLocally() {
    try {
      setRunning(true);

      const script = await convertToScript(environment ?? EMPTY_ENVIRONMENT, test);
      const response = await runScriptLocally(script);

      console.log(response);
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
        description: "The script could not be generated because the blocks contain errors.",
      });
    }
  }

  async function handleSaveTest() {
    saveFile(file, JSON.stringify(test)).then((savedFile) => {
      setOpenFiles((files) =>
        files.map((file) => (file.handle === savedFile.handle ? savedFile : file)),
      );

      setCurrentFile(file.handle);
    });
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
      <Tabs className="flex flex-auto flex-col" value={tab} onValueChange={setTab}>
        <TestToolbar
          project={project}
          file={file}
          running={running}
          leftItems={
            <TabsList className="bg-default flex rounded-none shadow-none">
              <TabButton value="build">
                <Layers size={14} /> Build
              </TabButton>
              <TabButton value="library">
                <Book size={14} /> Library
              </TabButton>
              <TabButton value="script">
                <Code size={14} /> Script
              </TabButton>
            </TabsList>
          }
          rightItems={
            <Button
              size="icon"
              className="rounded-full"
              variant="ghost"
              onClick={handleConvertToScript}
            >
              <ScrollText size={14} />
            </Button>
          }
          onRunLocally={runTestLocally}
          onRunInCloud={runTestInCloud}
          onSave={handleSaveTest}
        />
        <TabsContent value="build" className="mt-0 flex-auto">
          <Canvas test={test} onChange={handleTestChange} />
        </TabsContent>
        <TabsContent value="library" className="mt-0 flex-auto">
          <Library library={test.library} onChange={handleLibraryChange} />
        </TabsContent>
        <TabsContent value="script" className="mt-0 flex-auto">
          <ScriptPreview test={test} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BlocksEditor({ file, project, environment, onChange }: BlocksEditorProps) {
  const store = useMemoOne(() => {
    return createStore();
  }, []);

  useEffect(() => {
    store.set(testAtom, file.blocks);

    const unsub = store.sub(testAtom, () => {
      const test = store.get(testAtom);

      onChange({
        ...file,
        blocks: test,
      });
    });

    return () => {
      unsub();
    };
  }, [file, store]);

  return (
    <Provider store={store}>
      <BlocksEditorContainer
        file={file}
        project={project}
        environment={environment}
        onChange={onChange}
      />
    </Provider>
  );
}

export { BlocksEditor };
