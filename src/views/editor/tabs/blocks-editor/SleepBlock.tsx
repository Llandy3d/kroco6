import { detachBlock, updateBlock } from "@/lib/stores/blocks";
import type { SleepBlock as SleepBlockType } from "@/lib/stores/blocks/model/loose";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/views/editor/tabs/blocks-editor/AnyBlock";
import { useSetTest } from "@/views/editor/tabs/blocks-editor/atoms";
import { STEP_COLOR } from "@/views/editor/tabs/blocks-editor/colors";
import { StringInput } from "@/views/editor/tabs/blocks-editor/inputs/StringInput";
import { Block } from "@/views/editor/tabs/blocks-editor/primitives/Block";
import { Field } from "@/views/editor/tabs/blocks-editor/primitives/Field";

interface SleepBlockProps {
  block: SleepBlockType;
}

function SleepBlock({ block }: SleepBlockProps) {
  const setTest = useSetTest();

  function handleSecondsChange(value: string) {
    setTest((test) => {
      return updateBlock(test, {
        ...block,
        seconds: +value,
      });
    });
  }

  function handleDelete() {
    setTest((test) => {
      return detachBlock(test, block);
    });
  }

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
        Wait for{" "}
        <StringInput
          size={3}
          value={block.seconds}
          onChange={handleSecondsChange}
        />{" "}
        seconds
      </Field>
    </Block>
  );
}

export { SleepBlock };
