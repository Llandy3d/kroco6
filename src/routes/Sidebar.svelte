<script lang="ts">
  import { type EnvironmentsData } from "$lib/backend-client";
  import EnvironmentList from "$lib/components/EnvironmentList.svelte";
  import TestList from "$lib/components/TestList.svelte";
  import Logo from "$lib/components/ui/illustrations/Logo.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import { tests } from "$lib/stores/tests";
  import { ExternalLink } from "lucide-svelte";
  import ProjectSelector from "./ProjectSelector.svelte";
  import SidebarSection from "./SidebarSection.svelte";

  // envs holds the active environment and the list of environments
  // that the user can switch between.
  //
  // This is provided to us by the backend tauri app, and is assumed to
  // be loaded, and most likely bounded from by the parent loading this
  // specific component.
  export let environmentsData: EnvironmentsData = { active: "default", environments: [] };

  $: environments = environmentsData?.environments;
</script>

<div class="flex h-screen flex-col gap-4 p-4 text-center">
  <Logo class="self-center" />
  <Separator />
  <ProjectSelector />

  <SidebarSection title={`Tests (${$tests.length})`}>
    <TestList tests={$tests} />
  </SidebarSection>
  <SidebarSection title="Environments">
    <EnvironmentList bind:environments />
  </SidebarSection>
  <SidebarSection title="Discover">
    <div class="mt-1 flex flex-col items-start text-sm">
      <a
        href="https://grafana.com/docs/k6/latest/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1 py-[4px]"><ExternalLink size="12" />k6 OSS docs</a
      >
      <a
        href="https://grafana.com/docs/k6/latest/javascript-api/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1 py-[4px]"><ExternalLink size="12" />k6 JavaScript API</a
      >
      <a
        href="https://grafana.com/docs/k6/latest/misc/integrations/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1 py-[4px]"><ExternalLink size="12" />Integrations</a
      >
    </div>
  </SidebarSection>
</div>
