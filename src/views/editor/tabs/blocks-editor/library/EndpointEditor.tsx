import { Button } from "@/components/base/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/base/dropdown-menu";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { HTTP_METHODS } from "@/lib/stores/library/constants";
import type { ApiEndpoint, ApiOperation } from "@/lib/stores/library/types";
import { cn } from "@/lib/utils";
import type { HttpMethod, Operation } from "@/schemas/openapi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Plus } from "lucide-react";
import type { ChangeEvent } from "react";
import { MethodEditor } from "./MethodEditor";

interface EndpointEditorProps {
  endpoint: ApiEndpoint;
  selected: HttpMethod;
  onChange: (endpoint: ApiEndpoint) => void;
  onOperationSelected: (operation: ApiOperation) => void;
}

function EndpointEditor({
  selected,
  endpoint,
  onChange,
  onOperationSelected,
}: EndpointEditorProps) {
  const unusedMethods = HTTP_METHODS.filter(
    (method) =>
      !endpoint.operations.some((operation) => operation.method === method),
  );

  // function handleSummaryChange(event: ChangeEvent<HTMLInputElement>) {
  //   onChange({
  //     ...endpoint,
  //     details: {
  //       ...endpoint.details,
  //       summary: event.target.value,
  //     },
  //   });
  // }

  function handlePathChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...endpoint,
      path: event.target.value,
    });
  }

  function handleOperationChange(operation: ApiOperation) {
    onChange({
      ...endpoint,
      details: {
        ...endpoint.details,
        [operation.method]: operation.details,
      },
    });
  }

  function handleOperationSelected(value: string | undefined) {
    const operation = endpoint.operations.find(
      (operation) => operation.method === value,
    );

    if (operation === undefined) {
      return;
    }

    onOperationSelected(operation);
  }

  function handleAddOperation(method: HttpMethod) {
    const newOperation: Operation = {
      description: "",
      responses: {},
    };

    onChange({
      ...endpoint,
      details: {
        ...endpoint.details,
        [method]: newOperation,
      },
    });

    onOperationSelected({
      id: `${method} ${endpoint.path}`,
      path: endpoint.path,
      method,
      details: newOperation,
    });
  }

  return (
    <>
      <div className="form-grid mb-4 items-center justify-end">
        <Label htmlFor="path" className="text-right font-normal">
          Path
        </Label>
        <Input id="path" value={endpoint.path} onChange={handlePathChange} />
        {/* <Label htmlFor="summary" className="text-right font-normal">
          Summary
        </Label>
        <Input
          id="summary"
          value={endpoint.details.summary}
          onChange={handleSummaryChange}
        /> */}
      </div>

      <Tabs
        className="Root"
        value={selected}
        onValueChange={handleOperationSelected}
      >
        <TabsList className="mb-4 flex border-b-2 border-slate-200">
          {endpoint.operations.map((operation) => {
            return (
              <TabsTrigger
                key={operation.id}
                className="w-24 p-2 data-[state='active']:bg-primary data-[state='active']:text-primary-foreground"
                value={operation.method}
              >
                {operation.method.toUpperCase()}
              </TabsTrigger>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Plus />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {unusedMethods.map((method) => {
                return (
                  <DropdownMenuItem
                    key={method}
                    className={cn("p-2")}
                    onClick={() => handleAddOperation(method)}
                  >
                    {method.toUpperCase()}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </TabsList>
        {endpoint.operations.map((operation) => {
          return (
            <TabsContent key={operation.id} value={operation.method}>
              <MethodEditor
                operation={operation}
                onChange={handleOperationChange}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </>
  );
}

export { EndpointEditor };