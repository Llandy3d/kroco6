<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Code } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';

	export let script: string;
</script>

<Alert.Root>
	<Code class="h-4 w-4" />
	<Alert.Title>Script to be executed</Alert.Title>
	<Alert.Description>
		Who knows, maybe in the future I might allow you to edit it in here :)
	</Alert.Description>
</Alert.Root>

<Card.Root class="my-6 p-4">
	<Card.Content>
		<pre>{script ? script : 'no script yet :('}</pre>
	</Card.Content>
</Card.Root>