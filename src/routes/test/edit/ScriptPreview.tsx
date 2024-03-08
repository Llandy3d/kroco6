import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { CloudTest } from "@/lib/backend-client";
import { Eye } from "lucide-react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

interface ScriptPreviewProps {
  test: CloudTest;
}

function ScriptPreview({ test }: ScriptPreviewProps) {
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (container === null || editor.current !== undefined) {
      return;
    }

    editor.current = monaco.editor.create(container, {
      value: test.script ?? "",
      language: "javascript",
      readOnly: true,
      minimap: { enabled: false },
      lineNumbers: "off",
    });
  }, [container, test]);

  useEffect(() => {
    if (test.script === null) {
      return;
    }

    editor.current?.setValue(test.script);
  }, [test.script]);

  useEffect(() => {
    return () => {
      editor.current?.dispose();
    };
  }, []);

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger
        href=""
        className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
      >
        <Eye size="16" />
      </HoverCardTrigger>
      <HoverCardContent className="w-[600px]">
        <div ref={setContainer} className="h-[400px] w-full"></div>
      </HoverCardContent>
    </HoverCard>
  );
}

export { ScriptPreview };
