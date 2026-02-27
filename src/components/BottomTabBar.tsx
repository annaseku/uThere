import { Home, User, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "members", label: "Members", icon: Home },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border safe-area-bottom z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 pt-1.5 pb-1 px-4 relative"
            >
              <div className="relative">
                <tab.icon
                  size={22}
                  className={isActive ? "text-ios-tab-active" : "text-ios-tab-inactive"}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -inset-1.5 bg-primary/10 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-ios-tab-active" : "text-ios-tab-inactive"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
