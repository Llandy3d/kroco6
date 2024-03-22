import { useProjectValue } from "@/atoms/project";
import { Layout } from "./Layout";
import { Editor } from "./test/edit/Editor";

function Page() {
  const project = useProjectValue();

  return <Layout>{project && <Editor project={project} />}</Layout>;
}

export { Page };
