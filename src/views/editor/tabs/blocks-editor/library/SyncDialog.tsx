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
import { useInputState } from "@/routes/hooks";
import { ResponseType, fetch } from "@tauri-apps/api/http";
import { RefreshCcw } from "lucide-react";
import type { OpenAPIV3 } from "openapi-types";

interface SyncDialogProps {
  open: boolean;
  onDismiss: () => void;
  onSync(api: OpenAPIV3.Document): void;
}

function SyncDialog({ open, onDismiss, onSync }: SyncDialogProps) {
  const [url, handleUrlChange] = useInputState(
    "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.json",
  );

  function handleOpenChange() {
    onDismiss();
  }

  function handleImportClick() {
    fetch<string>(url, {
      method: "GET",
      responseType: ResponseType.Text,
    }).then((response) => {
      const api = JSON.parse(response.data) as OpenAPIV3.Document;

      onSync(api);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>Sync with OpenAPI</DialogHeader>
        <DialogDescription>
          Sync library with your existing OpenAPI definitions.
        </DialogDescription>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right" htmlFor="name">
            URL
          </Label>
          <Input
            className="col-span-3"
            id="name"
            value={url}
            onChange={handleUrlChange}
          />
        </div>
        <DialogFooter>
          <Button className="flex gap-2" onClick={handleImportClick}>
            <RefreshCcw size={14} /> Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { SyncDialog };
