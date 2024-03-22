import { Button } from "@/components/base/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/base/resizable";
import { ScrollArea } from "@/components/base/scroll-area";
import { HTTP_METHODS } from "@/lib/stores/library/constants";
import type { ApiEndpoint, ApiOperation } from "@/lib/stores/library/types";
import type { OpenAPI, PathItem } from "@/schemas/openapi";
import { Plus, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ApiPath } from "./ApiPath";
import { EndpointEditor } from "./EndpointEditor";
import { SyncDialog } from "./SyncDialog";

interface LibraryProps {
  library: OpenAPI;
  onChange: (library: OpenAPI) => void;
}

function Library({ library, onChange }: LibraryProps) {
  const [selected, setSelected] = useState<ApiOperation | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);

  const endpoints: ApiEndpoint[] = useMemo(() => {
    const paths = Object.entries(library.paths ?? {}) satisfies Array<
      [string, PathItem]
    >;

    return paths.flatMap(([path, value]) => {
      if (value === undefined) {
        return [];
      }

      return {
        path,
        details: value,
        operations: HTTP_METHODS.flatMap((method) => {
          const details = value[method];

          if (details === undefined) {
            return [];
          }

          return {
            id: details.operationId ?? `${method} ${path}`,
            path,
            method,
            details,
          };
        }),
      };
    });
  }, [library]);

  const endpoint = endpoints.find(
    (endpoint) => endpoint.path === selected?.path,
  );

  const handleSyncClick = () => {
    setImportModalOpen(true);
  };

  const handleImport = (api: OpenAPI) => {
    onChange(api);

    setImportModalOpen(false);
  };

  function handleItemSelected(operation: ApiOperation) {
    setSelected(operation);
  }

  function handleEndpointChange(_api: ApiEndpoint) {
    if (endpoint === undefined) {
      return;
    }

    // $test = updateEndpoint($test, endpoint, target);

    // // If the path has changed, we have to make sure that the
    // // selected operation is also updated.
    // selected = selected && {
    //   ...selected,
    //   path: target.path,
    // };
  }

  function handleSyncDialogDismiss() {
    setImportModalOpen(false);
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="flex flex-col p-2" maxSize={30}>
          <h2 className="flex items-center justify-between">
            <span className="font-bold uppercase">{library.info.title}</span>
            <Button
              className="gap-2"
              variant="ghost"
              size="sm"
              onClick={handleSyncClick}
            >
              <RefreshCcw size={14} /> Sync
            </Button>
          </h2>
          <div className="relative my-2 flex-auto">
            <div className="absolute inset-0 overflow-y-auto">
              <ScrollArea>
                <div>
                  {endpoints.map((endpoint) => {
                    return (
                      <div key={endpoint.path}>
                        <ApiPath
                          endpoint={endpoint}
                          selected={selected}
                          onItemSelected={handleItemSelected}
                        />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 gap-2">
              <Plus /> Add
            </Button>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="p-4">
          {endpoint !== undefined && selected !== undefined && (
            <EndpointEditor
              selected={selected.method}
              endpoint={endpoint}
              onChange={handleEndpointChange}
              onOperationSelected={handleItemSelected}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <SyncDialog
        syncedFrom={library["x-synced-from"]}
        open={importModalOpen}
        onDismiss={handleSyncDialogDismiss}
        onSync={handleImport}
      />
    </>
  );
}

export { Library };
