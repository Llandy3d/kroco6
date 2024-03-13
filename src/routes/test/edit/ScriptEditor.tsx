import { useToast } from "@/components/ui/use-toast";
import {
  runScriptInCloud,
  runScriptLocally,
  saveFile,
  type Project,
  type ProjectConfig,
} from "@/lib/backend-client";
import type { ScriptFile, VirtualFile } from "@/lib/stores/editor";
import { useSetCurrentFile, useSetOpenFiles } from "@/routes/test/edit/atoms";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { TestToolbar } from "./TestToolbar";

interface ScriptEditorProps {
  file: ScriptFile;
  project: Project;
}

function ScriptEditor({ file, project }: ScriptEditorProps) {
  const { toast } = useToast();

  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  const [running, setRunning] = useState(false);
  const [script, setScript] = useState(
    file.path.type === "existing" ? file.path.original : file.path.initial,
  );

  const setOpenFiles = useSetOpenFiles();
  const setCurrentFile = useSetCurrentFile();

  async function handleRunLocally() {
    try {
      setRunning(true);

      const response = await runScriptLocally(script);

      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      setRunning(false);
    }
  }

  async function handleRunInCloud(config: ProjectConfig) {
    try {
      setRunning(true);

      const results = await runScriptInCloud({ script, projectId: config.cloud_project_id });

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

  async function handleSaveTest(file: VirtualFile) {
    saveFile(file, script).then((savedFile) => {
      setOpenFiles((files) =>
        files.map((file) => (file.handle === savedFile.handle ? savedFile : file)),
      );

      setCurrentFile(file.handle);
    });
  }

  function handleContainerMount(container: HTMLDivElement | null) {
    if (container === null || editor.current !== undefined) {
      return;
    }

    editor.current = monaco.editor.create(container, {
      value: script,
      language: "javascript",
      automaticLayout: true,
    });

    editor.current.onDidChangeModelContent(() => {
      setScript(editor.current?.getValue() ?? "");
    });
  }

  useEffect(() => {
    if (editor.current === undefined) {
      return;
    }

    editor.current.setValue(file.path.type === "existing" ? file.path.original : file.path.initial);
  }, [file]);

  return (
    <div className="flex flex-auto flex-col bg-white">
      <TestToolbar
        project={project}
        file={file}
        running={running}
        onRunLocally={handleRunLocally}
        onRunInCloud={handleRunInCloud}
        onSave={handleSaveTest}
      />

      <div ref={handleContainerMount} className="full-w full-h flex-auto"></div>
    </div>
  );
}

export { ScriptEditor };
