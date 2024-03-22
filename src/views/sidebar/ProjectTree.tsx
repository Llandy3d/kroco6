import { useCurrentTab, useOpenTabs, useSetOpenTabs } from "@/atoms/tabs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/base/context-menu";
import { useToast } from "@/components/base/use-toast";
import { PlaceholderIcon } from "@/components/icons/PlaceholderIcon";
import { ProjectIcon } from "@/components/icons/ProjectIcon";
import {
  createDirectory,
  deleteEntry,
  rename,
  type Project,
  type ProjectDirectory,
  type ProjectEntry,
} from "@/lib/backend-client";
import { cn } from "@/lib/utils";
import { basename, extname } from "@/lib/utils/path";
import { exhaustive } from "@/lib/utils/typescript";
import { loadFile } from "@/routes/actions";
import {
  Box,
  ChevronDown,
  ChevronRight,
  FileCode,
  FolderClosed,
  FolderOpen,
} from "lucide-react";
import {
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  NodeApi,
  Tree,
  type CreateHandler,
  type DeleteHandler,
  type NodeRendererProps,
  type RenameHandler,
} from "react-arborist";
import { useResizeObserver } from "usehooks-ts";

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

function* filesIn(node: TreeItem): Generator<FileItem> {
  if (node.type === "file") {
    yield node;
  }

  if (node.type === "directory" || node.type === "project") {
    for (const child of node.children) {
      yield* filesIn(child);
    }
  }
}

interface NodeProps {
  node: NodeApi<TreeItem>;
  name: string;
  selected?: boolean;
  icon: ReactNode;
  onClick: () => void;
}

function Node({ node, name, selected, icon, onClick }: NodeProps) {
  function handleFocus(ev: FocusEvent<HTMLInputElement>) {
    const index = ev.currentTarget.value.lastIndexOf(".");

    ev.currentTarget.setSelectionRange(
      0,
      index === -1 ? ev.currentTarget.value.length : index,
    );
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

  // We want the project level to be indented the same as the root level
  // directories, so we remove one level of indentation.
  const indent = Math.max(0, node.level - 1);

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-1 text-xs",
        selected && "font-bold",
      )}
      style={{ marginLeft: indent * 16 }}
      onClick={onClick}
    >
      {icon}
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

