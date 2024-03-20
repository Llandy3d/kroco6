function getExtension(path: string) {
  return path.split(".").pop();
}

function getPathName(path: string) {
  return path.split("/").pop();
}

function join(...parts: string[]) {
  return parts.map((part) => part.replace(/^\/$/g, "")).join("/");
}

export { getExtension, getPathName, join };
