<script lang="ts">
</script>

<div class="top">
  <div class="left-fill"></div>
  <svg viewBox="0 0 100 50">
    <polygon points="0,0 0,50 100,50 100,0 50,30" />
  </svg>
  <div class="right-fill"></div>
</div>

<style>
  .top {
    display: flex;
  }

  .top > .left-fill {
    background: var(--block-bg-primary);
    width: 32px;
  }

  .top > .right-fill {
    flex: 1 1 auto;
    background: var(--block-bg-primary);
  }

  .top > svg {
    display: block;
    width: 16px;
    fill: var(--block-bg-primary);
  }
</style>
