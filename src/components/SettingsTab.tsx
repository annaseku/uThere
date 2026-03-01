import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Bell, Shield, Users, HelpCircle, LogOut, MapPin, Plus, Palette, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGroupPrivacy } from "@/hooks/useGroupPrivacy";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GroupSettingsDialog from "./GroupSettingsDialog";
import CreateGroupDialog from "./CreateGroupDialog";

interface GroupData {
  group_id: string;
  name: string;
  primary_address?: string;
}

interface SettingsTabProps {
  groups: GroupData[];
  selectedGroup: GroupData | null;
  onGroupsChanged: () => void;
}

const COLOR_SCHEMES = [
  { id: "theme-blue", label: "Blue", color: "hsl(211 100% 50%)" },
  { id: "theme-purple", label: "Purple", color: "hsl(270 70% 55%)" },
  { id: "theme-green", label: "Green", color: "hsl(152 60% 42%)" },
  { id: "theme-orange", label: "Orange", color: "hsl(24 95% 53%)" },
  { id: "theme-rose", label: "Rose", color: "hsl(346 77% 55%)" },
];

const SettingsTab = ({ groups, onGroupsChanged }: SettingsTabProps) => {
  const { user, updateUser } = useCurrentUser();
  const { privacy, toggleVisibility } = useGroupPrivacy();
  const { signOut, user: authUser } = useAuth();
  const navigate = useNavigate();

  const [editingGroup, setEditingGroup] = useState<GroupData | null>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("color-theme") || "theme-blue");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  // Sync local state from DOM on mount (theme is applied by AuthContext)
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("color-theme") || "theme-blue";
    setCurrentTheme(saved);
    setIsDark(root.classList.contains("dark"));
  }, []);

  // Build privacy data grouped by group
  const groupPrivacy = privacy.reduce<Record<number, { group_name: string; entries: typeof privacy }>>((acc, entry) => {
    if (!acc[entry.group_id]) {
      acc[entry.group_id] = { group_name: entry.group_name, entries: [] };
    }
    acc[entry.group_id].entries.push(entry);
    return acc;
  }, {});

  const applyTheme = async (themeId: string) => {
    const root = document.documentElement;
    COLOR_SCHEMES.forEach(s => root.classList.remove(s.id));
    root.classList.add(themeId);
    setCurrentTheme(themeId);
    localStorage.setItem("color-theme", themeId);
    if (authUser) {
      await supabase.from("users").update({ color_scheme: themeId }).eq("user_id", authUser.id);
    }
  };

  const toggleDarkMode = async () => {
    const root = document.documentElement;
    const newDark = !isDark;
    if (newDark) root.classList.add("dark"); else root.classList.remove("dark");
    localStorage.setItem("dark-mode", String(newDark));
    setIsDark(newDark);
    if (authUser) {
      await supabase.from("users").update({ dark_mode: newDark }).eq("user_id", authUser.id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>

      {/* Appearance */}
      <div>
        <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
          Appearance
        </div>
        <div className="ios-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 ios-separator">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {isDark ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
            </div>
            <span className="flex-1 text-[15px] font-medium text-foreground">Dark Mode</span>
            <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Palette size={16} className="text-primary" />
              </div>
              <span className="text-[15px] font-medium text-foreground">Color Scheme</span>
            </div>
            <div className="flex gap-3 ml-11">
              {COLOR_SCHEMES.map(scheme => (
                <button
                  key={scheme.id}
                  onClick={() => applyTheme(scheme.id)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      currentTheme === scheme.id ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: scheme.color }}
                  />
                  <span className="text-[11px] text-muted-foreground">{scheme.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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

      {/* Privacy — grouped by group, click to expand places */}
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
              Choose which places each group can see
            </p>
          </div>
          {Object.keys(groupPrivacy).length === 0 && (
            <div className="px-4 py-4 text-center text-[14px] text-muted-foreground">
              Add saved places and join groups to manage visibility
            </div>
          )}
          {Object.entries(groupPrivacy).map(([groupIdStr, { group_name, entries }]) => {
            const groupId = Number(groupIdStr);
            const isExpanded = expandedGroupId === groupId;
            return (
              <div key={groupId}>
                <button
                  onClick={() => setExpandedGroupId(isExpanded ? null : groupId)}
                  className="w-full flex items-center gap-3 px-4 py-3 pl-14 ios-separator active:bg-accent transition-colors"
                >
                  <Users size={14} className="text-muted-foreground" />
                  <span className="flex-1 text-left text-[15px] font-medium text-foreground">{group_name}</span>
                  {isExpanded
                    ? <ChevronDown size={16} className="text-muted-foreground/40" />
                    : <ChevronRight size={16} className="text-muted-foreground/40" />
                  }
                </button>
                {isExpanded && entries.map((entry, i) => (
                  <div
                    key={`${entry.place_id}-${entry.group_id}`}
                    className={`flex items-center justify-between px-4 py-3 pl-20 ${
                      i < entries.length - 1 ? "ios-separator" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-muted-foreground" />
                      <span className="text-[15px] text-foreground">{entry.place_label}</span>
                    </div>
                    <Switch
                      checked={entry.is_visible}
                      onCheckedChange={() => {
                        toggleVisibility(entry.place_id, entry.group_id);
                        toast.success(
                          entry.is_visible
                            ? `${entry.place_label} hidden from ${group_name}`
                            : `${entry.place_label} visible to ${group_name}`
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Groups */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Groups</div>
          <button onClick={() => setCreateGroupOpen(true)} className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus size={14} className="text-primary" />
          </button>
        </div>
        <div className="ios-card overflow-hidden">
          {groups.length === 0 && (
            <div className="px-4 py-4 text-center text-[14px] text-muted-foreground">You're not in any groups yet</div>
          )}
          {groups.map((g, i) => (
            <button
              key={g.group_id}
              onClick={() => setEditingGroup(g)}
              className={`w-full flex items-center gap-3 px-4 py-3 active:bg-accent transition-colors ${i < groups.length - 1 ? "ios-separator" : ""}`}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[15px] font-medium text-foreground">{g.name}</div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/40 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Support */}
      <div>
        <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">Support</div>
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
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 active:bg-accent transition-colors">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-destructive" />
          </div>
          <span className="flex-1 text-left text-[15px] font-medium text-destructive">Sign Out</span>
        </button>
      </div>

      {/* Dialogs */}
      {editingGroup && (
        <GroupSettingsDialog
          open={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          group={editingGroup}
          onUpdated={() => { onGroupsChanged(); setEditingGroup(null); }}
        />
      )}
      <CreateGroupDialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} onCreated={onGroupsChanged} />
    </div>
  );
};

export default SettingsTab;
