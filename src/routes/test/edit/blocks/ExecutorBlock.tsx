import { updateBlock } from "@/lib/stores/blocks";
import type { ExecutorBlock as ExecutorBlockType } from "@/lib/stores/blocks/model/loose";
import { useSetTest } from "@/routes/test/edit/blocks/atoms";
import { EXECUTOR_COLOR } from "@/routes/test/edit/blocks/colors";
import { StringInput } from "@/routes/test/edit/blocks/inputs/StringInput";
import { Block } from "@/routes/test/edit/blocks/primitives/Block";
import { Field } from "@/routes/test/edit/blocks/primitives/Field";

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
          <StringInput size={3} value={executor.vus} onChange={handleVusChange} />
          VUs for
          <StringInput size={3} value={executor.duration} onChange={handleDurationChange} />
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

  return (
    <Block block={block} color={EXECUTOR_COLOR} top={true}>
      <Executor executor={block.executor} onChange={handleExecutorChange} />
    </Block>
  );
}

export { ExecutorBlock };
