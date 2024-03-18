import { type Block } from "@/lib/stores/blocks/model/loose";
import { exhaustive } from "@/lib/utils/typescript";
import { CheckBlock } from "@/routes/test/edit/blocks/CheckBlock";
import { ExecutorBlock } from "@/routes/test/edit/blocks/ExecutorBlock";
import { GroupBlock } from "@/routes/test/edit/blocks/GroupBlock";
import { HttpRequestBlock } from "@/routes/test/edit/blocks/HttpRequestBlock";
import { LibraryBlock } from "@/routes/test/edit/blocks/LibraryBlock";
import { ScenarioBlock } from "@/routes/test/edit/blocks/ScenarioBlock";
import { SleepBlock } from "@/routes/test/edit/blocks/SleepBlock";
import { useDragEnabled } from "@/routes/test/edit/blocks/dnd/DragEnabled";
import { Draggable } from "@/routes/test/edit/blocks/dnd/Draggable";

interface AnyBlockSwitchProps {
  block: Block;
}

function AnyBlockSwitch({ block }: AnyBlockSwitchProps) {
  if (block === null) {
    return null;
  }

  switch (block.type) {
    case "scenario":
      return <ScenarioBlock block={block} />;

    case "executor":
      return <ExecutorBlock block={block} />;

    case "http-request":
      return <HttpRequestBlock block={block} />;

    case "library":
      return <LibraryBlock block={block} />;

    case "group":
      return <GroupBlock block={block} />;

    case "check":
      return <CheckBlock block={block} />;

    case "sleep":
      return <SleepBlock block={block} />;

    default:
      return <p>{exhaustive(block)}</p>;
  }
}

interface AnyBlockProps {
  block: Block | null;
}

function AnyBlock({ block }: AnyBlockProps) {
  const isDragEnabled = useDragEnabled();

  if (block === null) {
    return null;
  }

  if (isDragEnabled) {
    return (
      <Draggable block={block}>
        <AnyBlockSwitch block={block} />
      </Draggable>
    );
  }

  return <AnyBlockSwitch block={block} />;
}

export { AnyBlock };
