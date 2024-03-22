import { Button } from "@/components/base/button";
import { ProjectIcon } from "@/components/icons/ProjectIcon";
import type { ProjectSettingsTab } from "@/lib/stores/editor";
import { join } from "@/lib/utils/path";
import type { ProjectSettings } from "@/schemas/project";
import { EditorTabs, EditorTabsList, EditorTabsTrigger } from "@/views/editor/tabs/EditorTabs";
import { CloudTab } from "@/views/editor/tabs/project-settings/CloudTab";
import { ProjectTab } from "@/views/editor/tabs/project-settings/ProjectTab";
import { TabsContent } from "@radix-ui/react-tabs";
import { Cloud, Save } from "lucide-react";
import { useState } from "react";

interface ProjectSettingsProps {
  tab: ProjectSettingsTab;
  onChange: (tab: ProjectSettingsTab) => void;
  onSave: (tab: ProjectSettingsTab) => void;
}

function ProjectSettingsEditor({ tab: file, onChange, onSave }: ProjectSettingsProps) {
  const [tab, setTab] = useState("project");

  function handleSettingsChange(settings: ProjectSettings) {
    onChange({
      ...file,
      settings,
    });
  }

  function handleSave() {
    onSave({
      ...file,
      path: {
        type: "existing",
        filePath: join(file.rootPath, "k6.json"),
        original: file.path.type === "existing" ? file.path.original : file.path.initial,
      },
    });
  }

  return (
    <EditorTabs value={tab} onValueChange={setTab}>
      <EditorTabsList className="justify-between">
        <div className="flex">
          <EditorTabsTrigger value="project">
            <ProjectIcon size={14} /> Project
          </EditorTabsTrigger>
          <EditorTabsTrigger value="cloud">
            <Cloud size={14} /> Cloud
          </EditorTabsTrigger>
        </div>
        <div>
          <Button className="flex gap-2" onClick={handleSave}>
            <Save size={14} /> Save
          </Button>
        </div>
      </EditorTabsList>
      <TabsContent value="project">
        <ProjectTab settings={file.settings} onChange={handleSettingsChange} />
      </TabsContent>
      <TabsContent value="cloud">
        <CloudTab />
      </TabsContent>
    </EditorTabs>
  );
}

export { ProjectSettingsEditor };
