<script lang="ts" generics="Dropped, Target">
  import { dropzone, type AcceptingEvent, type DroppedEvent, type DroppingEvent } from "../dnd";

  export let connected = false;

  export let data: Target;

  export let accepts: (value: unknown) => value is Dropped;
  export let onDrop: (ev: DroppedEvent<Dropped, Target>) => void;

  let accepting = false;
  let dropping = false;
  let height = 0;

  function handleAccepting(ev: CustomEvent<AcceptingEvent<Dropped>>) {
    accepting = ev.detail.accepting;
    height = ev.detail.source?.node.getBoundingClientRect().height ?? 0;
  }

  function handleDropping(ev: CustomEvent<DroppingEvent<Dropped>>) {
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
    class="absolute max-h-4 w-full"
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
    top: 3px;
    left: 58px;
    fill: var(--block-bg-primary);
  }

  .dropping {
    position: relative;
    background-color: #000;
    max-height: none;
    opacity: 0.2;
  }

  .connected {
  }
</style>
