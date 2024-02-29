<script>
	import { Button } from '$lib/components/ui/button';
</script>

<li>
	<Button
		variant="outline"
		class="w-full justify-start rounded-none bg-slate-800 hover:bg-slate-700"
		><div><slot /></div></Button
	>
</li>
