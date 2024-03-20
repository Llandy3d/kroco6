import { SettingsSection } from "@/views/project-settings/SettingsSection";

function CloudTab() {
  return (
    <div className="px-10 py-8">
      <SettingsSection heading="Authentication">
        <p>Connect your cloud provider to sync your projects.</p>
      </SettingsSection>
    </div>
  );
}

export { CloudTab };
