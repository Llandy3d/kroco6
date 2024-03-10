import { detachBlock, insertNext, updateBlock } from "@/lib/stores/blocks";
import type {
  Block as BlockType,
  HttpRequestBlock as HttpRequestBlockType,
} from "@/lib/stores/blocks/model/loose";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { HTTP_METHODS } from "@/lib/stores/library/constants";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { useSetTest } from "@/routes/test/edit/blocks/atoms";
import { STEP_COLOR } from "@/routes/test/edit/blocks/colors";
import { SelectInput } from "@/routes/test/edit/blocks/inputs/SelectInput";
import { StringInput } from "@/routes/test/edit/blocks/inputs/StringInput";
import { Block } from "@/routes/test/edit/blocks/primitives/Block";
import { Field } from "@/routes/test/edit/blocks/primitives/Field";

interface HttpRequestBlockProps {
  block: HttpRequestBlockType;
}

function HttpRequestBlock({ block }: HttpRequestBlockProps) {
  const setTest = useSetTest();

  function handleUrlChange(value: string) {
    setTest((test) => {
      return updateBlock(test, {
        ...block,
        url: value,
      });
    });
  }

  function handleMethodChange(method: string) {
    setTest((test) => {
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

    setTest((test) => insertNext(test, block, next));
  }

  function handleDelete() {
    setTest((test) => {
      return detachBlock(test, block);
    });
  }

  const methods = HTTP_METHODS.map((method) => ({ value: method, label: method.toUpperCase() }));

  return (
    <Block
      block={block}
      color={STEP_COLOR}
      top={true}
      bottom={{ block: block.next, accepts: isStepBlock, onDrop: handleNextDrop }}
      Next={AnyBlock}
      onDelete={handleDelete}
    >
      <Field>
        <SelectInput value={block.method} items={methods} onChange={handleMethodChange} />
        <StringInput placeholder="Url" value={block.url} onChange={handleUrlChange} />
      </Field>
    </Block>
  );
}

export { HttpRequestBlock };
