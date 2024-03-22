import type { ReactNode } from "react";

interface SidebarSectionProps {
  className?: string;
  title: string;
  children: ReactNode;
}

function SidebarSection({ className, title, children }: SidebarSectionProps) {
  return (
    <section className={className}>
      <h2 className="text-left text-sm font-bold uppercase">{title}</h2>
      {children}
    </section>
  );
}

export { SidebarSection };
