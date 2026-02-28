import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GroupSelector from "./GroupSelector";
import HouseView from "./HouseView";
import MemberCard from "./MemberCard";
import GroupSettingsDialog from "./GroupSettingsDialog";
import CreateGroupDialog from "./CreateGroupDialog";
import JoinGroupDialog from "./JoinGroupDialog";
import AddMemberDialog from "./AddMemberDialog";
import { Settings, Plus, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLocationStatus } from "@/lib/locationUtils";

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
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
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
      setGroups([]);
      setSelectedGroup(null);
    }
  };

  const fetchMembers = async () => {
    if (!selectedGroup || !user) {
      setMembers([]);
      return;
    }

    const groupId = Number(selectedGroup.group_id);

    const { data: memberRows } = await supabase
      .from("group_members")
      .select("user_id, role, users(name, photo_url, is_sharing_location, email)")
      .eq("group_id", groupId);

    if (!memberRows || memberRows.length === 0) {
      setMembers([]);
      return;
    }

    const memberUserIds = memberRows.map(m => m.user_id);
    const { data: locations } = await supabase
      .from("user_locations")
      .select("*")
      .in("user_id", memberUserIds);

    const { data: allPlaces } = await supabase
      .from("places")
      .select("*")
      .in("user_id", memberUserIds);

    const { data: visibilityRows } = await supabase
      .from("place_visibility")
      .select("*")
      .eq("group_id", groupId);

    const visMap = new Map<number, boolean>();
    visibilityRows?.forEach(v => visMap.set(v.place_id, v.is_visible ?? true));

    const primaryAddr = selectedGroup.primary_address?.toLowerCase().trim();

    const mapped = memberRows.map(m => {
      const u = m.users as any;
      const loc = locations?.find(l => l.user_id === m.user_id);
      const userPlaces = (allPlaces ?? []).filter(p => (p as any).user_id === m.user_id);

      const visiblePlaces = userPlaces.filter(p => {
        const vis = visMap.get(p.place_id);
        return vis === undefined ? true : vis;
      });

      let status = "elsewhere";
      let placeName = "Elsewhere";
      let isAtPrimaryAddress = false;

      if (u?.is_sharing_location === false) {
        status = "elsewhere";
        placeName = "Location hidden";
      } else if (loc) {
        const locResult = getLocationStatus(loc.latitude, loc.longitude, visiblePlaces.map(p => ({
          place_id: p.place_id,
          label: p.label,
          address: (p as any).address ?? null,
          latitude: p.latitude,
          longitude: p.longitude,
          radius_meters: p.radius_meters ?? 100,
          is_default_home: p.is_default_home ?? false,
        })));

        status = locResult.status;
        placeName = locResult.placeName;

        if (primaryAddr && locResult.status !== "elsewhere") {
          const matchedPlace = visiblePlaces.find(p => p.label.toLowerCase() === locResult.placeName.toLowerCase());
          if (matchedPlace) {
            const placeAddr = ((matchedPlace as any).address || "").toLowerCase().trim();
            if (placeAddr && placeAddr === primaryAddr) {
              isAtPrimaryAddress = true;
            }
          }
        }
      }

      const timeDiff = loc?.timestamp
        ? getTimeDiff(new Date(loc.timestamp))
        : "—";

      return {
        user: {
          user_id: m.user_id,
          name: u?.name ?? "Unknown",
          photo_url: u?.photo_url ?? "",
          is_sharing_location: u?.is_sharing_location ?? true,
          emoji: u?.name?.charAt(0) ?? "?",
        },
        status,
        placeName,
        lastUpdated: timeDiff,
        isAtPrimaryAddress,
      };
    });
    setMembers(mapped);
  };

  useEffect(() => { fetchGroups(); }, [user]);
  useEffect(() => { fetchMembers(); }, [selectedGroup]);

  // No groups — show empty state
  if (groups.length === 0) {
    return (
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Members</h1>
          <button
            onClick={() => setCreateGroupOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 active:bg-primary/20 transition-colors"
          >
            <Plus size={14} className="text-primary" />
            <span className="text-[13px] font-medium text-primary">New Group</span>
          </button>
        </div>
        <div className="ios-card p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users size={28} className="text-primary" />
          </div>
          <div>
            <div className="text-[17px] font-semibold text-foreground">No groups yet</div>
            <div className="text-[14px] text-muted-foreground mt-1">Create a group or join one with an invite code</div>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setCreateGroupOpen(true)}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[15px] font-medium"
            >
              Create Group
            </button>
            <button
              onClick={() => setJoinGroupOpen(true)}
              className="px-5 py-2.5 rounded-full bg-secondary text-foreground text-[15px] font-medium"
            >
              Join with Code
            </button>
          </div>
        </div>
        <CreateGroupDialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} onCreated={fetchGroups} />
        <JoinGroupDialog open={joinGroupOpen} onClose={() => setJoinGroupOpen(false)} onJoined={fetchGroups} />
      </div>
    );
  }

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
          onCreateGroup={() => setCreateGroupOpen(true)}
          onJoinGroup={() => setJoinGroupOpen(true)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddMemberOpen(true)}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <UserPlus size={16} className="text-primary" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Settings size={16} className="text-primary" />
          </button>
        </div>
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
            {members.length === 0 && (
              <div className="px-4 py-6 text-center text-[14px] text-muted-foreground">
                No members in this group yet
              </div>
            )}
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
      <CreateGroupDialog open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} onCreated={fetchGroups} />
      <JoinGroupDialog open={joinGroupOpen} onClose={() => setJoinGroupOpen(false)} onJoined={fetchGroups} />
      {addMemberOpen && selectedGroup && (
        <AddMemberDialog
          open={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          group={selectedGroup}
          onAdded={fetchMembers}
        />
      )}
    </div>
  );
};

function getTimeDiff(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default MembersTab;
