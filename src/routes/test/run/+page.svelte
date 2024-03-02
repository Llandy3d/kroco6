<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import { Loader2 } from "lucide-svelte";

  let title = "Running your script...";
  let result = "";

  invoke<string>("run_script", {})
    .then((response) => {
      title = "Done!";
      result = response;
    })
    .catch((error) => {
      console.log(error);
    });

  function tryVisitDashboard() {
    window.location.href = "http://localhost:5665";

    setTimeout(tryVisitDashboard, 1000);
  }

  tryVisitDashboard();
</script>

<div class="flex flex-col">
  <p class="text-2xl">{title}</p>
  <!-- <pre>{result}</pre> -->
  <Loader2 class="mt-1 animate-spin" />
</div>
