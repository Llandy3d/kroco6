<script>
  import * as Alert from "$lib/components/ui/alert";
  import { Code } from "lucide-svelte";
</script>


<Alert.Root>
  <Code class="h-4 w-4" />
  <Alert.Title>Script to be executed</Alert.Title>
  <Alert.Description>
    Who knows, maybe in the future I might allow you to edit it in here :)
  </Alert.Description>
</Alert.Root>
