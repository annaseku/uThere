import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GroupSelector from "./GroupSelector";
import HouseView from "./HouseView";
import MemberCard from "./MemberCard";
import GroupSettingsDialog from "./GroupSettingsDialog";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { memberStatuses, groups as mockGroups } from "@/lib/mockData";
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
      const mock = mockGroups.map(g => ({ group_id: g.group_id, name: g.name }));
      setGroups(mock);
      setSelectedGroup(mock[0]);
    }
  };

  const fetchMembers = async () => {
    if (!selectedGroup || !user) {
      if (selectedGroup) {
        setMembers(memberStatuses[selectedGroup.group_id] || []);
      }
      return;
    }

    const groupId = Number(selectedGroup.group_id);

    // Fetch group members with user info
    const { data: memberRows } = await supabase
      .from("group_members")
      .select("user_id, role, users(name, photo_url, is_sharing_location, email)")
      .eq("group_id", groupId);

    if (!memberRows || memberRows.length === 0) {
      setMembers(memberStatuses[selectedGroup.group_id] || []);
      return;
    }

    // Fetch all member locations
    const memberUserIds = memberRows.map(m => m.user_id);
    const { data: locations } = await supabase
      .from("user_locations")
      .select("*")
      .in("user_id", memberUserIds);

    // Fetch all members' places & visibility for this group
    const { data: allPlaces } = await supabase
      .from("places")
      .select("*")
      .in("user_id", memberUserIds);

    const { data: visibilityRows } = await supabase
      .from("place_visibility")
      .select("*")
      .eq("group_id", groupId);

    // Build a map of visibility: place_id -> is_visible (default true)
    const visMap = new Map<number, boolean>();
    visibilityRows?.forEach(v => visMap.set(v.place_id, v.is_visible ?? true));

    // Geocode primary address to coords (we use address string matching instead)
    const primaryAddr = selectedGroup.primary_address?.toLowerCase().trim();

    const mapped = memberRows.map(m => {
      const u = m.users as any;
      const loc = locations?.find(l => l.user_id === m.user_id);
      const userPlaces = (allPlaces ?? []).filter(p => (p as any).user_id === m.user_id);

      // Filter places visible to this group
      const visiblePlaces = userPlaces.filter(p => {
        const vis = visMap.get(p.place_id);
        return vis === undefined ? true : vis; // default visible
      });

      let status = "elsewhere";
      let placeName = "Elsewhere";
      let isAtPrimaryAddress = false;

      if (u?.is_sharing_location === false) {
        status = "elsewhere";
        placeName = "Location hidden";
      } else if (loc) {
        // Check if at any visible place
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

        // Check if at the group's primary address
        // Match by checking if the user's matched place address matches the group primary address
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
        : "Unknown";

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
