import { motion } from "framer-motion";

interface HouseViewMember {
  user: {
    user_id: string;
    name?: string;
    emoji: string;
  };
  status: string;
  placeName: string;
  lastUpdated: string;
  isAtPrimaryAddress: boolean;
}

interface HouseViewProps {
  members: HouseViewMember[];
}

const avatarPositions = [
  { top: "22%", left: "32%" },
  { top: "48%", left: "25%" },
  { top: "35%", left: "55%" },
  { top: "58%", left: "50%" },
];

const outsidePositions = [
  { top: "30%", right: "8%" },
  { top: "60%", right: "12%" },
  { top: "15%", right: "15%" },
  { top: "75%", right: "6%" },
];

const statusColor = (status: string) => {
  if (status === "home") return "bg-ios-green";
  if (status === "work") return "bg-ios-blue";
  if (status === "school") return "bg-ios-orange";
  if (status === "elsewhere") return "bg-muted-foreground";
  return "bg-primary";
};

const HouseView = ({ members }: HouseViewProps) => {
  const homeMembers = members.filter((m) => m.isAtPrimaryAddress);
  const awayMembers = members.filter((m) => !m.isAtPrimaryAddress);

  return (
    <div className="relative w-full aspect-[4/3] ios-card p-4 overflow-hidden">
      {/* House shape */}
      <svg
        viewBox="0 0 200 160"
        className="absolute inset-0 w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M100 20 L30 70 L170 70 Z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        <rect x="40" y="70" width="120" height="70" rx="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        <rect x="88" y="100" width="24" height="40" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
        <circle cx="106" cy="122" r="2" fill="hsl(var(--muted-foreground))" />
        <rect x="52" y="82" width="22" height="18" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
        <rect x="126" y="82" width="22" height="18" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
      </svg>

      {homeMembers.map((member, i) => {
        const pos = avatarPositions[i % avatarPositions.length];
        return (
          <motion.div
            key={member.user.user_id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
            className="absolute flex flex-col items-center"
            style={pos}
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-lg border-2 border-card shadow-md">
                {member.user.emoji}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${statusColor(member.status)}`} />
            </div>
          </motion.div>
        );
      })}

      {awayMembers.map((member, i) => {
        const pos = outsidePositions[i % outsidePositions.length];
        return (
          <motion.div
            key={member.user.user_id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: (homeMembers.length + i) * 0.1, type: "spring", stiffness: 300 }}
            className="absolute flex flex-col items-center"
            style={pos}
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-lg border-2 border-card shadow-md opacity-70">
                {member.user.emoji}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${statusColor(member.status)}`} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HouseView;
