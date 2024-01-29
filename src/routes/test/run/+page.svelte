<script>
  import { invoke } from '@tauri-apps/api/tauri'

  let title = "Running your script...";
  let result = "";

  invoke('run_script', {})
    .then((response) => {
        title = "Done!"
        result = response
    })
    .catch((error) => {
        console.log(error)
    })
</script>

<p class="text-2xl">{title}</p>
<pre>{result}</pre>
