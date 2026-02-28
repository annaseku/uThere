import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomTabBar from "@/components/BottomTabBar";
import MembersTab from "@/components/MembersTab";
import ProfileTab from "@/components/ProfileTab";
import SettingsTab from "@/components/SettingsTab";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GroupData {
  group_id: string;
  name: string;
  primary_address?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("members");
  const { user } = useAuth();
  useGeolocation();

  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);

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
      setSelectedGroup(prev => {
        if (prev && mapped.find(g => g.group_id === prev.group_id)) return prev;
        return mapped[0];
      });
    } else {
      setGroups([]);
      setSelectedGroup(null);
    }
  };

  useEffect(() => { fetchGroups(); }, [user]);

  const renderTab = () => {
    switch (activeTab) {
      case "members":
        return <MembersTab groups={groups} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} onGroupsChanged={fetchGroups} />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab groups={groups} selectedGroup={selectedGroup} onGroupsChanged={fetchGroups} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="h-12" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="pb-24"
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
