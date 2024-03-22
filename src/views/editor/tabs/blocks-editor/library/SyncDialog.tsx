import { Button } from "@/components/base/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/base/dialog";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { cn } from "@/lib/utils";
import { useInputState } from "@/routes/hooks";
import { parseOpenAPI, type OpenAPI } from "@/schemas/openapi";
import { css } from "@emotion/css";
import { ResponseType, fetch } from "@tauri-apps/api/http";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";

const styles = {
  field: css`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    gap: 0.25rem 1rem;

    & > p {
      grid-row: 2;
      grid-column: 2;
    }
  `,
};

interface SyncDialogProps {
  syncedFrom: string | undefined;
  open: boolean;
  onDismiss: () => void;
  onSync(api: OpenAPI): void;
}

function SyncDialog({ syncedFrom, open, onDismiss, onSync }: SyncDialogProps) {
  const [state, setState] = useState<"initial" | "syncing" | "error">(
    "initial",
  );

  const [url, handleUrlChange] = useInputState(syncedFrom ?? "");

  function handleOpenChange() {
    onDismiss();
  }

  function handleImportClick() {
    setState("syncing");

    fetch<unknown>(url, {
      method: "GET",
      responseType: ResponseType.JSON,
    }).then((response) => {
      const result = parseOpenAPI(response.data);

      if (!result.success) {
        console.log("OpenAPI sync error", result.issues);

        setState("error");

        return;
      }

      onSync({
        ...result.output,
        "x-synced-from": url,
      });

      setState("initial");
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>Sync with OpenAPI</DialogHeader>
        <DialogDescription>
          Sync library with your existing OpenAPI definitions.
        </DialogDescription>
        <div className={styles.field}>
          <Label htmlFor="name">URL</Label>
          <Input id="name" value={url} onChange={handleUrlChange} />
          {state === "error" && (
            <p className="text-sm text-destructive">
              The URL did not return a valid OpenAPI specification.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            className="flex gap-2"
            disabled={state === "syncing"}
            onClick={handleImportClick}
          >
            <RefreshCcw
              size={14}
              className={cn(state === "syncing" && "animate-spin")}
            />{" "}
            Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { SyncDialog };
