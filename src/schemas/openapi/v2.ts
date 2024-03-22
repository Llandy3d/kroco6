import {
  any,
  array,
  boolean,
  lazy,
  literal,
  number,
  object,
  optional,
  record,
  string,
  union,
  unknown,
  variant,
  type BaseSchema,
  type Output,
} from "valibot";

const DataTypeFormatSchema = union([
  literal("int32"),
  literal("int64"),
  literal("float"),
  literal("double"),
  literal("string"),
  literal("byte"),
  literal("binary"),
  literal("boolean"),
  literal("date"),
  literal("dateTime"),
  literal("password"),
]);

type DataTypeFormat = Output<typeof DataTypeFormatSchema>;

const ContactSchema = object({
  name: optional(string()),
  url: optional(string()),
  email: optional(string()),
});

const LicenseSchema = object({
  name: string(),
  url: optional(string()),
});

const InfoSchema = object({
  title: string(),
  version: string(),
  description: optional(string()),
  termsOfService: optional(string()),
  contact: optional(ContactSchema),
  license: optional(LicenseSchema),
});

const MimeTypeSchema = string();

const SchemeSchema = union([
  literal("http"),
  literal("https"),
  literal("ws"),
  literal("wss"),
]);

const BasicSecuritySchema = object({
  type: literal("basic"),
  description: optional(string()),
});

const ApiKeySecuritySchema = object({
  type: literal("apiKey"),
  description: optional(string()),
  name: string(),
  in: union([literal("query"), literal("header")]),
});

const ImplicitSecuritySchema = object({
  type: literal("oauth2"),
  description: optional(string()),
  name: string(),
  scopes: record(string()),
  flow: literal("implicit"),
  authorizationUrl: string(),
});

const AccessCodeSecuritySchema = object({
  type: literal("oauth2"),
  description: optional(string()),
  name: string(),
  scopes: record(string()),
  flow: literal("accessCode"),
  authorizationUrl: string(),
  tokenUrl: string(),
});

const PasswordAndApplicationSecuritySchema = object({
  type: literal("oauth2"),
  description: optional(string()),
  name: string(),
  scopes: record(string()),
  flow: union([literal("password"), literal("application")]),
  tokenUrl: string(),
});

const OAuth2SecuritySchema = variant("flow", [
  ImplicitSecuritySchema,
  AccessCodeSecuritySchema,
  PasswordAndApplicationSecuritySchema,
]);

const SecuritySchema = variant("type", [
  BasicSecuritySchema,
  ApiKeySecuritySchema,
  OAuth2SecuritySchema,
]);

const ExternalDocumentationSchema = object({
  description: optional(string()),
  url: string(),
});

const SecurityRequirementSchema = record(array(string()));

interface ItemsSchema {
  type?:
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "array"
    | "object"
    | "int";
  format?: DataTypeFormat;
  items?: ItemsSchema;
  collectionFormat?: string;
  default?: unknown;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  enum?: unknown[];
  multipleOf?: number;
}

const TypeSchema = union([
  literal("string"),
  literal("number"),
  literal("integer"),
  literal("boolean"),
  literal("array"),
  literal("object"),

  // Non-standard types, as detected in the wild
  literal("int"),
]);

const ItemsSchema: BaseSchema<ItemsSchema> = object({
  type: optional(TypeSchema, "string"),
  format: optional(DataTypeFormatSchema),
  items: optional(lazy(() => ItemsSchema)),
  collectionFormat: optional(string()),
  default: unknown(),
  maximum: optional(number()),
  exclusiveMaximum: optional(boolean()),
  minimum: optional(number()),
  exclusiveMinimum: optional(boolean()),
  maxLength: optional(number()),
  minLength: optional(number()),
  pattern: optional(string()),
  maxItems: optional(number()),
  minItems: optional(number()),
  uniqueItems: optional(boolean()),
  enum: optional(array(unknown())),
  multipleOf: optional(number()),
});

const SchemaSchema = any();

const BodyParameter = object({
  in: literal("body"),
  name: string(),
  description: optional(string()),
  required: optional(boolean(), false),
  schema: SchemaSchema,
});

const PathParameter = object({
  in: literal("path"),
  required: optional(literal(true), true),
  name: string(),
  description: optional(string()),
  type: optional(TypeSchema, "string"),
  format: optional(DataTypeFormatSchema),
  items: optional(ItemsSchema),
  collectionFormat: optional(string()),
  default: optional(unknown()),
  maximum: optional(number()),
  exclusiveMaximum: optional(boolean()),
  minimum: optional(number()),
  exclusiveMinimum: optional(boolean()),
  maxLength: optional(number()),
  minLength: optional(number()),
  pattern: optional(string()),
  maxItems: optional(number()),
  minItems: optional(number()),
  uniqueItems: optional(boolean()),
  enum: optional(array(unknown())),
  multipleOf: optional(number()),
});

