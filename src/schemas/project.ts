import { array, literal, object, optional, safeParse, string, union, type Output } from "valibot";

const VersionSchema = union([literal("v0.49.0"), string()]);
const ExtensionsSchema = array(string());

const K6SettingsSchema = object({
  version: optional(VersionSchema, "v0.49.0"),
  extensions: optional(ExtensionsSchema, []),
});

const ProjectSettingsSchema = object({
  k6: optional(K6SettingsSchema, {
    version: "v0.49.0",
    extensions: [],
  }),
});

type ProjectSettings = Output<typeof ProjectSettingsSchema>;

function parseProjectSettings(content: unknown) {
  return safeParse(ProjectSettingsSchema, content);
}

export { parseProjectSettings, type ProjectSettings };
