import { detachBlock, updateBlock } from "@/lib/stores/blocks";
import { type CheckBlock as CheckBlockType } from "@/lib/stores/blocks/model/loose";
import type { Check } from "@/lib/stores/blocks/model/strict";
import { isHttpRequestBlock, isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { CheckInput } from "@/routes/test/edit/blocks/CheckInput";
import { useSetTest } from "@/routes/test/edit/blocks/atoms";
import { STEP_COLOR } from "@/routes/test/edit/blocks/colors";
import { Block } from "@/routes/test/edit/blocks/primitives/Block";
import { BlockInset } from "@/routes/test/edit/blocks/primitives/BlockInset";
import { Field } from "@/routes/test/edit/blocks/primitives/Field";
import { PlusSquare } from "lucide-react";
import { nanoid } from "nanoid";

interface CheckBlockProps {
  block: CheckBlockType;
}

function CheckBlock({ block }: CheckBlockProps) {
  const setTest = useSetTest();

  function handleCheckChange(target: Check) {
    setTest((test) =>
      updateBlock(test, {
        ...block,
        checks: block.checks.map((check) => (check.id === target.id ? target : check)),
      }),
    );
  }

  function handleAddCheck() {
    const newCheck: Check = {
      type: "status",
      id: nanoid(),
      value: 200,
    };

    setTest((test) =>
      updateBlock(test, {
        ...block,
        checks: [...block.checks, newCheck],
      }),
    );
  }

  function handleRemoveCheck(target: Check) {
    setTest((test) =>
      updateBlock(test, {
        ...block,
        checks: block.checks.filter((check) => check.id !== target.id),
      }),
    );
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
        action: { type: "attach-step", target: block },
        connected: block.next,
        accepts: isStepBlock,
      }}
      onDelete={handleDelete}
    >
      <Field>
        Check that{" "}
        <BlockInset
          owner={block}
          color={STEP_COLOR}
          connection={{
            key: "target",
            node: <AnyBlock block={block.target} />,
            action: {
              type: "assign-check-target",
              target: block,
            },
            connected: block.target,
            accepts: isHttpRequestBlock,
          }}
        />
      </Field>
      {block.checks.map((check) => {
        return (
          <CheckInput
            key={check.id}
            check={check}
            onChange={handleCheckChange}
            onRemove={handleRemoveCheck}
          />
        );
      })}
      <Field>
        <button onClick={handleAddCheck}>
          <PlusSquare size={14} />
        </button>
      </Field>
    </Block>
  );
}

export { CheckBlock };
