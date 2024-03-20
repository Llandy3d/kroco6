import { detachBlock, updateBlock } from "@/lib/stores/blocks";
import type { ScenarioBlock as ScenarioBlockType } from "@/lib/stores/blocks/model/loose";
import { isExecutorBlock, isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/views/blocks-editor/AnyBlock";
import { useSetTest } from "@/views/blocks-editor/atoms";
import { EXECUTOR_COLOR, STEP_COLOR } from "@/views/blocks-editor/colors";
import { StringInput } from "@/views/blocks-editor/inputs/StringInput";
import { Block } from "@/views/blocks-editor/primitives/Block";
import { BlockInset } from "@/views/blocks-editor/primitives/BlockInset";
import { Collection } from "@/views/blocks-editor/primitives/Collection";
import { Field } from "@/views/blocks-editor/primitives/Field";

interface ScenarioBlockProps {
  block: ScenarioBlockType;
}

function ScenarioBlock({ block }: ScenarioBlockProps) {
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
    // TODO: put executor and step blocks on canvas
    setTest((test) => {
      return detachBlock(test, block);
    });
  }

  return (
    <Block
      block={block}
      color={{ primary: "rgb(129 140 248)", secondary: "white" }}
      onDelete={handleDelete}
    >
      <Field>
        Run{" "}
        <StringInput placeholder="Scenario name" value={block.name} onChange={handleNameChange} />
        with{" "}
        <BlockInset
          owner={block}
          color={EXECUTOR_COLOR}
          connection={{
            key: "executor",
            node: <AnyBlock block={block.executor} />,
            action: {
              type: "assign-executor",
              target: block,
            },
            connected: block.executor,
            accepts: isExecutorBlock,
          }}
        />
      </Field>
      <Field>and do the following:</Field>
      <Collection
        owner={block}
        color={STEP_COLOR}
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
      />
    </Block>
  );
}

export { ScenarioBlock };
