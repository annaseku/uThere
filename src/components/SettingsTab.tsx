import { ChevronRight, Bell, Shield, Users, HelpCircle, LogOut } from "lucide-react";

const settingsSections = [
  {
    title: "Preferences",
    items: [
      { label: "Notifications", icon: Bell, detail: "On" },
      { label: "Privacy", icon: Shield, detail: "" },
    ],
  },
  {
    title: "Groups",
    items: [
      { label: "Manage Groups", icon: Users, detail: "" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help & FAQ", icon: HelpCircle, detail: "" },
    ],
  },
];

const SettingsTab = () => {
  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>

      {settingsSections.map((section) => (
        <div key={section.title}>
          <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {section.title}
          </div>
          <div className="ios-card overflow-hidden">
            {section.items.map((item, i) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 active:bg-accent transition-colors ${
                  i < section.items.length - 1 ? "ios-separator" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-primary" />
                </div>
                <span className="flex-1 text-left text-[15px] font-medium text-foreground">
                  {item.label}
                </span>
                {item.detail && (
                  <span className="text-[14px] text-muted-foreground">{item.detail}</span>
                )}
                <ChevronRight size={16} className="text-muted-foreground/40 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Sign Out */}
      <div className="ios-card overflow-hidden">
        <button className="w-full flex items-center gap-3 px-4 py-3 active:bg-accent transition-colors">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-destructive" />
          </div>
          <span className="flex-1 text-left text-[15px] font-medium text-destructive">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
