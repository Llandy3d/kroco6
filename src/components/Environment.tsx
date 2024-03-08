import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Environment as EnvironmentType } from "@/lib/backend-client";
import { Container, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";

interface EnvironmentProps {
  environment: EnvironmentType;
  onChange: (environment: EnvironmentType) => void;
}

function Environment({ environment, onChange }: EnvironmentProps) {
  function handleAddVariable() {}

  function handleNameEdit(event: ChangeEvent<HTMLInputElement>, originalName: string) {
    const { [originalName]: value, ...variables } = environment.variables;

    onChange({
      ...environment,
      variables: {
        ...variables,
        [event.target.value]: value ?? "",
      },
    });
  }

  function handleValueEdit(event: ChangeEvent<HTMLInputElement>, name: string) {
    onChange({
      ...environment,
      variables: {
        ...environment.variables,
        [name]: event.target.value,
      },
    });
  }

  function handleDelete(name: string) {
    const { [name]: _, ...variables } = environment.variables;

    onChange({
      ...environment,
      variables,
    });
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="flex items-center gap-1 text-sm">
          <Container size="12" />
          {environment.name}
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {environment.name.charAt(0).toUpperCase() + environment.name.slice(1)} Environment
          </DialogTitle>
          <DialogDescription>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    Value
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  ></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {Object.entries(environment.variables).map(([name, value]) => (
                  <tr>
                    <td>
                      <Input
                        className="border-none"
                        value={name}
                        onChange={(event) => handleNameEdit(event, name)}
                      />
                    </td>
                    <td>
                      <Input
                        className="border-none"
                        value={value}
                        onChange={(event) => handleValueEdit(event, name)}
                      />
                    </td>
                    <td>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(name)}>
                        <Trash2 size="16" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button variant="link" onClick={handleAddVariable}>
              + Add Variable
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export { Environment };
