import type { ReactNode } from "react";

interface SettingsSectionProps {
  heading: ReactNode;
  children: ReactNode;
}

function SettingsSection({ heading, children }: SettingsSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 border-b-[1px] pb-2 text-lg font-semibold">
        {heading}
      </h2>
      {children}
    </section>
  );
}

export { SettingsSection };
