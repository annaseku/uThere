import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GroupSelector from "./GroupSelector";
import HouseView from "./HouseView";
import MemberCard from "./MemberCard";
import GroupSettingsDialog from "./GroupSettingsDialog";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { memberStatuses, groups as mockGroups, Group as MockGroup } from "@/lib/mockData";

interface GroupData {
  group_id: string;
  name: string;
  primary_address?: string;
}

const MembersTab = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const fetchGroups = async () => {
    if (!user) return;
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, groups(name, primary_address)")
      .eq("user_id", user.id);

    if (memberships && memberships.length > 0) {
      const mapped = memberships.map(m => {
        const g = m.groups as any;
        return {
          group_id: String(m.group_id),
          name: g?.name ?? `Group ${m.group_id}`,
          primary_address: g?.primary_address,
        };
      });
      setGroups(mapped);
      if (!selectedGroup || !mapped.find(g => g.group_id === selectedGroup.group_id)) {
        setSelectedGroup(mapped[0]);
      }
    } else {
      // Fallback to mock
      const mock = mockGroups.map(g => ({ group_id: g.group_id, name: g.name }));
      setGroups(mock);
      setSelectedGroup(mock[0]);
    }
  };

  const fetchMembers = async () => {
    if (!selectedGroup || !user) {
      // Mock fallback
      if (selectedGroup) {
        setMembers(memberStatuses[selectedGroup.group_id] || []);
      }
      return;
    }

    const { data: memberRows } = await supabase
      .from("group_members")
      .select("user_id, role, users(name, photo_url, is_sharing_location, email)")
      .eq("group_id", Number(selectedGroup.group_id));

    if (memberRows && memberRows.length > 0) {
      const mapped = memberRows.map(m => {
        const u = m.users as any;
        return {
          user: {
            user_id: m.user_id,
            name: u?.name ?? "Unknown",
            photo_url: u?.photo_url ?? "",
            is_sharing_location: u?.is_sharing_location ?? true,
            emoji: u?.name?.charAt(0) ?? "?",
          },
          status: "elsewhere" as const,
          placeName: "Elsewhere",
          lastUpdated: "Now",
        };
      });
      setMembers(mapped);
    } else {
      setMembers(memberStatuses[selectedGroup.group_id] || []);
    }
  };

  useEffect(() => { fetchGroups(); }, [user]);
  useEffect(() => { fetchMembers(); }, [selectedGroup]);

  if (!selectedGroup) return null;

  return (
    <div className="px-4 pt-2 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <GroupSelector
          groups={groups.map(g => ({ group_id: g.group_id, name: g.name, member_ids: [] }))}
          selectedGroup={{ group_id: selectedGroup.group_id, name: selectedGroup.name, member_ids: [] }}
          onGroupChange={(g) => {
            const found = groups.find(gr => gr.group_id === g.group_id);
            if (found) setSelectedGroup(found);
          }}
        />
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Settings size={16} className="text-primary" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedGroup.group_id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <HouseView members={members} />
          <div className="ios-card overflow-hidden divide-y divide-border">
            {members.map((member, i) => (
              <MemberCard key={member.user.user_id} member={member} index={i} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {settingsOpen && (
        <GroupSettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          group={selectedGroup}
          onUpdated={() => { fetchGroups(); fetchMembers(); }}
        />
      )}
    </div>
  );
};

export default MembersTab;
