<script lang="ts">
  import { invoke } from "@tauri-apps/api";
  import { setMode } from "mode-watcher";
  import { onMount } from "svelte";
  import Editor from "./test/edit/Editor.svelte";
  import { toast } from "svelte-sonner";

  onMount(() => {
    setMode("light");

    invoke("close_splashscreen");

    ensure_k6_executable_installed();
  });

  async function ensure_k6_executable_installed() {
    const is_k6_installed = await invoke("is_k6_executable_installed");

    // if k6 is installed we return early, otherwise we install it
    if (is_k6_installed) {
      return;
    }

    // the download process is showcased with a toast
    const installToastId = toast.loading("Installing k6...", {
      duration: Number.POSITIVE_INFINITY
    });
    invoke("download_k6_executable")
      .then(() => {
        toast.success("Successfully installed k6", {
          duration: 5000,
          id: installToastId,
        });
      })
      .catch((error) => {
        toast.error("Failed to install k6", {
          description: error,
          id: installToastId,
          action: {
              label: 'Retry',
            onClick: () => {
              toast.dismiss(installToastId);
              ensure_k6_executable_installed();
            },
            }
        });
      });
  }
</script>

<Editor />
