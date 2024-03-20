import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectSettings } from "@/schemas/project";
import { SettingsSection } from "@/views/project-settings/SettingsSection";
import { css } from "@emotion/css";
import { useQuery } from "@tanstack/react-query";

function useVersions() {
  return useQuery({
    queryKey: ["k6-versions"],
    queryFn: async () => {
      const response = await fetch("https://api.github.com/repos/grafana/k6/releases");
      const data = (await response.json()) as GithubRelease[];

      return data.map((release) => release.tag_name);
    },
    staleTime: 1000 * 60 * 60,
  });
}

interface GithubRelease {
  tag_name: string;
}

const styles = {
  form: css`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 1rem;
    max-width: 30rem;
  `,
};

interface ProjectTabProps {
  settings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
}

function ProjectTab({ settings, onChange }: ProjectTabProps) {
  const availableVersions = useVersions();

  function handleVersionChange(version: string) {
    onChange({
      ...settings,
      k6: {
        ...settings.k6,
        version,
      },
    });
  }

  return (
    <div className="px-10 py-8">
      <SettingsSection heading="General">
        <div className={styles.form}>
          <Label htmlFor="k6-version">k6 Version</Label>
          <Select value={settings.k6.version} onValueChange={handleVersionChange}>
            <SelectTrigger>
              <SelectValue id="k6-version"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              {availableVersions.data?.map((version) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>
      <SettingsSection heading="Extensions">
        Add additional functionality to k6 by installing extensions.
      </SettingsSection>
    </div>
  );
}

export { ProjectTab };
