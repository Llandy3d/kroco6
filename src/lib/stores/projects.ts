import { writable, type Writable } from "svelte/store";

import type { Environment, Project } from "$lib/backend-client";

export const EMPTY_ENVIRONMENT: Environment = {
  name: "",
  variables: {},
};

/**
 * A store that contains the list of projects.
 *
 * Svelte stores allow to subscribe to changes in the store's value, and
 * to update the store's value. This is useful to share data between
 * components, and to keep the UI in sync with the data.
 *
 * NOTE @oleiade: Considering the projects are used in multiple places
 * in the app, this feels like a good candidate for a store.
 *
 * @type {Writable<Project[]>}
 */
export const projects: Writable<Project[]> = writable([]);

export const currentEnvironment: Writable<Environment | null> = writable(null);
