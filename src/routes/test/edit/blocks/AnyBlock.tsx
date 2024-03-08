import { type Block } from "@/lib/stores/blocks/model/loose";
import { ExecutorBlock } from "@/routes/test/edit/blocks/ExecutorBlock";
import { HttpRequestBlock } from "@/routes/test/edit/blocks/HttpRequestBlock";
import { LibraryBlock } from "@/routes/test/edit/blocks/LibraryBlock";
import { SleepBlock } from "@/routes/test/edit/blocks/SleepBlock";

interface AnyBlockProps {
  block: Block;
}

function AnyBlock({ block }: AnyBlockProps) {
  switch (block.type) {
    // case "scenario":
    //   return <ScenarioBlock block={block} />;

    case "executor":
      return <ExecutorBlock block={block} />;

    case "http-request":
      return <HttpRequestBlock block={block} />;

    case "library":
      return <LibraryBlock block={block} />;

    // case "group":
    //   return <GroupBlock block={block} />;

    // case "check":
    //   return <CheckBlock block={block} />;

    case "sleep":
      return <SleepBlock block={block} />;

    default:
      return <div>Not implemented!</div>;
    // return <p>{exhaustive(block)}</p>;
  }
}

export { AnyBlock };
