import { openFile } from "@/lib/backend-client";
import { parse } from "@/lib/stores/blocks/model/loose";
import type { EditorTab } from "@/lib/stores/editor";
import { tryParseJSON } from "@/lib/utils/json";
import { basename, dirname, extname } from "@/lib/utils/path";
import { nanoid } from "nanoid";

function parseContent(path: string, content: string): EditorTab | null {
  const name = basename(path);
  const extension = extname(path);

  if (name === "k6.json") {
    return {
      type: "project-settings",
      handle: nanoid(),
      name: "Project Settings",
      path: {
        type: "existing",
        filePath: path,
        original: content,
      },
      rootPath: dirname(path),
      settings: tryParseJSON(content) ?? {},
    };
  }

  if (extension === "js") {
    return {
      type: "script",
      handle: nanoid(),
      name: name ?? "Untitled",
      path: {
        type: "existing",
        filePath: path,
        original: content,
      },
      script: content,
    };
  }

  const value = tryParseJSON(content);

  if (value === null) {
    return null;
  }

  const blocks = parse(value);

  if (!blocks.success) {
    return null;
  }

  return {
    type: "blocks",
    handle: nanoid(),
    name: name ?? "Untitled",
    path: {
      type: "existing",
      filePath: path,
      original: content,
    },
    blocks: blocks.output,
  };
}

async function loadFile(path: string) {
  const result = await openFile(path);

  return parseContent(result.path, result.content);
}

export { loadFile };