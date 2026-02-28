import { ChevronDown, Plus, LogIn } from "lucide-react";
import { Group } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface GroupSelectorProps {
  groups: Group[];
  selectedGroup: Group;
  onGroupChange: (group: Group) => void;
  onCreateGroup?: () => void;
  onJoinGroup?: () => void;
}

const GroupSelector = ({ groups, selectedGroup, onGroupChange, onCreateGroup, onJoinGroup }: GroupSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-1"
      >
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {selectedGroup.name}
        </h1>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-muted-foreground mt-0.5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 mt-2 ios-card-elevated overflow-hidden z-50 min-w-[220px]"
          >
            {groups.map((group) => (
              <button
                key={group.group_id}
                onClick={() => {
                  onGroupChange(group);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ios-separator ${
                  selectedGroup.group_id === group.group_id
                    ? "bg-primary/5"
                    : "hover:bg-accent active:bg-accent"
                }`}
              >
                <span className="text-[15px] font-medium text-foreground">{group.name}</span>
                {selectedGroup.group_id === group.group_id && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
            {onCreateGroup && (
              <button
                onClick={() => { onCreateGroup(); setOpen(false); }}
                className="w-full text-left px-4 py-3 flex items-center gap-2.5 hover:bg-accent active:bg-accent transition-colors ios-separator"
              >
                <Plus size={16} className="text-primary" />
                <span className="text-[15px] font-medium text-primary">New Group</span>
              </button>
            )}
            {onJoinGroup && (
              <button
                onClick={() => { onJoinGroup(); setOpen(false); }}
                className="w-full text-left px-4 py-3 flex items-center gap-2.5 hover:bg-accent active:bg-accent transition-colors"
              >
                <LogIn size={16} className="text-primary" />
                <span className="text-[15px] font-medium text-primary">Join with Code</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupSelector;
