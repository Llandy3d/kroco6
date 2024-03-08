import { EnvironmentList } from "@/components/EnvironmentList";
import { TestList } from "@/components/TestList";
import { Logo } from "@/components/illustrations/Logo";
import { Separator } from "@/components/ui/separator";
import type { Environment, EnvironmentsData, Project, Test } from "@/lib/backend-client";
import { ExternalLink } from "lucide-react";
import { ProjectSelector } from "./ProjectSelector";
import { SidebarSection } from "./SidebarSection";

interface SidebarProps {
  tests: Test[];
  projects: Project[];
  environments: EnvironmentsData;
}

function Sidebar({ projects, tests, environments }: SidebarProps) {
  const active: Project = { name: "" };

  function handleEnvironmentsChange(_environments: Environment[]) {}

  function handleActiveProjectChange(_project: Project) {}

  function handleCreateProject(_project: Project) {}

  return (
    <div className="flex h-screen flex-col gap-4 p-4 text-center">
      <Logo className="self-center" />
      <Separator />
      <ProjectSelector
        active={active}
        projects={projects}
        onChange={handleActiveProjectChange}
        onCreate={handleCreateProject}
      />

      <SidebarSection title={`Tests (${tests.length})`}>
        <TestList tests={tests} />
      </SidebarSection>
      <SidebarSection title="Environments">
        <EnvironmentList
          environments={environments.environments}
          onChange={handleEnvironmentsChange}
        />
      </SidebarSection>
      <SidebarSection title="Discover" className="mt-auto pb-2">
        <div className="mt-1 flex flex-col items-start text-sm">
          <a
            href="https://grafana.com/docs/k6/latest/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 py-[4px]"
          >
            <ExternalLink size="12" />
            k6 OSS docs
          </a>
          <a
            href="https://grafana.com/docs/k6/latest/javascript-api/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 py-[4px]"
          >
            <ExternalLink size="12" />
            k6 JavaScript API
          </a>
          <a
            href="https://grafana.com/docs/k6/latest/misc/integrations/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 py-[4px]"
          >
            <ExternalLink size="12" />
            Integrations
          </a>
        </div>
      </SidebarSection>
    </div>
  );
}

export { Sidebar };
