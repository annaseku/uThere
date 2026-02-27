import { motion } from "framer-motion";
import { MemberStatus, statusColors, statusLabels } from "@/lib/mockData";
import { MapPin } from "lucide-react";

interface MemberCardProps {
  member: MemberStatus;
  index: number;
}

const MemberCard = ({ member, index }: MemberCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="flex items-center gap-3.5 px-4 py-3.5 bg-card active:bg-accent transition-colors"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">
          {member.user.emoji}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${statusColors[member.status]}`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-semibold text-foreground">{member.user.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[member.status]}`} />
          <span className="text-[13px] text-muted-foreground truncate">
            {member.placeName}
          </span>
        </div>
      </div>

      {/* Time */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[12px] text-muted-foreground">{member.lastUpdated}</span>
        <MapPin size={14} className="text-muted-foreground/50" />
      </div>
    </motion.div>
  );
};

export default MemberCard;