const OtherParameter = object({
  in: union([literal("query"), literal("header"), literal("formData")]),
  required: optional(boolean(), false),
  name: string(),
  description: optional(string()),
  type: optional(TypeSchema, "string"),
  format: optional(DataTypeFormatSchema),
  items: optional(ItemsSchema),
  collectionFormat: optional(string()),
  default: optional(unknown()),
  maximum: optional(number()),
  exclusiveMaximum: optional(boolean()),
  minimum: optional(number()),
  exclusiveMinimum: optional(boolean()),
  maxLength: optional(number()),
  minLength: optional(number()),
  pattern: optional(string()),
  maxItems: optional(number()),
  minItems: optional(number()),
  uniqueItems: optional(boolean()),
  enum: optional(array(unknown())),
  multipleOf: optional(number()),
});

const ParameterSchema = variant("in", [
  BodyParameter,
  PathParameter,
  OtherParameter,
]);

const HeaderTypeSchema = union([
  literal("string"),
  literal("number"),
  literal("integer"),
  literal("boolean"),
  literal("array"),
]);

const HeaderSchema = object({
  type: optional(HeaderTypeSchema, "string"),
  format: optional(DataTypeFormatSchema),
  items: optional(ItemsSchema),
  collectionFormat: optional(string()),
  default: optional(unknown()),
  maximum: optional(number()),
  exclusiveMaximum: optional(boolean()),
  minimum: optional(number()),
  exclusiveMinimum: optional(boolean()),
  maxLength: optional(number()),
  minLength: optional(number()),
  pattern: optional(string()),
  maxItems: optional(number()),
  minItems: optional(number()),
  uniqueItems: optional(boolean()),
  enum: optional(array(unknown())),
  multipleOf: optional(number()),
});

const HeadersSchema = record(HeaderSchema);

const ExampleSchema = record(MimeTypeSchema, unknown());

const ReferenceSchema = object({
  $ref: string(),
});

const ResponseSchema = object({
  description: string(),
  schema: optional(SchemaSchema),
  headers: optional(HeadersSchema),
  examples: optional(ExampleSchema),
});

const ReferenceOrResponseSchema = union([ReferenceSchema, ResponseSchema]);

const ResponsesSchema = object(
  {
    default: optional(ReferenceOrResponseSchema),
  },
  ReferenceOrResponseSchema,
);

const OperationSchema = object({
  tags: optional(array(string())),
  summary: optional(string()),
  description: optional(string()),
  externalDocs: optional(ReferenceSchema),
  operationId: optional(string()),
  consumes: optional(array(MimeTypeSchema)),
  produces: optional(array(MimeTypeSchema)),
  parameters: optional(array(union([ReferenceSchema, ParameterSchema]))),
  responses: ResponsesSchema,
  schemes: optional(array(SchemeSchema)),
  deprecated: optional(boolean()),
  security: optional(array(SecurityRequirementSchema)),
  servers: optional(array(object({}))),
});

type Operation = Output<typeof OperationSchema>;

const PathItemSchema = object({
  $ref: optional(string()),
  get: optional(OperationSchema),
  put: optional(OperationSchema),
  post: optional(OperationSchema),
  delete: optional(OperationSchema),
  options: optional(OperationSchema),
  head: optional(OperationSchema),
  patch: optional(OperationSchema),
  parameters: optional(array(union([ReferenceSchema, ParameterSchema]))),
});

type PathItem = Output<typeof PathItemSchema>;

type HttpMethod = Exclude<keyof PathItem, "$ref" | "parameters">;

const PathsSchema = record(PathItemSchema);

type Paths = Output<typeof PathsSchema>;

const DefinitionsSchema = record(SchemaSchema);
const ResponsesDefintionsSchema = record(ResponseSchema);
const SecurityDefinitionsSchema = record(SecuritySchema);

const ParametersSchema = record(ParameterSchema);

const TagSchema = object({
  name: string(),
  description: optional(string()),
  externalDocs: optional(ExternalDocumentationSchema),
});

const OpenAPIv2Schema = object({
  swagger: literal("2.0"),
  info: InfoSchema,
  host: optional(string()),
  basePath: optional(string()),
  schemes: optional(array(SchemeSchema)),
  consumes: optional(array(MimeTypeSchema)),
  produces: optional(array(MimeTypeSchema)),
  paths: PathsSchema,
  definitions: optional(DefinitionsSchema),
  parameters: optional(ParametersSchema),
  responses: optional(ResponsesDefintionsSchema),
  securityDefinitions: optional(SecurityDefinitionsSchema),
  tags: optional(array(TagSchema)),
  externalDocs: optional(ExternalDocumentationSchema),
  "x-synced-from": optional(string()),
});

type OpenAPIv2 = Output<typeof OpenAPIv2Schema>;

export {
  OpenAPIv2Schema,
  type HttpMethod,
  type OpenAPIv2,
  type Operation,
  type PathItem,
  type Paths,
};
