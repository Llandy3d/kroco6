import { useToast } from "@/components/ui/use-toast";
import {
  runScriptInCloud,
  runScriptLocally,
  saveFile,
  type Project,
  type ProjectConfig,
} from "@/lib/backend-client";
import type { EditorTab, ScriptTab } from "@/lib/stores/editor";
import { useSetCurrentFile, useSetOpenFiles } from "@/routes/test/edit/atoms";
import * as monaco from "monaco-editor";
import { useRef, useState } from "react";
import { TestToolbar } from "../../routes/test/edit/TestToolbar";

interface ScriptEditorProps {
  file: ScriptTab;
  project: Project;
  onChange: (file: ScriptTab) => void;
}

function ScriptEditor({ file, project, onChange }: ScriptEditorProps) {
  const { toast } = useToast();

  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  const [running, setRunning] = useState(false);

  const setOpenFiles = useSetOpenFiles();
  const setCurrentFile = useSetCurrentFile();

  async function handleRunLocally() {
    try {
      setRunning(true);

      const response = await runScriptLocally(file.script);

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

      const results = await runScriptInCloud({
        script: file.script,
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

  async function handleSaveTest(file: EditorTab) {
    saveFile(file, file.type === "script" ? file.script : "").then((savedFile) => {
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
      value: file.path.type === "existing" ? file.path.original : file.path.initial,
      language: "javascript",
      automaticLayout: true,
    });

    editor.current.onDidChangeModelContent(() => {
      onChange({
        ...file,
        script: editor.current?.getValue() ?? "",
      });
    });
  }

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
