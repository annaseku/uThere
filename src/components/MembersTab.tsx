import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GroupSelector from "./GroupSelector";
import HouseView from "./HouseView";
import MemberCard from "./MemberCard";
import { groups, memberStatuses, Group } from "@/lib/mockData";

const MembersTab = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group>(groups[0]);
  const members = memberStatuses[selectedGroup.group_id] || [];

  return (
    <div className="px-4 pt-2 pb-4 space-y-4">
      <GroupSelector
        groups={groups}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
      />

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
    </div>
  );
};

export default MembersTab;
