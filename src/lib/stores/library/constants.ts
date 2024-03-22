import type { HttpMethod } from "@/schemas/openapi";

const HTTP_METHODS: HttpMethod[] = [
  "get",
  "put",
  "post",
  "delete",
  "patch",
  "head",
  "options",
];

export { HTTP_METHODS };
