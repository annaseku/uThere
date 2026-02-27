import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomTabBar from "@/components/BottomTabBar";
import MembersTab from "@/components/MembersTab";
import ProfileTab from "@/components/ProfileTab";
import SettingsTab from "@/components/SettingsTab";

const tabs: Record<string, React.ComponentType> = {
  members: MembersTab,
  profile: ProfileTab,
  settings: SettingsTab,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("members");
  const ActiveComponent = tabs[activeTab];

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Status bar spacer */}
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
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
