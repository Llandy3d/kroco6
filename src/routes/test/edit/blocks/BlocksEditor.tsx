import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  runScriptInCloud,
  runScriptLocally,
  type Environment,
  type Project,
  type ProjectConfig,
} from "@/lib/backend-client";
import { convertToScript } from "@/lib/stores/blocks/convert";
import type { BlockFile } from "@/lib/stores/editor";
import { EMPTY_ENVIRONMENT } from "@/lib/stores/projects";
import { Canvas } from "@/routes/test/edit/blocks/Canvas";
import { useTest } from "@/routes/test/edit/blocks/atoms";
import { Library } from "@/routes/test/edit/blocks/library/Library";
import { Provider } from "jotai";
import { Book, Code, Layers, ScrollText } from "lucide-react";
import type { OpenAPIV3 } from "openapi-types";
import { useEffect, useState } from "react";
import { TestToolbar } from "../TestToolbar";
import { TabButton } from "./TabButton";

interface BlocksEditorProps {
  file: BlockFile;
  project: Project;
  environment: Environment | null;
}

function BlocksEditorContainer({ file, project, environment }: BlocksEditorProps) {
  const { toast } = useToast();

  const [test, setTest] = useTest();
  const [tab, setTab] = useState("library");
  const [running, setRunning] = useState(false);

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
    // if (!$currentFile) return;
    // await saveTest("default", $currentFile.name, JSON.stringify($test));
    // if ($currentFile.path.type === "new") {
    //   updateFile($currentFile.handle, { path: { type: "existing", path: "", original: "" } });
    // }
    // if ($currentFile.path.type === "new") {
    //   await createTest(
    //     $activeProject,
    //     new Test($currentFile.name, "Blocks", JSON.stringify($test)),
    //   );
    //   updateFile($currentFile.handle, { path: { type: "existing", path: "", original: "" } });
    //   refetchTests($activeProject);
    // } else {
    //   await saveTest($activeProject, $currentFile.name, JSON.stringify($test));
    // }
  }

  function handleLibraryChange(library: OpenAPIV3.Document) {
    setTest({
      ...test,
      library,
    });
  }

  useEffect(() => {
    if (file.path.type === "new") {
      setTest(JSON.parse(file.path.initial));
    } else {
      setTest(JSON.parse(file.path.original));
    }
  }, [file]);

  // onMount(() => {
  //   let content = file.path.type === "new" ? file.path.initial : file.path.original;

  //   try {
  //     const parsed = parse(JSON.parse(content));

  //     if (!parsed.success) {
  //       console.log("Failed to parse block test", parsed.issues);

  //       test.set(EMPTY_BLOCK_TEST);

  //       return;
  //     }

  //     test.set(parsed.output);
  //   } catch (e) {
  //     test.set(EMPTY_BLOCK_TEST);

  //     console.error(e);
  //   }
  // });
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
        <TabsContent value="build" className="flex-auto">
          <Canvas />
        </TabsContent>
        <TabsContent value="library" className="mt-0 flex-auto">
          <Library library={test.library} onChange={handleLibraryChange} />
        </TabsContent>
        {/* <TabsContent value="script" className="flex-auto">
          <ScriptPreview />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}

function BlocksEditor({ file, project, environment }: BlocksEditorProps) {
  return (
    <Provider>
      <BlocksEditorContainer file={file} project={project} environment={environment} />
    </Provider>
  );
}

export { BlocksEditor };
