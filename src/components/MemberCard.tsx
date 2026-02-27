import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface MemberCardProps {
  member: {
    user: { user_id: string; name?: string; emoji: string; photo_url?: string };
    status: string;
    placeName: string;
    lastUpdated: string;
  };
  index: number;
}

const statusColor = (status: string) => {
  if (status === "home") return "bg-ios-green";
  if (status === "work") return "bg-ios-blue";
  if (status === "school") return "bg-ios-orange";
  if (status === "elsewhere") return "bg-muted-foreground";
  return "bg-primary";
};

const MemberCard = ({ member, index }: MemberCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="flex items-center gap-3.5 px-4 py-3.5 bg-card active:bg-accent transition-colors"
    >
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">
          {member.user.emoji}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${statusColor(member.status)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-semibold text-foreground">{member.user.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor(member.status)}`} />
          <span className="text-[13px] text-muted-foreground truncate">{member.placeName}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[12px] text-muted-foreground">{member.lastUpdated}</span>
        <MapPin size={14} className="text-muted-foreground/50" />
      </div>
    </motion.div>
  );
};

export default MemberCard;
