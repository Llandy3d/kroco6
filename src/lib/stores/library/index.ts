import type { OpenAPIV3 } from "openapi-types";
import type { Test } from "../blocks/model/loose";
import type { ApiEndpoint } from "./types";

function syncLibrary(test: Test, newLibrary: OpenAPIV3.Document) {
  return { ...test, library: newLibrary };
}

function updateInPaths(
  test: Test,
  fn: (operation: OpenAPIV3.PathsObject) => OpenAPIV3.PathsObject,
) {
  return {
    ...test,
    library: {
      ...test.library,
      paths: fn(test.library.paths),
    },
  };
}

function updateEndpoint(test: Test, previous: ApiEndpoint, next: ApiEndpoint) {
  return updateInPaths(test, (paths) => {
    return Object.entries(paths).reduce((acc, [path, details]) => {
      const isRenamed = path === previous.path && previous.path !== next.path;

      if (isRenamed || path === next.path) {
        return { ...acc, [next.path]: next.details };
      }

      return { ...acc, [path]: details };
    }, {} as OpenAPIV3.PathsObject);
  });
}

export { syncLibrary, updateEndpoint };
