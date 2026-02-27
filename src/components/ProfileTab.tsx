import { useState } from "react";
import { users } from "@/lib/mockData";
import { Camera, MapPin, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const currentUser = users[0];

const ProfileTab = () => {
  const [sharing, setSharing] = useState(currentUser.is_sharing_location);

  const profileFields = [
    { label: "Name", value: currentUser.name },
    { label: "Email", value: "anna@smith.com" },
    { label: "Phone", value: "+61 400 123 456" },
  ];

  const places = [
    { name: "Home", address: "42 Maple St, Brisbane" },
    { name: "Work", address: "100 Eagle St, CBD" },
  ];

  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile</h1>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-4xl">
            {currentUser.emoji}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera size={14} className="text-primary-foreground" />
          </button>
        </div>
        <div className="text-xl font-semibold text-foreground">{currentUser.name}</div>
      </div>

      {/* Info Fields */}
      <div className="ios-card overflow-hidden">
        {profileFields.map((field, i) => (
          <div
            key={field.label}
            className={`flex items-center justify-between px-4 py-3 ${
              i < profileFields.length - 1 ? "ios-separator" : ""
            }`}
          >
            <span className="text-[15px] text-foreground">{field.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] text-muted-foreground">{field.value}</span>
              <ChevronRight size={16} className="text-muted-foreground/40" />
            </div>
          </div>
        ))}
      </div>

      {/* Location Sharing Toggle */}
      <div className="ios-card px-4 py-3.5 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-medium text-foreground">Share My Location</div>
          <div className="text-[13px] text-muted-foreground mt-0.5">
            Visible to your groups
          </div>
        </div>
        <Switch checked={sharing} onCheckedChange={setSharing} />
      </div>

      {/* Saved Places */}
      <div>
        <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
          Saved Places
        </div>
        <div className="ios-card overflow-hidden">
          {places.map((place, i) => (
            <div
              key={place.name}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < places.length - 1 ? "ios-separator" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-foreground">{place.name}</div>
                <div className="text-[13px] text-muted-foreground truncate">{place.address}</div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/40 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
