import type { OpenAPIV3 } from "openapi-types";
import { derived } from "svelte/store";
import { test } from "../blocks";
import type { ApiEndpoint } from "./types";

const library = derived(test, ($test) => $test.library);

function syncLibrary(newLibrary: OpenAPIV3.Document) {
  test.update((value) => ({ ...value, library: newLibrary }));
}

function updateInPaths(fn: (operation: OpenAPIV3.PathsObject) => OpenAPIV3.PathsObject) {
  test.update((test) => {
    return {
      ...test,
      library: {
        ...test.library,
        paths: fn(test.library.paths),
      },
    };
  });
}

function updateEndpoint(previous: ApiEndpoint, next: ApiEndpoint) {
  updateInPaths((paths) => {
    return Object.entries(paths).reduce((acc, [path, details]) => {
      const isRenamed = path === previous.path && previous.path !== next.path;

      if (isRenamed || path === next.path) {
        return { ...acc, [next.path]: next.details };
      }

      return { ...acc, [path]: details };
    }, {} as OpenAPIV3.PathsObject);
  });
}

export { library, syncLibrary, updateEndpoint };
