<script lang="ts" generics="Dropped, Target">
  import { dropzone, type DroppedEvent, type DroppingEvent, type AcceptingEvent } from "../dnd";

  export let connected = false;

  export let data: Target;
  export let accepts: string[] | undefined = undefined;
  export let onDrop: (ev: DroppedEvent<any, Target>) => void;

  let accepting = false;
  let dropping = false;
  let height = 0;

  function handleAccepting(ev: CustomEvent<AcceptingEvent>) {
    if (ev.detail.source !== null && ev.detail.source?.data === data) {
      return;
    }

    accepting = ev.detail.accepting;
    height = ev.detail.source?.node.getBoundingClientRect().height ?? 0;
  }

  function handleDropping(ev: CustomEvent<DroppingEvent>) {
    dropping = ev.detail.dropping;
  }

  function handleDropped(ev: CustomEvent<DroppedEvent<Dropped, Target>>) {
    onDrop(ev.detail);

    accepting = false;
    dropping = false;
    height = 0;
  }
</script>

<div class="bottom relative shadow-md shadow-slate-400">
  <svg width="16px" height="8px" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,0 100,0 50,25" />
  </svg>
</div>
<div class="relative">
  <div
    class="absolute w-full"
    class:connected
    class:dropping
    style={`height: ${height}px`}
    use:dropzone={{ accepts, data }}
    on:accepting={handleAccepting}
    on:dropping={handleDropping}
    on:dropped={handleDropped}
  ></div>
</div>

<style>
  .bottom {
    height: 4px;
    background-color: var(--block-bg-primary);
    border-bottom-right-radius: 4px;
  }

  svg {
    position: absolute;
    top: 100%;
    left: 58px;
    fill: var(--block-bg-primary);
  }

  .dropping {
    position: relative;
    background-color: #000;
    opacity: 0.2;
  }

  .connected {
    max-height: 16px;
  }
</style>
