import { OpenAPIV3 } from "openapi-types";

const HTTP_METHODS = [
  OpenAPIV3.HttpMethods.GET,
  OpenAPIV3.HttpMethods.PUT,
  OpenAPIV3.HttpMethods.POST,
  OpenAPIV3.HttpMethods.DELETE,
  OpenAPIV3.HttpMethods.PATCH,
  OpenAPIV3.HttpMethods.HEAD,
  OpenAPIV3.HttpMethods.OPTIONS,
  OpenAPIV3.HttpMethods.TRACE,
];

export { HTTP_METHODS };
