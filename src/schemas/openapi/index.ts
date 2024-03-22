import {
  OpenAPIv2Schema,
  type HttpMethod,
  type Operation,
  type PathItem,
} from "@/schemas/openapi/v2";
import { safeParse, type Output } from "valibot";

const OpenAPISchema = OpenAPIv2Schema;

type OpenAPI = Output<typeof OpenAPISchema>;

function parseOpenAPI(data: unknown) {
  return safeParse(OpenAPISchema, data);
}

export {
  OpenAPISchema,
  parseOpenAPI,
  type HttpMethod,
  type OpenAPI,
  type Operation,
  type PathItem,
};
