<script lang="ts">
  export let title: string;
</script>

<section>
  <h2 class="text-left text-sm font-bold uppercase">{title}</h2>
  <slot />
</section>
