import { Button } from "@/components/ui/button";
import { atom, useSetAtom } from "jotai";
import { FileJson2, Layers } from "lucide-react";
import type { Test } from "../lib/backend-client";

const currentFile = atom<Test | null>(null);

interface TestListProps {
  tests: Test[];
}

function TestList({ tests }: TestListProps) {
  const setCurrentFile = useSetAtom(currentFile);

  // TODO: Move this to state management
  function openTestAsFile(_test: Test) {}

  return (
    <div>
      <ul role="list" className="max-h-50 mb-2 mt-1 overflow-auto text-left">
        {tests.map((test) => (
          <li key={test.name}>
            <button
              className="flex items-center gap-1 text-ellipsis py-1 text-sm hover:underline"
              onClick={() => {
                openTestAsFile(test);
              }}
            >
              {test.kind === "Javascript" ? <FileJson2 size="12" /> : <Layers size="12" />}

              {test.name}
            </button>
          </li>
        ))}
      </ul>
      <Button
        className="w-full"
        onClick={() => {
          setCurrentFile(null);
        }}
      >
        Create test
      </Button>
    </div>
  );
}

export { TestList };
