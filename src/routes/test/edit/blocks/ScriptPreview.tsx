import { convertToScript } from "@/lib/stores/blocks/convert";
import { EMPTY_ENVIRONMENT } from "@/lib/stores/projects";
import { useTestValue } from "@/routes/test/edit/blocks/atoms";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight as theme } from "react-syntax-highlighter/dist/esm/styles/prism";

function ScriptPreview() {
  const [error, setError] = useState<unknown>(null);
  const [script, setScript] = useState<string>("");

  const test = useTestValue();

  useEffect(() => {
    const env = EMPTY_ENVIRONMENT;

    convertToScript(env, test)
      .then((script) => {
        console.log("generated script", { script });

        setError(null);
        setScript(script);
      })
      .catch(setError);
  }, [test]);

  if (error !== null) {
    return (
      <div className="flex h-full items-center justify-center">
        An error occurred while converting to script. Make sure you've filled in all the required
        data.
      </div>
    );
  }

  return (
    <div className="p-4">
      <SyntaxHighlighter
        customStyle={{ backgroundColor: "#fff" }}
        language="javascript"
        style={theme}
      >
        {script}
      </SyntaxHighlighter>
    </div>
  );
}

export { ScriptPreview };