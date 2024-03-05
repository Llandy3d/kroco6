<script lang="ts">
  import { insertNext, test, updateBlock } from "$lib/stores/blocks";
  import type { Block as BlockType, HttpRequestBlock } from "$lib/stores/blocks/model/loose";
  import { isStepBlock } from "$lib/stores/blocks/utils";
  import { HTTP_METHODS } from "$lib/stores/library/constants";
  import { STEP_COLOR } from "./colors";
  import SelectInput from "./inputs/SelectInput.svelte";
  import StringInput from "./inputs/StringInput.svelte";
  import Block from "./primitives/Block.svelte";
  import Field from "./primitives/Field.svelte";
  export let block: HttpRequestBlock;

  function handleUrlChange(value: string) {
    test.update((test) => {
      return updateBlock(test, {
        ...block,
        url: value,
      });
    });
  }

  function handleMethodChange(method: string) {
    test.update((test) => {
      return updateBlock(test, {
        ...block,
        method,
      });
    });
  }

  function handleNextDrop(next: BlockType) {
    if (!isStepBlock(next)) {
      return;
    }

    test.update((test) => insertNext(test, block, next));
  }

  const methods = HTTP_METHODS.map((method) => ({ value: method, label: method.toUpperCase() }));
</script>

<Block
  {block}
  color={STEP_COLOR}
  top={true}
  bottom={{ block: block.next, accepts: isStepBlock, onDrop: handleNextDrop }}
>
  <Field
    ><SelectInput value={block.method} items={methods} onChange={handleMethodChange} />
    <StringInput placeholder="Url" value={block.url} onChange={handleUrlChange} /></Field
  >
</Block>
