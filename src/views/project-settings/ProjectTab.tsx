import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { installVersion, isVersionInstalled, type Version } from "@/lib/backend-client";
import type { ProjectSettings } from "@/schemas/project";
import { SettingsSection } from "@/views/project-settings/SettingsSection";
import { css } from "@emotion/css";
import { useQuery } from "@tanstack/react-query";
import { os } from "@tauri-apps/api";
import { fetch, type Response } from "@tauri-apps/api/http";
import { Check, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function toArchString(arch: os.Arch) {
  switch (arch) {
    case "x86_64":
      return "amd64";

    case "aarch64":
      return "arm64";

    default:
      throw new Error(`Unsupported architecture: ${arch}. This should not happen. :/`);
  }
}

function toOSString(os: os.OsType) {
  switch (os) {
    case "Linux":
      return "linux";

    case "Darwin":
      return "macos";

    case "Windows_NT":
      return "windows";

    default:
      throw new Error(`Unsupported OS: ${os}. This should not happen. :/`);
  }
}

interface SystemInfo {
  os: string;
  format: string;
  arch: string;
}

async function getSystemInfo() {
  const [type, arch] = await Promise.all([os.type(), os.arch()]);

  return {
    os: toOSString(type),
    format: type === "Linux" ? "tar.gz" : "zip",
    arch: toArchString(arch),
  };
}

function formatAssetName(tag: string, info: SystemInfo) {
  return `k6-${tag}-${info.os}-${info.arch}`;
}

function useVersions() {
  return useQuery({
    queryKey: ["k6-versions"],
    queryFn: async () => {
      const [response, info] = await Promise.all([
        fetch("https://api.github.com/repos/grafana/k6/releases", {
          method: "GET",
          headers: { "User-Agent": "k6-ui" },
        }) as Promise<Response<GithubRelease[]>>,
        getSystemInfo(),
      ]);

      return response.data.flatMap((release) => {
        const name = formatAssetName(release.tag_name, info);
        const asset = release.assets.find((asset) => asset.name.startsWith(name));

        if (asset === undefined) {
          return [];
        }

        return {
          version: release.tag_name,
          name: name,
          url: asset.browser_download_url,
        } satisfies Version;
      });
    },
    staleTime: 1000 * 60 * 60,
  });
}

function findTargetVersion(availableVersions: Version[], target: string) {
  return availableVersions.find((version) => {
    return version.version === target;
  });
}

interface GithubRelease {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

const styles = {
  form: css`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 1rem;
    max-width: 30rem;
  `,
  version: css`
    display: grid;
    grid-template-columns: auto 8rem 1fr;
    align-items: center;
    gap: 1rem;
    max-width: 50rem;
  `,
};

type InstallState = "installed" | "not-installed" | "checking" | "installing";

interface ProjectTabProps {
  settings: ProjectSettings;
  onChange: (settings: ProjectSettings) => void;
}

function ProjectTab({ settings, onChange }: ProjectTabProps) {
  const { data: availableVersions } = useVersions();
  const [isInstalled, setIsInstalled] = useState<InstallState>("checking");

  function handleVersionChange(version: string) {
    onChange({
      ...settings,
      k6: {
        ...settings.k6,
        version,
      },
    });
  }

  function handleInstall() {
    if (availableVersions === undefined) {
      return;
    }

    setIsInstalled("installing");

    const targetVersion = findTargetVersion(availableVersions, settings.k6.version);

    if (targetVersion === undefined) {
      return;
    }

    installVersion(targetVersion)
      .then(() => setIsInstalled("installed"))
      .catch((err) => {
        console.error(err);

        setIsInstalled("not-installed");
      });
  }

  useEffect(() => {
    if (availableVersions === undefined) {
      return;
    }

    const targetVersion = findTargetVersion(availableVersions, settings.k6.version);

    if (targetVersion === undefined) {
      return;
    }

    setIsInstalled("checking");

    isVersionInstalled(targetVersion.version)
      .then((installed) => {
        setIsInstalled(installed ? "installed" : "not-installed");
      })
      .catch(() => setIsInstalled("not-installed"));
  }, [settings.k6.version, availableVersions]);

  return (
    <div className="px-10 py-8">
      <SettingsSection heading="General">
        <div className={styles.version}>
          <Label htmlFor="k6-version">k6 Version</Label>
          <Select
            disabled={availableVersions === undefined}
            value={settings.k6.version}
            onValueChange={handleVersionChange}
          >
            <SelectTrigger>
              <SelectValue id="k6-version" />
            </SelectTrigger>
            <SelectContent>
              {availableVersions?.map((version) => (
                <SelectItem key={version.version} value={version.version}>
                  {version.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="flex items-center gap-2 text-sm">
            {isInstalled === "checking" && (
              <>
                <Loader2 size={14} className="animate-spin" /> Checking version availability...
              </>
            )}
            {isInstalled === "installed" && (
              <>
                <Check size={14} /> Installed
              </>
            )}
            {isInstalled === "not-installed" && (
              <Button className="flex gap-2" onClick={handleInstall}>
                <Download size={14} /> Install
              </Button>
            )}
            {isInstalled === "installing" && (
              <Button disabled={true} className="flex gap-2">
                <Loader2 size={14} className="animate-spin" /> Installing...
              </Button>
            )}
          </span>
        </div>
      </SettingsSection>
      <SettingsSection heading="Extensions">
        Add additional functionality to k6 by installing extensions.
      </SettingsSection>
    </div>
  );
}

export { ProjectTab };
