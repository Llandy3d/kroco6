import { array, fallback, literal, object, safeParse, string, union, type Output } from "valibot";

const VersionSchema = union([literal("v0.49.0"), string()]);
const ExtensionsSchema = array(string());

const K6SettingsSchema = object({
  version: fallback(VersionSchema, "v0.49.0"),
  extensions: fallback(ExtensionsSchema, []),
});

const ProjectSettingsSchema = object({
  k6: fallback(K6SettingsSchema, {
    version: "v0.49.0",
    extensions: [],
  }),
});

type ProjectSettings = Output<typeof ProjectSettingsSchema>;

function parseProjectSettings(content: unknown) {
  return safeParse(ProjectSettingsSchema, content);
}

export { parseProjectSettings, type ProjectSettings };
