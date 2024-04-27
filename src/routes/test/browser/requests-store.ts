import { writable } from "svelte/store";
import type { BrowserRequest } from "$lib/browser-types";

export const data = writable<BrowserRequest[]>([]);
