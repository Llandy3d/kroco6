import type { ApiEndpoint, ApiOperation } from "@/lib/stores/library/types";
import { Plus } from "lucide-react";
import { MethodButton } from "./MethodButton";

function isSameOperation(
  left: ApiOperation | undefined,
  right: ApiOperation | undefined,
) {
  if (left === undefined || right === undefined) {
    return false;
  }

  const leftId = left.details.operationId ?? left.method + left.path;
  const rightId = right.details.operationId ?? right.method + right.path;

  return leftId === rightId;
}

interface ApiPathProps {
  endpoint: ApiEndpoint;
  selected: ApiOperation | undefined;
  onItemSelected: (operation: ApiOperation) => void;
}

function ApiPath({ endpoint, selected, onItemSelected }: ApiPathProps) {
  return (
    <>
      <h3 className="flex items-center justify-between p-2 font-semibold">
        <div>
          {endpoint.path}
          {endpoint.details.summary ? ` - ${endpoint.details.summary}` : ""}
        </div>
        <div>
          <button>
            <Plus size={14} />
          </button>
        </div>
      </h3>
      <ul className="list-none">
        {endpoint.operations.map((operation) => {
          return (
            <MethodButton
              key={operation.id}
              selected={isSameOperation(selected, operation)}
              operation={operation}
              onClick={() => onItemSelected(operation)}
            />
          );
        })}
      </ul>
    </>
  );
}

export { ApiPath };