function ProjectNode({
  tree,
  node,
  entry,
}: NodeRendererProps<TreeItem> & { entry: ProjectItem }) {
  const autoFocus = useRef(true);

  function handleClick() {
    node.toggle();
  }

  function handleNewFolder() {
    autoFocus.current = false;

    tree.create({
      type: "internal",
      parentId: node.id,
    });
  }

  function handleCloseAutoFocus(ev: Event) {
    if (!autoFocus.current) {
      ev.preventDefault();
    }

    autoFocus.current = true;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Node
          node={node}
          name={entry.name}
          icon={<ProjectIcon size={14} />}
          onClick={handleClick}
        />
      </ContextMenuTrigger>
      <ContextMenuContent onCloseAutoFocus={handleCloseAutoFocus}>
        <ContextMenuItem onClick={handleNewFolder}>New Folder</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DirectoryNode({
  tree,
  node,
  entry,
}: NodeRendererProps<TreeItem> & { entry: DirectoryItem }) {
  const autoFocus = useRef(true);

  function handleClick() {
    node.toggle();
  }

  function handleNewFolder() {
    autoFocus.current = false;

    setTimeout(() => {
      tree.create({
        type: "internal",
        parentId: node.id,
      });
    }, 200);
  }

  function handleRename() {
    autoFocus.current = false;

    setTimeout(() => {
      node.edit();
    }, 200);
  }

  function handleDelete() {
    tree.delete(node.id);
  }

  function handleCloseAutoFocus(ev: Event) {
    if (!autoFocus.current) {
      ev.preventDefault();
    }

    autoFocus.current = true;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Node
          node={node}
          name={entry.name}
          icon={
            <>
              {node.isOpen ? (
                <>
                  <ChevronDown size={14} /> <FolderOpen size={14} />
                </>
              ) : (
                <>
                  <ChevronRight size={14} /> <FolderClosed size={14} />
                </>
              )}{" "}
            </>
          }
          onClick={handleClick}
        />
      </ContextMenuTrigger>
      <ContextMenuContent onCloseAutoFocus={handleCloseAutoFocus}>
        <ContextMenuItem onSelect={handleNewFolder}>New Folder</ContextMenuItem>
        <ContextMenuItem disabled={node.isRoot} onSelect={handleRename}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem disabled={node.isRoot} onSelect={handleDelete}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function FileNode({
  tree,
  node,
  entry,
}: NodeRendererProps<TreeItem> & { entry: FileItem }) {
  const { toast } = useToast();

  const autoFocus = useRef(true);

  const [openFiles, setOpenFiles] = useOpenTabs();
  const [currentFile, setCurrentFile] = useCurrentTab();

  function handleClick() {
    const existingFile = openFiles.find(
      (file) =>
        "path" in file &&
        file.path.type === "existing" &&
        file.path.filePath === entry.path,
    );

    if (existingFile !== undefined) {
      setCurrentFile(existingFile.handle);

      return;
    }

    loadFile(entry.path)
      .then((file) => {
        if (file === null) {
          toast({
            title: "Failed to open file",
            description: `The file "${entry.path}" could not be opened.`,
            variant: "destructive",
          });

          return;
        }

        setOpenFiles((files) => [...files, file]);
        setCurrentFile(file.handle);
      })
      .catch(console.error);
  }

  function handleRename() {
    autoFocus.current = false;

    node.edit();
  }

  function handleDelete() {
    tree.delete(node.id);
  }

  function handleCloseAutoFocus(ev: Event) {
    if (!autoFocus.current) {
      ev.preventDefault();
    }

    autoFocus.current = true;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Node
          node={node}
          name={entry.name}
          selected={
            currentFile !== null &&
            "path" in currentFile &&
            currentFile?.path.type === "existing" &&
            currentFile.path.filePath === entry.path
          }
          icon={
            <>
              <PlaceholderIcon size={14} />{" "}
              {entry.kind === "js" ? <FileCode size={14} /> : <Box size={14} />}
            </>
          }
          onClick={handleClick}
        />
      </ContextMenuTrigger>
      <ContextMenuContent onCloseAutoFocus={handleCloseAutoFocus}>
        <ContextMenuItem onSelect={handleRename}>Rename</ContextMenuItem>
        <ContextMenuItem onSelect={handleDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
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

function sortEntries(a: TreeItem, b: TreeItem) {
  if (a.type === "directory" && b.type === "file") {
    return -1;
  }

  if (a.type === "file" && b.type === "directory") {
    return 1;
  }

  return a.name.localeCompare(b.name);
}

function toTreeItem(file: ProjectEntry): TreeItem {
  const name = basename(file.path) ?? "<unknown>";

  if (file.type === "file") {
    return {
      type: "file",
      path: file.path,
      name,
      kind: extname(file.path) === "js" ? "js" : "blocks",
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
    name: basename(file.path) ?? "<unknown>",
    children: file.entries.map(toTreeItem).sort(sortEntries),
  };
}

interface ProjectTreeProps {
  project: Project;
  onChange: (project: Project) => void;
}

function ProjectTree({ project, onChange }: ProjectTreeProps) {
  const items: TreeItem[] = [toProjectItem(project.directory)];

  const setOpenTabs = useSetOpenTabs();

  const container = useRef<HTMLDivElement | null>(null);

  const { width = 0, height = 0 } = useResizeObserver({
    ref: container,
  });

  const handleCreate: CreateHandler<TreeItem> = ({ parentNode }) => {
    if (parentNode === null || parentNode.data.type === "file") {
      return null;
    }

    const conflicts =
      parentNode.children?.filter((node) =>
        node.data.name.startsWith("New Folder"),
      ) ?? [];

    const path = `${parentNode.data.path}/New Folder${conflicts.length > 0 ? ` (${conflicts.length})` : ""}`;

    return createDirectory(project.root, path).then(({ path, project }) => {
      onChange(project);

      return { id: path };
    });
  };

  const handleDelete: DeleteHandler<TreeItem> = ({ nodes }) => {
    const target = nodes[0];

    if (target === undefined || target.data.type === "project") {
      return;
    }

    return deleteEntry(project.root, target.data.type, target.data.path).then(
      ({ project }) => {
        const deletedFiles = new Set(
          [...filesIn(target.data)].map((file) => file.path),
        );

        setOpenTabs((tabs) =>
          tabs.filter(
            (tab) =>
              !("path" in tab) ||
              (tab.path.type === "existing" &&
                !deletedFiles.has(tab.path.filePath)),
          ),
        );

        onChange(project);
      },
    );
  };

  const handleRename: RenameHandler<TreeItem> = ({ name, node }) => {
    const basePath = node.data.path.slice(0, node.data.path.lastIndexOf("/"));

    const from = node.data.path;
    const to = `${basePath}/${name}`;

    return rename(from, to).then(() => {
      setOpenTabs((tabs) => {
        return tabs.map((tab) => {
          if (tab.type === "project-settings" || tab.type === "test-results") {
            return tab;
          }

          if (tab.path.type === "existing" && tab.path.filePath === from) {
            return {
              ...tab,
              name,
              path: {
                ...tab.path,
                filePath: to,
              },
            };
          }

          return tab;
        });
      });
    });
  };

  return (
    <div
      ref={container}
      className="relative flex-auto overflow-hidden border-y py-4"
    >
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
