import type { Test } from "$lib/stores/blocks/model/loose";
import type { OpenAPIV3 } from "openapi-types";
import { getContext, setContext } from "svelte";
import { derived, writable, type Readable, type Writable } from "svelte/store";

interface BlockEditorContext {
  test: Writable<Test>;
  library: Readable<OpenAPIV3.Document>;
}

const setBlockEditorContext = (test: Test) => {
  const testWritable = writable(test);

  return setContext<BlockEditorContext>("block-editor", {
    test: testWritable,
    library: derived(testWritable, ($test) => $test.library),
  });
};

const getBlockEditorContext = () => {
  return getContext<BlockEditorContext>("block-editor");
};

const getCurrentTest = () => {
  return getBlockEditorContext().test;
};

const getCurrentLibrary = () => {
  return getBlockEditorContext().library;
};

export { getCurrentLibrary, getCurrentTest, setBlockEditorContext };
