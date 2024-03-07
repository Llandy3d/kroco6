import { Toaster } from "@/components/ui/toaster";
import type { EnvironmentsData, Project } from "@/lib/backend-client";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  projects: Project[];
  environments: EnvironmentsData;
  children: ReactNode;
}

function Layout({ projects, environments, children }: LayoutProps) {
  return (
    <>
      <Toaster />

      <div className="flex">
        <div className="w-60">
          <Sidebar projects={projects} tests={[]} environments={environments} />
        </div>

        <div className="flex flex-auto flex-col bg-[#F9F8FC] p-4 pt-1">{children}</div>
      </div>
    </>
  );
}

export { Layout };
