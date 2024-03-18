import type {
  Block,
  CheckBlock,
  GroupBlock,
  ScenarioBlock,
  StepBlock,
} from "@/lib/stores/blocks/model/loose";

interface DragData {
  block: Block;
}

interface DropOnCanvasAction {
  type: "drop-on-canvas";
}

interface AttachStepAction {
  type: "attach-step";
  target: StepBlock;
}

interface AttachChildAction {
  type: "attach-child";
  target: ScenarioBlock | GroupBlock;
}

interface AssignExecutorAction {
  type: "assign-executor";
  target: ScenarioBlock;
}

interface AssignCheckTargetAction {
  type: "assign-check-target";
  target: CheckBlock;
}

type DropAction =
  | DropOnCanvasAction
  | AttachStepAction
  | AttachChildAction
  | AssignExecutorAction
  | AssignCheckTargetAction;

interface DropData {
  kind: "bottom" | "inset" | "canvas";
  action: DropAction;
}

export { type DragData, type DropAction, type DropData, type DropOnCanvasAction };
