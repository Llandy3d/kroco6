import { detachBlock, updateBlock } from "@/lib/stores/blocks";
import type { GroupBlock as GroupBlockType } from "@/lib/stores/blocks/model/loose";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/views/editor/tabs/blocks-editor/AnyBlock";
import { useSetTest } from "@/views/editor/tabs/blocks-editor/atoms";
import { STEP_COLOR } from "@/views/editor/tabs/blocks-editor/colors";
import { StringInput } from "@/views/editor/tabs/blocks-editor/inputs/StringInput";
import { Block } from "@/views/editor/tabs/blocks-editor/primitives/Block";
import { Collection } from "@/views/editor/tabs/blocks-editor/primitives/Collection";
import { Field } from "@/views/editor/tabs/blocks-editor/primitives/Field";

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
        connected: block.next,
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
          connected: block.step,
          accepts: isStepBlock,
        }}
        color={STEP_COLOR}
      />
    </Block>
  );
}

export { GroupBlock };
