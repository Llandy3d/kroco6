import type { Environment as EnvironmentType } from "@/lib/backend-client";
import { Environment } from "./Environment";

{
  /* <script lang="ts">
  import type { Environment as IEnvironment } from "$lib/backend-client";
  import Environment from "./Environment";

  export let environments: IEnvironment[];
</script> */
}

interface EnvironmentListProps {
  environments: EnvironmentType[];
  onChange: (environments: EnvironmentType[]) => void;
}

function EnvironmentList({ environments, onChange }: EnvironmentListProps) {
  function handleEnvironmentChange(environment: EnvironmentType) {
    onChange(environments.map((env) => (env.name === environment.name ? environment : env)));
  }

  return (
    <nav className="mt-1 flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {environments.map((environment) => (
        <Environment
          key={environment.name}
          environment={environment}
          onChange={handleEnvironmentChange}
        />
      ))}
    </nav>
  );
}

export { EnvironmentList };
