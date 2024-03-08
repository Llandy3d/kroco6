import type { OpenAPIV3 } from "openapi-types";

interface ApiEndpoint {
  path: string;
  details: OpenAPIV3.PathItemObject;
  operations: ApiOperation[];
}

interface ApiOperation {
  id: string;
  path: string;
  method: OpenAPIV3.HttpMethods;
  details: OpenAPIV3.OperationObject;
}

export type { ApiEndpoint, ApiOperation };
