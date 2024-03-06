import type { OpenAPIV3 } from "openapi-types";
import { any, type BaseSchema } from "valibot";

const openapi: BaseSchema<OpenAPIV3.Document> = any();

export { openapi };
