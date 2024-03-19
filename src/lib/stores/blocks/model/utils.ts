import { exhaustive } from "@/lib/utils/typescript";
import { type Block } from "./loose";
import type { ChainableBlock } from "./strict";

function replace(current: Block, target: Block, replacement: Block): Block {
  if (current.id === target.id) {
    return replacement;
  }

  switch (current.type) {
    case "scenario":
      if (current.step === null && current.executor === null) {
        return current;
      }

      if (current.step?.id === target.id) {
        return {
          ...current,
          step: replacement,
        };
      }

      if (current.executor?.id === target.id) {
        return {
          ...current,
          executor: replacement,
        };
      }

      return {
        ...current,
        executor: current.executor && replace(current.executor, target, replacement),
        step: current.step && replace(current.step, target, replacement),
      };

    case "group":
      if (current.step === null && current.next === null) {
        return current;
      }

      if (current.step?.id === target.id) {
        return {
          ...current,
          step: replacement,
        };
      }

      if (current.next?.id === target.id) {
        return {
          ...current,
          next: replacement,
        };
      }

      return {
        ...current,
        step: current.step && replace(current.step, target, replacement),
        next: current.next && replace(current.next, target, replacement),
      };

    case "executor":
      return current;

    case "check":
      if (current.next === null && current.target === null) {
        return current;
      }

      if (current.next?.id === target.id) {
        return {
          ...current,
          next: replacement,
        };
      }

      if (current.target?.id === target.id) {
        return {
          ...current,
          target: replacement,
        };
      }

      return {
        ...current,
        target: current.target && replace(current.target, target, replacement),
        next: current.next && replace(current.next, target, replacement),
      };

    case "sleep":
    case "http-request":
    case "library":
      if (current.next === null) {
        return current;
      }

      if (current.next.id === target.id) {
        return {
          ...current,
          next: replacement,
        };
      }

      return {
        ...current,
        next: replace(current.next, target, replacement),
      };

    default:
      return exhaustive(current);
  }
}

function detach<T extends Block>(current: T, target: Block): T {
  switch (current.type) {
    case "scenario":
      if (current.step === null && current.executor === null) {
        return current;
      }

      if (current.step?.id === target.id) {
        return {
          ...current,
          step: null,
        };
      }

      if (current.executor?.id === target.id) {
        return {
          ...current,
          executor: null,
        };
      }

      return {
        ...current,
        executor: current.executor && detach(current.executor, target),
        step: current.step && detach(current.step, target),
      };

    case "group":
      if (current.step === null && current.next === null) {
        return current;
      }

      if (current.step?.id === target.id) {
        return {
          ...current,
          step: null,
        };
      }

      if (current.next?.id === target.id) {
        return {
          ...current,
          next: null,
        };
      }

      return {
        ...current,
        step: current.step && detach(current.step, target),
        next: current.next && detach(current.next, target),
      };

    case "executor":
      return current;

    case "check":
      if (current.next === null && current.target === null) {
        return current;
      }

      if (current.next?.id === target.id) {
        return {
          ...current,
          next: null,
        };
      }

      if (current.target?.id === target.id) {
        return {
          ...current,
          target: null,
        };
      }

      return {
        ...current,
        target: current.target && detach(current.target, target),
        next: current.next && detach(current.next, target),
      };

    case "sleep":
    case "http-request":
    case "library":
      if (current.next === null) {
        return current;
      }

      if (current.next.id === target.id) {
        return {
          ...current,
          next: null,
        };
      }

      return {
        ...current,
        next: detach(current.next, target),
      };

    default:
      return exhaustive(current);
  }
}

function concat<T extends ChainableBlock>(left: T, right: Block): T {
  return {
    ...left,
    next: left.next === null ? right : concat(left.next, right),
  };
}

function findBlockById(current: Block | null, id: string): Block | null {
  if (current === null || current.id === id) {
    return current;
  }

  switch (current.type) {
    case "scenario":
      return findBlockById(current.executor, id) ?? findBlockById(current.step, id);

    case "group":
      return findBlockById(current.step, id) ?? findBlockById(current.next, id);

    case "check":
      return findBlockById(current.next, id) ?? findBlockById(current.target, id);

    case "sleep":
    case "http-request":
    case "library":
      return findBlockById(current.next, id);

    case "executor":
      return current.id === id ? current : null;

    default:
      return exhaustive(current);
  }
}

function isDescendantOf(current: Block | null, target: Block): boolean {
  if (current === null) {
    return false;
  }

  if (current.id === target.id) {
    return true;
  }

  switch (current.type) {
    case "scenario":
      return isDescendantOf(current.executor, target) || isDescendantOf(current.step, target);

    case "group":
      return isDescendantOf(current.step, target) || isDescendantOf(current.next, target);

    case "check":
      return isDescendantOf(current.next, target) || isDescendantOf(current.target, target);

    case "sleep":
    case "http-request":
    case "library":
      return isDescendantOf(current.next, target);

    case "executor":
      return current.id === target.id;

    default:
      return exhaustive(current);
  }
}

export { concat, detach, findBlockById, isDescendantOf, replace };
