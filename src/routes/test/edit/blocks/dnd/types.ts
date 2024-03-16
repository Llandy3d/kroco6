import type { Block, GroupBlock, ScenarioBlock, StepBlock } from "@/lib/stores/blocks/model/loose";

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

type DropAction = DropOnCanvasAction | AttachStepAction | AttachChildAction;

export { type DragData, type DropAction, type DropOnCanvasAction };
