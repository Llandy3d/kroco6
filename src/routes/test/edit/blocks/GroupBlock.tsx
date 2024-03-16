import { detachBlock, updateBlock } from "@/lib/stores/blocks";
import type { GroupBlock as GroupBlockType } from "@/lib/stores/blocks/model/loose";
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

  function handleDelete() {
    // TODO: put steps on canvas and connect top and bottom connection.
    setTest((test) => {
      return detachBlock(test, block);
    });
  }

  return (
    <Block
      block={block}
      top={true}
      color={STEP_COLOR}
      bottom={{
        key: `${block.id}-next`,
        node: <AnyBlock block={block.next} />,
        action: {
          type: "attach-step",
          target: block,
        },
        accepts: isStepBlock,
      }}
      onDelete={handleDelete}
    >
      <Field>
        Grouped as <StringInput value={block.name} onChange={handleNameChange} />
      </Field>
      <Field>do the following:</Field>
      <Collection
        owner={block}
        connection={{
          key: `child`,
          node: <AnyBlock block={block.step} />,
          action: {
            type: "attach-child",
            target: block,
          },
          accepts: isStepBlock,
        }}
        color={STEP_COLOR}
      />
    </Block>
  );
}

export { GroupBlock };
