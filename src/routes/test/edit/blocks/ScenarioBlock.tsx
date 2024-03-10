import { detachBlock, insertStep, updateBlock } from "@/lib/stores/blocks";
import type {
  Block as BlockType,
  ScenarioBlock as ScenarioBlockType,
} from "@/lib/stores/blocks/model/loose";
import { detach } from "@/lib/stores/blocks/model/utils";
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

  function handleDropStep(step: BlockType) {
    if (!isStepBlock(step)) {
      return;
    }

    setTest((test) => insertStep(test, block, step));
  }

  function handleExecutorDrop(executor: BlockType) {
    if (!isExecutorBlock(executor)) {
      return;
    }

    setTest((test) =>
      updateBlock(detachBlock(test, executor), {
        ...detach(block, executor),
        executor,
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
            block: block.executor,
            accepts: isExecutorBlock,
            onDrop: handleExecutorDrop,
          }}
        >
          {block.executor && <AnyBlock block={block.executor} />}
        </BlockInset>
      </Field>
      <Field>and do the following:</Field>
      <Collection
        owner={block}
        color={STEP_COLOR}
        connection={{ block: block.step, accepts: isStepBlock, onDrop: handleDropStep }}
      >
        {block.step && <AnyBlock block={block.step} />}
      </Collection>
    </Block>
  );
}

export { ScenarioBlock };
