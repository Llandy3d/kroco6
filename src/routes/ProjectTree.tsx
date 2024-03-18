import { useToast } from "@/components/ui/use-toast";
import { openFile, rename, type Project, type ProjectEntry } from "@/lib/backend-client";
import { parse } from "@/lib/stores/blocks/model/loose";
import type { VirtualFile } from "@/lib/stores/editor";
import { cn } from "@/lib/utils";
import { tryParseJSON } from "@/lib/utils/json";
import { getExtension, getFileName } from "@/lib/utils/path";
import { exhaustive } from "@/lib/utils/typescript";
import { useCurrentFile, useOpenFiles } from "@/routes/test/edit/atoms";
import { Box, ChevronDown, ChevronRight, FileCode, type LucideIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useRef, type FocusEvent, type KeyboardEvent } from "react";
import { NodeApi, Tree, type NodeRendererProps, type RenameHandler } from "react-arborist";
import { useResizeObserver } from "usehooks-ts";

function loadFile(path: string, content: string): VirtualFile | null {
  const fileName = getFileName(path);
  const extension = getExtension(path);

  if (extension === "js") {
    return {
      type: "script",
      handle: nanoid(),
      name: fileName ?? "Untitled",
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
    name: fileName ?? "Untitled",
    path: {
      type: "existing",
      filePath: path,
      original: content,
    },
    blocks: blocks.output,
  };
}

interface ProjectEntryBase {
  path: string;
  name: string;
}

interface FileItem extends ProjectEntryBase {
  type: "file";
  path: string;
  kind: "js" | "blocks";
}

interface DirectoryItem extends ProjectEntryBase {
  type: "directory";
  path: string;
  children: TreeItem[];
}

type TreeItem = FileItem | DirectoryItem;

interface NodeProps {
  node: NodeApi<TreeItem>;
  name: string;
  selected?: boolean;
  icon: LucideIcon;
  onClick: () => void;
}

function Node({ node, name, selected, icon: Icon, onClick }: NodeProps) {
  function handleFocus(ev: FocusEvent<HTMLInputElement>) {
    const index = ev.currentTarget.value.lastIndexOf(".");

    ev.currentTarget.setSelectionRange(0, index === -1 ? ev.currentTarget.value.length : index);
  }

  function handleBlur() {
    node.reset();
  }

  function handleKeyDown(ev: KeyboardEvent<HTMLInputElement>) {
    if (ev.key === "Enter") {
      node.submit(ev.currentTarget.value);

      return;
    }

    if (ev.key === "Escape") {
      node.reset();
    }
  }

  return (
    <div
      className={cn("flex cursor-pointer items-center gap-1 text-xs", selected && "font-bold")}
      onClick={onClick}
      style={{ marginLeft: node.level * 16 }}
    >
      <Icon size={14} />{" "}
      {!node.isEditing ? (
        <span>{name}</span>
      ) : (
        <input
          type="text"
          autoFocus
          defaultValue={name}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      )}
    </div>
  );
}

function DirectoryNode({ node, entry }: NodeRendererProps<TreeItem> & { entry: DirectoryItem }) {
  function handleClick() {
    node.toggle();
  }

  return (
    <Node
      node={node}
      name={entry.name}
      icon={node.isOpen ? ChevronDown : ChevronRight}
      onClick={handleClick}
    />
  );
}

function FileNode({ node, entry }: NodeRendererProps<TreeItem> & { entry: FileItem }) {
  const { toast } = useToast();

  const [openFiles, setOpenFiles] = useOpenFiles();
  const [currentFile, setCurrentFile] = useCurrentFile();

  function handleClick() {
    const existingFile = openFiles.find(
      (file) => file.path.type === "existing" && file.path.filePath === entry.path,
    );

    if (existingFile !== undefined) {
      setCurrentFile(existingFile.handle);

      return;
    }

    openFile(entry.path)
      .then((result) => {
        const file = loadFile(result.path, result.content);

        if (file === null) {
          toast({
            title: "Failed to open file",
            description: `The file "${result.path}" could not be opened.`,
            variant: "destructive",
          });

          return;
        }

        setOpenFiles((files) => [...files, file]);
        setCurrentFile(file.handle);
      })
      .catch(console.error);
  }

  return (
    <Node
      node={node}
      name={entry.name}
      selected={currentFile?.path.type === "existing" && currentFile.path.filePath === entry.path}
      icon={entry.kind === "js" ? FileCode : Box}
      onClick={handleClick}
    />
  );
}

function ProjectEntryNode(props: NodeRendererProps<TreeItem>) {
  switch (props.node.data.type) {
    case "file":
      return <FileNode {...props} entry={props.node.data} />;

    case "directory":
      return <DirectoryNode {...props} entry={props.node.data} />;

    default:
      return exhaustive(props.node.data);
  }
}

function getFileExtension(path: string): string {
  return path.slice(path.lastIndexOf(".") + 1);
}

function toTreeItem(file: ProjectEntry): TreeItem {
  const name = file.path.slice(file.path.lastIndexOf("/") + 1);

  if (file.type === "file") {
    return {
      type: "file",
      path: file.path,
      name,
      kind: getFileExtension(file.path) === "js" ? "js" : "blocks",
    };
  }

  return {
    type: "directory",
    path: file.path,
    name,
    children: file.entries.map(toTreeItem),
  };
}

interface ProjectTreeProps {
  project: Project;
}

function ProjectTree({ project }: ProjectTreeProps) {
  const items: TreeItem[] = [toTreeItem(project.directory)];

  const container = useRef<HTMLDivElement | null>(null);

  const { width = 0, height = 0 } = useResizeObserver({
    ref: container,
  });

  function handleRename({ name, node }: Parameters<RenameHandler<TreeItem>>[0]) {
    const basePath = node.data.path.slice(0, node.data.path.lastIndexOf("/"));

    const from = node.data.path;
    const to = `${basePath}/${name}`;

    rename(from, to)
      .then(() => {})
      .catch(console.error);
  }

  return (
    <div ref={container} className="relative flex-auto overflow-hidden border-y py-4">
      <Tree
        initialOpenState={{
          [project.directory.path]: true,
        }}
        data={items}
        idAccessor={(entry) => entry.path}
        width={width}
        height={height}
        openByDefault={false}
        onRename={handleRename}
      >
        {ProjectEntryNode}
      </Tree>
    </div>
  );
}

export { ProjectTree };
