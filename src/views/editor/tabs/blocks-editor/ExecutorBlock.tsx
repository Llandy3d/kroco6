import { detachBlock, updateBlock } from "@/lib/stores/blocks";
import type { ExecutorBlock as ExecutorBlockType } from "@/lib/stores/blocks/model/loose";
import { useSetTest } from "@/views/editor/tabs/blocks-editor/atoms";
import { EXECUTOR_COLOR } from "@/views/editor/tabs/blocks-editor/colors";
import { StringInput } from "@/views/editor/tabs/blocks-editor/inputs/StringInput";
import { Block } from "@/views/editor/tabs/blocks-editor/primitives/Block";
import { Field } from "@/views/editor/tabs/blocks-editor/primitives/Field";

interface ExecutorProps {
  executor: ExecutorBlockType["executor"];
  onChange: (executor: ExecutorBlockType["executor"]) => void;
}

function Executor({ executor, onChange }: ExecutorProps) {
  function handleVusChange(value: string) {
    onChange({
      ...executor,
      vus: +value,
    });
  }

  function handleDurationChange(value: string) {
    onChange({
      ...executor,
      duration: value,
    });
  }

  return (
    <div>
      {executor.type === "constant-vus" && (
        <Field>
          <StringInput
            size={3}
            value={executor.vus}
            onChange={handleVusChange}
          />
          VUs for
          <StringInput
            size={3}
            value={executor.duration}
            onChange={handleDurationChange}
          />
        </Field>
      )}
    </div>
  );
}

interface ExecutorBlockProps {
  block: ExecutorBlockType;
}

function ExecutorBlock({ block }: ExecutorBlockProps) {
  const setTest = useSetTest();

  function handleExecutorChange(executor: ExecutorBlockType["executor"]) {
    setTest((test) => {
      return updateBlock(test, {
        ...block,
        executor,
      });
    });
  }

  function handleDelete() {
    setTest((test) => {
      return detachBlock(test, block);
    });
  }

  return (
    <Block
      block={block}
      color={EXECUTOR_COLOR}
      top={true}
      onDelete={handleDelete}
    >
      <Executor executor={block.executor} onChange={handleExecutorChange} />
    </Block>
  );
}

export { ExecutorBlock };
