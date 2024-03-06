<script lang="ts">
</script>

<div class="top">
  <div class="left-fill"></div>
  <svg viewBox="0 0 100 50">
    <polygon points="0,0 0,51 100,51 100,0 51,25" />
  </svg>
  <div class="right-fill"></div>
</div>

<style>
  .top {
    display: flex;
  }

  :global(.block-inset) .top {
    display: none;
  }

  .top > .left-fill {
    background: var(--block-bg-primary);
    width: 32px;
  }

  .top > .right-fill {
    flex: 1 1 auto;
    background: var(--block-bg-primary);
    border-top-right-radius: 4px;
  }

  .top > svg {
    display: block;
    width: 16px;
    fill: var(--block-bg-primary);
  }
</style>
