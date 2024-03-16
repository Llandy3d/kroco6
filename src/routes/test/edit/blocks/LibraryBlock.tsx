import { detachBlock } from "@/lib/stores/blocks";
import type { LibraryBlock as LibraryBlockType } from "@/lib/stores/blocks/model/loose";
import { isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { useSetTest } from "@/routes/test/edit/blocks/atoms";
import { STEP_COLOR } from "@/routes/test/edit/blocks/colors";
import { StringInput } from "@/routes/test/edit/blocks/inputs/StringInput";
import { Block } from "@/routes/test/edit/blocks/primitives/Block";
import { Field } from "@/routes/test/edit/blocks/primitives/Field";

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
        accepts: isStepBlock,
      }}
      onDelete={handleDelete}
    >
      <Field>{block.name}</Field>
      {Object.entries(block.parameters).map(([key, param]) => {
        return (
          <Field key={key}>
            {key}:{" "}
            {param.type === "string" && <StringInput value={param.value} onChange={() => {}} />}
          </Field>
        );
      })}
    </Block>
  );
}
