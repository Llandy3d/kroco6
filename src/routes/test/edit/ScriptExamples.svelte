<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as scripts from "$lib/example-scripts";
  import { ChevronDown } from "lucide-svelte";

  export let onSelectExample: (script: string) => void;
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button size="sm" variant="ghost"
      >Script examples
      <ChevronDown class="ml-2 h-4 w-4" />
    </Button></DropdownMenu.Trigger
  >
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>Authentication/Authorization</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item on:click={() => onSelectExample(scripts.BASIC_AUTHENTICATION)}
        >Basic Authentication</DropdownMenu.Item
      >
      <DropdownMenu.Item on:click={() => onSelectExample(scripts.DIGEST_AUTHENTICATION)}
        >Digest Authentication</DropdownMenu.Item
      >
    </DropdownMenu.Group>
    <DropdownMenu.Group>
      <DropdownMenu.Label>API CRUD operations</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item on:click={() => onSelectExample(scripts.CORE_K6_API)}
        >Core k6 APIs example</DropdownMenu.Item
      >
    </DropdownMenu.Group>
    <DropdownMenu.Group>
      <DropdownMenu.Label>Cookies</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item on:click={() => onSelectExample(scripts.COOKIES_HEADER)}
        >Accessing a cookie set in response headers</DropdownMenu.Item
      >
      <DropdownMenu.Item on:click={() => onSelectExample(scripts.COOKIES_LOG_RESPONSE)}
        >Logging all cookies in response</DropdownMenu.Item
      >
      <DropdownMenu.Item on:click={() => onSelectExample(scripts.COOKIES_SET_JAR)}
        >Setting a cookie in VU cookie jar</DropdownMenu.Item
      >
    </DropdownMenu.Group>
    <DropdownMenu.Group>
      <DropdownMenu.Label>Correlation</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item on:click={() => onSelectExample(scripts.EXTRACT_JSON)}
        >Extracting values from JSON response</DropdownMenu.Item
      >
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
