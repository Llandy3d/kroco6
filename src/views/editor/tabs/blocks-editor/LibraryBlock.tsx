import { detachBlock } from "@/lib/stores/blocks";
import type { LibraryBlock as LibraryBlockType } from "@/lib/stores/blocks/model/loose";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/views/editor/tabs/blocks-editor/AnyBlock";
import { useSetTest } from "@/views/editor/tabs/blocks-editor/atoms";
import { STEP_COLOR } from "@/views/editor/tabs/blocks-editor/colors";
import { StringInput } from "@/views/editor/tabs/blocks-editor/inputs/StringInput";
import { Block } from "@/views/editor/tabs/blocks-editor/primitives/Block";
import { Field } from "@/views/editor/tabs/blocks-editor/primitives/Field";

interface LibraryBlockProps {
  block: LibraryBlockType;
}

export function LibraryBlock({ block }: LibraryBlockProps) {
  const setTest = useSetTest();

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
        action: { type: "attach-step", target: block },
        connected: block.next,
        accepts: isStepBlock,
      }}
      onDelete={handleDelete}
    >
      <Field>{block.name}</Field>
      {Object.entries(block.parameters).map(([key, param]) => {
        return (
          <Field key={key}>
            {key}:{" "}
            {param.type === "string" && (
              <StringInput value={param.value} onChange={() => {}} />
            )}
          </Field>
        );
      })}
    </Block>
  );
}
