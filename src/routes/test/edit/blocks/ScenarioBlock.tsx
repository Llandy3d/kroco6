import { detachBlock, updateBlock } from "@/lib/stores/blocks";
import type { ScenarioBlock as ScenarioBlockType } from "@/lib/stores/blocks/model/loose";
import { isExecutorBlock, isStepBlock } from "@/lib/stores/blocks/utils";
import { AnyBlock } from "@/routes/test/edit/blocks/AnyBlock";
import { useSetTest } from "@/routes/test/edit/blocks/atoms";
import { EXECUTOR_COLOR, STEP_COLOR } from "@/routes/test/edit/blocks/colors";
import { StringInput } from "@/routes/test/edit/blocks/inputs/StringInput";
import { Block } from "@/routes/test/edit/blocks/primitives/Block";
import { BlockInset } from "@/routes/test/edit/blocks/primitives/BlockInset";
import { Collection } from "@/routes/test/edit/blocks/primitives/Collection";
import { Field } from "@/routes/test/edit/blocks/primitives/Field";

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
            connected: block.executor !== null,
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
          connected: block.step !== null,
          accepts: isStepBlock,
        }}
      />
    </Block>
  );
}

export { ScenarioBlock };
