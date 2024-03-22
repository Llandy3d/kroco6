import type { ApiOperation } from "@/lib/stores/library/types";
import { ListButton } from "./ListButton";
import { MethodBadge } from "./MethodBadge";

interface MethodButtonProps {
  selected: boolean;
  operation: ApiOperation;
  onClick: (operation: ApiOperation) => void;
}

function MethodButton({ selected, operation, onClick }: MethodButtonProps) {
  return (
    <ListButton selected={selected} onClick={() => onClick(operation)}>
      <div className="flex items-center">
        <MethodBadge method={operation.method} />
        <div className="flex flex-col items-start">
          <div className="font-bold">
            {operation.details.summary || operation.path}
          </div>
          {operation.details.summary && (
            <div className="text-xs text-gray-500">{operation.path}</div>
          )}
        </div>
      </div>
    </ListButton>
  );
}

export { MethodButton };
