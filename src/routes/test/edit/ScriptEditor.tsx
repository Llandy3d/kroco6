import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  runScriptInCloud,
  runScriptLocally,
  type Project,
  type ProjectConfig,
} from "@/lib/backend-client";
import type { OpenFile, ScriptFile } from "@/lib/stores/editor";
import * as monaco from "monaco-editor";
import { useRef, useState } from "react";
import { ImportDialog } from "./ImportDialog";
import { ScriptExamples } from "./ScriptExamples";
import { TestToolbar } from "./TestToolbar";

{
  /* <script lang="ts" context="module">
  import { loadContent, storeContent } from "$lib/files";
  import { currentFile, updateFile, type ScriptFile } from "$lib/stores/editor";
</script>

<script lang="ts">
  import {
    Test,
    createTest,
    runScriptInCloud,
    runScriptLocally,
    saveTest,
  } from "$lib/backend-client";

  import { Button } from "$lib/components/ui/button";
  import { activeProject } from "$lib/stores/projects";
  import { refetchTests } from "$lib/stores/tests";
  import { open } from "@tauri-apps/api/shell";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import ImportDialog from "./ImportDialog.svelte";
  import ScriptExamples from "./ScriptExamples.svelte";
  import TestToolbar from "./TestToolbar.svelte";

  export let file: ScriptFile;

  let container: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  let script = "";
  let cloudTestDialogOpen = false;

  function setCloudScriptInEditor(script: string | null) {
    if (script !== null) {
      editor.setValue(script);
    }
    cloudTestDialogOpen = false;
  }

  async function runTestLocally() {
    try {
      const response = await runScriptLocally(script);

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function runTestInCloud(projectId: string) {
    try {
      const results = await runScriptInCloud({ script, projectId });
      open(results);
    } catch (error) {
      toast.error("Error running test in cloud. Check your configuration.");
      console.error(error);
    }
  }

  function handleExScript(script: string) {
    editor.setValue(script);
  }

  async function handleSaveTest() {
    if (!$currentFile) return;

    if ($currentFile.path.type === "new") {
      await createTest($activeProject, new Test($currentFile.name, "Javascript", script));
      updateFile($currentFile.handle, { path: { type: "existing", path: "", original: "" } });
      refetchTests($activeProject);
    } else {
      await saveTest($activeProject, $currentFile.name, script);
    }
  }

  onMount(() => {
    script = loadContent(file);

    editor = monaco.editor.create(container, {
      value: script,
      language: "javascript",
    });

    editor.onDidChangeModelContent(() => {
      script = editor.getValue();
    });
  });

  onDestroy(() => {
    storeContent(file, script);

    editor.dispose();
  });
</script> */
}

interface ScriptEditorProps {
  file: ScriptFile;
  project: Project;
}

function ScriptEditor({ file, project }: ScriptEditorProps) {
  const { toast } = useToast();

  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  const [running, setRunning] = useState(false);
  const [script, setScript] = useState("");
  const [cloudTestDialogOpen, setCloudTestDialogOpen] = useState(false);

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

  async function handleSaveTest(_file: OpenFile) {
    // if (!$currentFile) return;
    // if ($currentFile.path.type === "new") {
    //   await createTest($activeProject, new Test($currentFile.name, "Javascript", script));
    //   updateFile($currentFile.handle, { path: { type: "existing", path: "", original: "" } });
    //   refetchTests($activeProject);
    // } else {
    //   await saveTest($activeProject, $currentFile.name, script);
    // }
  }

  function handleSelectExample(script: string) {
    editor.current?.setValue(script);
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

  function handleScriptImport(script: string) {
    editor.current?.setValue(script);
  }

  function handleImportDismiss() {
    setCloudTestDialogOpen(false);
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
      <div className="flex gap-2">
        <ScriptExamples onSelect={handleSelectExample} />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setCloudTestDialogOpen(true);
          }}
        >
          Import script
        </Button>
      </div>
      <ImportDialog
        open={cloudTestDialogOpen}
        project={project}
        onDismiss={handleImportDismiss}
        onImport={handleScriptImport}
      />
      <div ref={handleContainerMount} className="full-w full-h flex-auto"></div>
    </div>
  );
}

export { ScriptEditor };
