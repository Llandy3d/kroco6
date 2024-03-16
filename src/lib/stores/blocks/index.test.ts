import { snapStepToBottom } from "@/lib/stores/blocks";
import { defineTemplate, isTemplate } from "@/lib/stores/blocks/model/loose";
import type { StepBlock } from "@/lib/stores/blocks/model/strict";
import { describe, expect, it } from "vitest";

describe("snapStepToBottom", () => {
  it("should attach a step to the bottom of other step", () => {
    const target: StepBlock = {
      id: "1",
      type: "sleep",
      seconds: 1,
      next: null,
    };

    const next: StepBlock = {
      id: "2",
      type: "sleep",
      seconds: 2,
      next: null,
    };

    const result = snapStepToBottom(target, next);

    expect(result).toEqual({
      id: "1",
      type: "sleep",
      seconds: 1,
      next: {
        id: "2",
        type: "sleep",
        seconds: 2,
        next: null,
      },
    });
  });

  it("should attach existing step to bottom of new step", () => {
    const target: StepBlock = {
      id: "1",
      type: "sleep",
      seconds: 1,
      next: {
        id: "2",
        type: "sleep",
        seconds: 2,
        next: null,
      },
    };

    const next: StepBlock = {
      id: "3",
      type: "sleep",
      seconds: 2,
      next: null,
    };

    const result = snapStepToBottom(target, next);

    expect(result).toEqual({
      id: "1",
      type: "sleep",
      seconds: 1,
      next: {
        id: "3",
        type: "sleep",
        seconds: 2,
        next: {
          id: "2",
          type: "sleep",
          seconds: 2,
          next: null,
        },
      },
    });
  });

  it("should attach existing step to the last step of new step", () => {
    const target: StepBlock = {
      id: "1",
      type: "sleep",
      seconds: 1,
      next: {
        id: "2",
        type: "sleep",
        seconds: 2,
        next: null,
      },
    };

    const next: StepBlock = {
      id: "3",
      type: "sleep",
      seconds: 2,
      next: {
        id: "4",
        type: "sleep",
        seconds: 2,
        next: {
          id: "5",
          type: "sleep",
          seconds: 2,
          next: null,
        },
      },
    };

    const result = snapStepToBottom(target, next);

    expect(result).toEqual({
      id: "1",
      type: "sleep",
      seconds: 1,
      next: {
        id: "3",
        type: "sleep",
        seconds: 2,
        next: {
          id: "4",
          type: "sleep",
          seconds: 2,
          next: {
            id: "5",
            type: "sleep",
            seconds: 2,
            next: {
              id: "2",
              type: "sleep",
              seconds: 2,
              next: null,
            },
          },
        },
      },
    });
  });

  it("should instantiate the step before attaching it", () => {
    const target: StepBlock = {
      id: "1",
      type: "sleep",
      seconds: 1,
      next: null,
    };

    const next: StepBlock = defineTemplate({
      id: "my-template",
      type: "sleep",
      seconds: 2,
      next: null,
    });

    const result = snapStepToBottom(target, next);

    expect(result).toEqual({
      id: "1",
      type: "sleep",
      seconds: 1,
      next: {
        id: expect.not.stringMatching("my-template"),
        type: "sleep",
        seconds: 2,
        next: null,
      },
    });

    expect(isTemplate(result)).toBe(false);
  });
});
