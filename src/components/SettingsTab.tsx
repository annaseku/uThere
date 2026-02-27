import { ChevronRight, Bell, Shield, Users, HelpCircle, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGroupPrivacy } from "@/hooks/useGroupPrivacy";
import { toast } from "sonner";

const SettingsTab = () => {
  const { user, updateUser } = useCurrentUser();
  const { privacy, toggleGroupVisibility } = useGroupPrivacy();

  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>

      {/* Notifications */}
      <div>
        <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
          Preferences
        </div>
        <div className="ios-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-primary" />
            </div>
            <span className="flex-1 text-[15px] font-medium text-foreground">Notifications</span>
            <Switch
              checked={user.notifications_enabled}
              onCheckedChange={(val) => {
                updateUser({ notifications_enabled: val });
                toast.success(val ? "Notifications enabled" : "Notifications disabled");
              }}
            />
          </div>
        </div>
      </div>

      {/* Privacy - Per-Group Location Visibility */}
      <div>
        <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
          Privacy
        </div>
        <div className="ios-card overflow-hidden">
          <div className="px-4 py-3 ios-separator">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-primary" />
              </div>
              <span className="flex-1 text-[15px] font-medium text-foreground">Location Visibility</span>
            </div>
            <p className="text-[13px] text-muted-foreground mt-1 ml-11">
              Choose which groups can see your location
            </p>
          </div>
          {privacy.map((group, i) => (
            <div
              key={group.group_id}
              className={`flex items-center justify-between px-4 py-3 pl-14 ${
                i < privacy.length - 1 ? "ios-separator" : ""
              }`}
            >
              <span className="text-[15px] text-foreground">{group.group_name}</span>
              <Switch
                checked={group.is_location_visible}
                onCheckedChange={() => {
                  toggleGroupVisibility(group.group_id);
                  toast.success(
                    group.is_location_visible
                      ? `Hidden from ${group.group_name}`
                      : `Visible to ${group.group_name}`
                  );
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div>
        <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
          Groups
        </div>
        <div className="ios-card overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3 active:bg-accent transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-primary" />
            </div>
            <span className="flex-1 text-left text-[15px] font-medium text-foreground">Manage Groups</span>
            <ChevronRight size={16} className="text-muted-foreground/40 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Support */}
      <div>
        <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
          Support
        </div>
        <div className="ios-card overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3 active:bg-accent transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <HelpCircle size={16} className="text-primary" />
            </div>
            <span className="flex-1 text-left text-[15px] font-medium text-foreground">Help & FAQ</span>
            <ChevronRight size={16} className="text-muted-foreground/40 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="ios-card overflow-hidden">
        <button className="w-full flex items-center gap-3 px-4 py-3 active:bg-accent transition-colors">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-destructive" />
          </div>
          <span className="flex-1 text-left text-[15px] font-medium text-destructive">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
