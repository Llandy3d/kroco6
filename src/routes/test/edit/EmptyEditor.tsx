import { BlockEditorIllustration } from "@/components/illustrations/BlockEditorIllustration";
import { ScriptEditorIllustration } from "@/components/illustrations/ScriptEditorIllustration";
import { Button } from "@/components/ui/button";

interface EmptyEditorProps {
  onNewBlocks: () => void;
  onNewScript: () => void;
}

function EmptyEditor({ onNewBlocks, onNewScript }: EmptyEditorProps) {
  return (
    <div className="flex flex-auto flex-col items-center">
      <h1 className="mb-3 mt-32 text-3xl">Create new test</h1>
      <h2 className="mb-8 font-thin">Start your journey by choosing a type of test</h2>
      <div className="flex items-center justify-center gap-12">
        <div className="flex w-64 flex-col items-center">
          <BlockEditorIllustration className="my-2" />
          <h3 className="my-3 text-xl">Block test</h3>
          <p className="mb-4 text-center font-thin">
            Use our interactive UI to compose GET, POST, DELETE and more requests.
          </p>
          <Button onClick={onNewBlocks}>Start building</Button>
        </div>
        <div className="flex w-64 flex-col items-center">
          <ScriptEditorIllustration className="my-2" />
          <h3 className="my-3 text-xl">Script test</h3>
          <p className="mb-4 text-center font-thin">
            Use our code samples as a foundation for your script or start from a clean slate.
          </p>
          <Button variant="outline" onClick={onNewScript}>
            Start scripting
          </Button>
        </div>
      </div>
    </div>
  );
}

export { EmptyEditor };
