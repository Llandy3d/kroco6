import type { HttpMethod, Operation, PathItem } from "@/schemas/openapi";

interface ApiEndpoint {
  path: string;
  details: PathItem;
  operations: ApiOperation[];
}

interface ApiOperation {
  id: string;
  path: string;
  method: HttpMethod;
  details: Operation;
}

export type { ApiEndpoint, ApiOperation };
