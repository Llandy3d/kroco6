import { insertNext, insertStep, updateBlock } from "@/lib/stores/blocks";
import type {
  Block as BlockType,
  GroupBlock as GroupBlockType,
} from "@/lib/stores/blocks/model/loose";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { useSetTest } from "@/routes/test/edit/blocks/atoms";
import { STEP_COLOR } from "@/routes/test/edit/blocks/colors";
import { StringInput } from "@/routes/test/edit/blocks/inputs/StringInput";
import { Block } from "@/routes/test/edit/blocks/primitives/Block";
import { Collection } from "@/routes/test/edit/blocks/primitives/Collection";
import { Field } from "@/routes/test/edit/blocks/primitives/Field";

interface GroupBlockProps {
  block: GroupBlockType;
}

function GroupBlock({ block }: GroupBlockProps) {
  const setTest = useSetTest();

  function handleNameChange(value: string) {
    setTest((test) =>
      updateBlock(test, {
        ...block,
        name: value,
      }),
    );
  }

  function handleDropStep(step: BlockType) {
    if (!isStepBlock(step)) {
      return;
    }

    setTest((test) => insertStep(test, block, step));
  }

  function handleDropNext(next: BlockType) {
    if (!isStepBlock(next)) {
      return;
    }

    setTest((test) => insertNext(test, block, next));
  }

  return (
    <Block
      block={block}
      top={true}
      color={STEP_COLOR}
      bottom={{ block: block.next, accepts: isStepBlock, onDrop: handleDropNext }}
      Next={AnyBlock}
    >
      <Field>
        Grouped as <StringInput value={block.name} onChange={handleNameChange} />
      </Field>
      <Field>do the following:</Field>
      <Collection
        owner={block}
        connection={{ block: block.step, accepts: isStepBlock, onDrop: handleDropStep }}
        color={STEP_COLOR}
      >
        {block.next && <AnyBlock block={block.next} />}
      </Collection>
    </Block>
  );
}

export { GroupBlock };
