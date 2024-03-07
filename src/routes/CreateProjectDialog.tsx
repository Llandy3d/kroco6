import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/backend-client";
import { useState, type ChangeEvent } from "react";

interface CreateProjectDialogProps {
  open: boolean;
  onDismiss: () => void;
  onCreate: (project: Project) => void;
}

function CreateProjectDialog({ open, onDismiss, onCreate }: CreateProjectDialogProps) {
  const [name, setName] = useState("");

  function handleNameChange(ev: ChangeEvent<HTMLInputElement>) {
    setName(ev.target.value);
  }

  function handleCreateProject() {
    onCreate({
      name,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            <Input
              className="w-full"
              value={name}
              placeholder="Project name"
              onChange={handleNameChange}
            />
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onDismiss}>Close</Button>
          <Button onClick={handleCreateProject}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CreateProjectDialog };
