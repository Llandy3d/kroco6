import type { OpenAPIV3 } from "openapi-types";
import type { Test } from "./model/strict";

const EMPTY_LIBRARY: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "",
    version: "",
  },
  paths: {},
};

const EMPTY_BLOCK_TEST: Test = {
  library: EMPTY_LIBRARY,
  roots: [],
};

export { EMPTY_BLOCK_TEST, EMPTY_LIBRARY };
