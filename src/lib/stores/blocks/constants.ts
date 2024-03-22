import type { OpenAPI } from "@/schemas/openapi";
import type { Test } from "./model/strict";

const EMPTY_LIBRARY: OpenAPI = {
  swagger: "2.0",
  info: {
    title: "Untitled API",
    version: "0.0.0",
  },
  paths: {},
};

const EMPTY_BLOCK_TEST: Test = {
  library: EMPTY_LIBRARY,
  roots: [],
};

export { EMPTY_BLOCK_TEST, EMPTY_LIBRARY };
