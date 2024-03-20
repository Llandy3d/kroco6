import { array, fallback, literal, object, safeParse, string, union, type Output } from "valibot";

const VersionSchema = union([literal("latest"), string()]);
const ExtensionsSchema = array(string());

const K6SettingsSchema = object({
  version: fallback(VersionSchema, "latest"),
  extensions: fallback(ExtensionsSchema, []),
});

const ProjectSettingsSchema = object({
  k6: fallback(K6SettingsSchema, {
    version: "latest",
    extensions: [],
  }),
});

type ProjectSettings = Output<typeof ProjectSettingsSchema>;

function parseProjectSettings(content: unknown) {
  return safeParse(ProjectSettingsSchema, content);
}

export { parseProjectSettings, type ProjectSettings };
