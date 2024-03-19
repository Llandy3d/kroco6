function getExtension(path: string) {
  return path.split(".").pop();
}

function getPathName(path: string) {
  return path.split("/").pop();
}

export { getExtension, getPathName };
