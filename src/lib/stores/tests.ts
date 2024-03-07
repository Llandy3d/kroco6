import { listTests, Test } from "$lib/backend-client";
import { derived, writable } from "svelte/store";
import { activeProject } from "./projects";

const _tests = writable<Test[]>([]);

export const tests = derived(_tests, ($tests) => $tests);

export async function refetchTests(projectName: string) {
  const newTests = await listTests(projectName);
  _tests.set(newTests);
}

// Refetch tests whenever activeProject changes
activeProject.subscribe((value) => {
  if (value) {
    refetchTests(value);
  }
});
