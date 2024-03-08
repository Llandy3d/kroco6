import { insertNext, updateBlock } from "@/lib/stores/blocks";
import type {
  Block as BlockType,
  SleepBlock as SleepBlockType,
} from "@/lib/stores/blocks/model/loose";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { useSetTest } from "@/routes/test/edit/blocks/atoms";
import { STEP_COLOR } from "@/routes/test/edit/blocks/colors";
import { StringInput } from "@/routes/test/edit/blocks/inputs/StringInput";
import { Block } from "@/routes/test/edit/blocks/primitives/Block";
import { Field } from "@/routes/test/edit/blocks/primitives/Field";

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

  function handleNextDrop(next: BlockType) {
    if (!isStepBlock(next)) {
      return;
    }

    setTest((test) => insertNext(test, block, next));
  }

  return (
    <Block
      block={block}
      color={STEP_COLOR}
      top={true}
      bottom={{ block: block.next, accepts: isStepBlock, onDrop: handleNextDrop }}
      Next={AnyBlock}
    >
      <Field>
        Wait for <StringInput size={3} value={block.seconds} onChange={handleSecondsChange} />{" "}
        seconds
      </Field>
    </Block>
  );
}

export { SleepBlock };
