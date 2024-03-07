<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner";
  import { onMount } from "svelte";
  import "../app.pcss";
  import Sidebar from "./Sidebar.svelte";

  import { listProjects, loadEnvironments, type EnvironmentsData } from "$lib/backend-client";
  import { currentEnvironment, projects } from "$lib/stores/projects";
  import { invoke } from "@tauri-apps/api";
  import { setMode } from "mode-watcher";

  let environmentsData: EnvironmentsData = {
    active: "",
    environments: [],
  };

  onMount(async () => {
    const projectsList = await listProjects();
    projects.update(() => projectsList);

    environmentsData = await loadEnvironments();

    console.log(`loaded envs:`, environmentsData);

    invoke("close_splashscreen");
  });

  onMount(() => {
    setMode("light");
  });

  $: currentEnvironment.set(
    environmentsData.environments.find((e) => e.name === environmentsData.active) ?? null,
  );
</script>

<Toaster />

<div class="flex">
  <div class="w-60">
    <Sidebar bind:environmentsData />
  </div>

  <div class="flex flex-auto flex-col bg-[#F9F8FC] p-4">
    <slot />
  </div>
</div>
