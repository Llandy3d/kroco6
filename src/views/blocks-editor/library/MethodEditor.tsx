import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiOperation } from "@/lib/stores/library/types";

interface MethodEditorProps {
  operation: ApiOperation;
  onChange: (ev: ApiOperation) => void;
}

function MethodEditor({ operation, onChange }: MethodEditorProps) {
  function handleSummaryChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange({
      ...operation,
      details: {
        ...operation.details,
        summary: event.target.value,
      },
    });
  }

  return (
    <div className="form-grid">
      <Label htmlFor="operation-summary">Summary</Label>
      <Input
        id="operation-summary"
        value={operation.details.summary}
        onChange={handleSummaryChange}
      />
    </div>
  );
}

export { MethodEditor };
