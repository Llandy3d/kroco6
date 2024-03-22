import { type Block } from "@/lib/stores/blocks/model/loose";
import { exhaustive } from "@/lib/utils/typescript";
import { CheckBlock } from "@/views/editor/tabs/blocks-editor/CheckBlock";
import { ExecutorBlock } from "@/views/editor/tabs/blocks-editor/ExecutorBlock";
import { GroupBlock } from "@/views/editor/tabs/blocks-editor/GroupBlock";
import { HttpRequestBlock } from "@/views/editor/tabs/blocks-editor/HttpRequestBlock";
import { LibraryBlock } from "@/views/editor/tabs/blocks-editor/LibraryBlock";
import { ScenarioBlock } from "@/views/editor/tabs/blocks-editor/ScenarioBlock";
import { SleepBlock } from "@/views/editor/tabs/blocks-editor/SleepBlock";
import { useDragEnabled } from "@/views/editor/tabs/blocks-editor/dnd/DragEnabled";
import { Draggable } from "@/views/editor/tabs/blocks-editor/dnd/Draggable";

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
