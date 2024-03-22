import { detachBlock, updateBlock } from "@/lib/stores/blocks";
import type { HttpRequestBlock as HttpRequestBlockType } from "@/lib/stores/blocks/model/loose";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { HTTP_METHODS } from "@/lib/stores/library/constants";
import { AnyBlock } from "@/views/editor/tabs/blocks-editor/AnyBlock";
import { useSetTest } from "@/views/editor/tabs/blocks-editor/atoms";
import { STEP_COLOR } from "@/views/editor/tabs/blocks-editor/colors";
import { SelectInput } from "@/views/editor/tabs/blocks-editor/inputs/SelectInput";
import { StringInput } from "@/views/editor/tabs/blocks-editor/inputs/StringInput";
import { Block } from "@/views/editor/tabs/blocks-editor/primitives/Block";
import { Field } from "@/views/editor/tabs/blocks-editor/primitives/Field";

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
    const newBlock = { ...block, method };

    setTest((test) => {
      return updateBlock(test, newBlock);
    });
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
      bottom={{
        key: `next`,
        node: <AnyBlock block={block.next} />,
        action: {
          type: "attach-step",
          target: block,
        },
        connected: block.next,
        accepts: isStepBlock,
      }}
      onDelete={handleDelete}
    >
      <Field>
        <SelectInput value={block.method} items={methods} onChange={handleMethodChange} />
        <StringInput
          placeholder="Url"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          value={block.url}
          onChange={handleUrlChange}
        />
      </Field>
    </Block>
  );
}

export { HttpRequestBlock };
