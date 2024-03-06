<script lang="ts">
  import { createProject } from "$lib/backend-client";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { activeProject, projects } from "$lib/stores/projects";

  let projectName = "";

  async function onCreateProject() {
    const createdProject = await createProject(projectName);
    projects.update((p) => [...p, createdProject]);
    $activeProject = createdProject.name;
    projectName = "";
    open = false;
  }

  export let open: boolean;
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Create new project</AlertDialog.Title>
      <AlertDialog.Description>
        <Input class="w-full" type="text" placeholder="Project name" bind:value={projectName} />
      </AlertDialog.Description>
    </AlertDialog.Header>

    <AlertDialog.Footer>
      <AlertDialog.Cancel>Close</AlertDialog.Cancel>
      <Button type="submit" on:click={onCreateProject}>Create</Button>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
