function extname(path: string) {
  return path.split(".").pop();
}

function basename(path: string, extension?: string) {
  return path
    .split("/")
    .pop()
    ?.replace(new RegExp(`.${extension}$`), "");
}

function dirname(path: string) {
  return path.split("/").slice(0, -1).join("/");
}

function join(...parts: string[]) {
  return parts.map((part) => part.replace(/^\/$/g, "")).join("/");
}

export { basename, dirname, extname, join };
