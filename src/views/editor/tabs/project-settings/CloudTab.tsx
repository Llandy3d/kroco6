import { SettingsSection } from "@/views/editor/tabs/project-settings/SettingsSection";

function CloudTab() {
  return (
    <div className="px-10 py-8">
      <SettingsSection heading="Authentication">
        <p>Connect to Grafana Cloud k6 to run tests in the cloud.</p>
      </SettingsSection>
    </div>
  );
}

export { CloudTab };
