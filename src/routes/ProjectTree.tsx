import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  createDirectory,
  deleteDirectory,
  openFile,
  rename,
  type Project,
  type ProjectDirectory,
  type ProjectEntry,
} from "@/lib/backend-client";
import { parse } from "@/lib/stores/blocks/model/loose";
import type { VirtualFile } from "@/lib/stores/editor";
import { cn } from "@/lib/utils";
import { tryParseJSON } from "@/lib/utils/json";
import { getExtension, getPathName } from "@/lib/utils/path";
import { exhaustive } from "@/lib/utils/typescript";
import { ProjectIcon } from "@/routes/ProjectIcon";
import { useCurrentFile, useOpenFiles } from "@/routes/test/edit/atoms";
import { Box, ChevronDown, ChevronRight, FileCode } from "lucide-react";
import { nanoid } from "nanoid";
import { useRef, type ComponentType, type FocusEvent, type KeyboardEvent } from "react";
import {
  NodeApi,
  Tree,
  type CreateHandler,
  type DeleteHandler,
  type NodeRendererProps,
  type RenameHandler,
} from "react-arborist";
import { useResizeObserver } from "usehooks-ts";

function loadFile(path: string, content: string): VirtualFile | null {
  const fileName = getPathName(path);
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
  kind: "js" | "blocks";
}

interface DirectoryItem extends ProjectEntryBase {
  type: "directory";
  children: TreeItem[];
}

interface ProjectItem extends ProjectEntryBase {
  type: "project";
  children: TreeItem[];
}

type TreeItem = FileItem | DirectoryItem | ProjectItem;

interface NodeProps {
  node: NodeApi<TreeItem>;
  name: string;
  selected?: boolean;
  icon: ComponentType<{ size?: number | string }>;
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
      style={{ marginLeft: node.level * 16 }}
      onClick={onClick}
    >
      <Icon size={16} />{" "}
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

function ProjectNode({ tree, node, entry }: NodeRendererProps<TreeItem> & { entry: ProjectItem }) {
  function handleClick() {
    node.toggle();
  }

  function handleNewDirectory() {
    tree.create({
      type: "internal",
      parentId: node.id,
    });
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Node node={node} name={entry.name} icon={ProjectIcon} onClick={handleClick} />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleNewDirectory}>New directory</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DirectoryNode({
  tree,
  node,
  entry,
}: NodeRendererProps<TreeItem> & { entry: DirectoryItem }) {
  function handleClick() {
    node.toggle();
  }

  function handleNewDirectory() {
    tree.create({
      type: "internal",
      parentId: node.id,
    });
  }

  function handleRename() {
    node.edit();
  }

  function handleDelete() {
    tree.delete(node.id);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Node
          node={node}
          name={entry.name}
          icon={node.isOpen ? ChevronDown : ChevronRight}
          onClick={handleClick}
        />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleNewDirectory}>New directory</ContextMenuItem>
        <ContextMenuItem disabled={node.isRoot} onClick={handleRename}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem disabled={node.isRoot} onClick={handleDelete}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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

    case "project":
      return <ProjectNode {...props} entry={props.node.data} />;

    default:
      return exhaustive(props.node.data);
  }
}

function toTreeItem(file: ProjectEntry): TreeItem {
  const name = getPathName(file.path) ?? "<unknown>";

  if (file.type === "file") {
    return {
      type: "file",
      path: file.path,
      name,
      kind: getExtension(file.path) === "js" ? "js" : "blocks",
    };
  }

  return {
    type: "directory",
    path: file.path,
    name,
    children: file.entries.map(toTreeItem),
  };
}

function toProjectItem(file: ProjectDirectory): TreeItem {
  return {
    type: "project",
    path: file.path,
    name: getPathName(file.path) ?? "<unknown>",
    children: file.entries.map(toTreeItem),
  };
}

interface ProjectTreeProps {
  project: Project;
  onChange: (project: Project) => void;
}

function ProjectTree({ project, onChange }: ProjectTreeProps) {
  const items: TreeItem[] = [toProjectItem(project.directory)];

  const container = useRef<HTMLDivElement | null>(null);

  const { width = 0, height = 0 } = useResizeObserver({
    ref: container,
  });

  const handleCreate: CreateHandler<TreeItem> = ({ parentNode }) => {
    if (parentNode === null || parentNode.data.type === "file") {
      return null;
    }

    const conflicts =
      parentNode.children?.filter((node) => node.data.name.startsWith("New Folder")) ?? [];

    const path = `${parentNode.data.path}/New Folder${conflicts.length > 0 ? ` (${conflicts.length})` : ""}`;

    return createDirectory(project.root, path).then(({ path, project }) => {
      onChange(project);

      return { id: path };
    });
  };

  const handleDelete: DeleteHandler<TreeItem> = ({ nodes }) => {
    const target = nodes[0];

    if (target === undefined) {
      return;
    }

    if (target.data.type === "file") {
      return;
    }

    return deleteDirectory(project.root, target.data.path).then(({ project }) => {
      onChange(project);
    });
  };

  const handleRename: RenameHandler<TreeItem> = ({ name, node }) => {
    const basePath = node.data.path.slice(0, node.data.path.lastIndexOf("/"));

    const from = node.data.path;
    const to = `${basePath}/${name}`;

    return rename(from, to).then(() => {});
  };

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
        disableEdit={(item) => item.type === "project"}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onRename={handleRename}
      >
        {ProjectEntryNode}
      </Tree>
    </div>
  );
}

export { ProjectTree };
