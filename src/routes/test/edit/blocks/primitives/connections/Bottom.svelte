<script>
  let className = "";
  export let collection = false;

  export { className as class };
</script>

<div class="bottom relative shadow-md shadow-slate-400" class:collection>
  <svg
    width="16px"
    height="8px"
    class={className}
    viewBox="0 0 100 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="0,0 100,0 50,25" />
  </svg>
</div>

<style>
  .bottom {
    height: 4px;
    background-color: var(--block-bg-primary);
    border-bottom-right-radius: 4px;
  }

  .collection svg {
    left: 58px;
  }

  svg {
    position: absolute;
    top: 100%;
    left: 32px;
    fill: var(--block-bg-primary);
  }
</style>
