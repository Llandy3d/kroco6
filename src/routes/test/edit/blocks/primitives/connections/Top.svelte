<script lang="ts">
</script>

<div class="top">
  <div class="left-fill"></div>
  <div class="relative w-4">
    <svg class="absolute block w-4" viewBox="0 0 100 50">
      <line x1="0" y1="0" x2="50" y2="40" stroke-width="6" stroke="currentColor" />
      <line x1="50" y1="40" x2="100" y2="0" stroke-width="6" stroke="currentColor" />
    </svg>
  </div>
  <div class="right-fill"></div>
</div>

<style>
  .top {
    display: flex;
    color: var(--block-bg-primary);
  }

  :global(.block-inset) .top {
    display: none;
  }

  .top > .left-fill {
    border-top: 1px solid var(--block-bg-primary);
    width: 32px;
  }

  .top > .right-fill {
    flex: 1 1 auto;
    border-top: 1px solid var(--block-bg-primary);
  }
</style>
