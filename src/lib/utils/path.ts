function getExtension(path: string) {
  return path.split(".").pop();
}

function getFileName(path: string) {
  return path.split("/").pop();
}

export { getExtension, getFileName };
