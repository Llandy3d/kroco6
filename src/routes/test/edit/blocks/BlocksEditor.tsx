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
import type { BlockFile } from "@/lib/stores/editor";
import { EMPTY_ENVIRONMENT } from "@/lib/stores/projects";
import { useSetCurrentFile, useSetOpenFiles } from "@/routes/test/edit/atoms";
import { Canvas } from "@/routes/test/edit/blocks/Canvas";
import { ScriptPreview } from "@/routes/test/edit/blocks/ScriptPreview";
import { Library } from "@/routes/test/edit/blocks/library/Library";
import { Book, Code, Layers, ScrollText } from "lucide-react";
import type { OpenAPIV3 } from "openapi-types";
import { useState } from "react";
import { TestToolbar } from "../TestToolbar";
import { TabButton } from "./TabButton";

interface BlocksEditorProps {
  file: BlockFile;
  project: Project;
  environment: Environment | null;
  onChange: (file: BlockFile) => void;
}

function BlocksEditorContainer({ file, project, environment, onChange }: BlocksEditorProps) {
  const { toast } = useToast();

  const [tab, setTab] = useState("build");
  const [running, setRunning] = useState(false);

  const setOpenFiles = useSetOpenFiles();
  const setCurrentFile = useSetCurrentFile();

  async function runTestLocally() {
    try {
      setRunning(true);

      const script = await convertToScript(environment ?? EMPTY_ENVIRONMENT, file.blocks);
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

      const script = await convertToScript(environment, file.blocks);
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
    saveFile(file, JSON.stringify(file.blocks)).then((savedFile) => {
      setOpenFiles((files) =>
        files.map((file) => (file.handle === savedFile.handle ? savedFile : file)),
      );

      setCurrentFile(file.handle);
    });
  }

  function handleTestChange(test: Test) {
    onChange({
      ...file,
      blocks: test,
    });
  }

  function handleLibraryChange(library: OpenAPIV3.Document) {
    onChange({
      ...file,
      blocks: {
        ...file.blocks,
        library,
      },
    });
  }

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
        <TabsContent value="build" className="mt-0 flex-auto">
          <Canvas test={file.blocks} onChange={handleTestChange} />
        </TabsContent>
        <TabsContent value="library" className="mt-0 flex-auto">
          <Library library={file.blocks.library} onChange={handleLibraryChange} />
        </TabsContent>
        <TabsContent value="script" className="mt-0 flex-auto">
          <ScriptPreview test={file.blocks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BlocksEditor({ file, project, environment, onChange }: BlocksEditorProps) {
  return (
    <BlocksEditorContainer
      file={file}
      project={project}
      environment={environment}
      onChange={onChange}
    />
  );
}

export { BlocksEditor };
