import { useState, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePlaces, Place } from "@/hooks/usePlaces";
import { Camera, MapPin, ChevronRight, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import PlaceEditor from "./PlaceEditor";
import EditFieldDialog from "./EditFieldDialog";
import { toast } from "sonner";

const ProfileTab = () => {
  const { user, updateUser, uploadAvatar } = useCurrentUser();
  const { places, addPlace, updatePlace, deletePlace } = usePlaces();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<{ label: string; key: string; value: string } | null>(null);
  const [placeEditorOpen, setPlaceEditorOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  const profileFields = [
    { label: "Name", key: "name", value: user.name },
    { label: "Email", key: "email", value: user.email || "" },
    { label: "Phone", key: "phone", value: user.phone || "" },
  ];

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) toast.success("Photo updated!");
    else toast.info("Photo saved (sign in to persist)");
  };

  const handleFieldSave = (value: string) => {
    if (!editingField) return;
    updateUser({ [editingField.key]: value } as any);
    toast.success(`${editingField.label} updated`);
  };

  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile</h1>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          {user.photo_url ? (
            <img src={user.photo_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-4xl">
              {user.emoji}
            </div>
          )}
          <button
            onClick={handleAvatarClick}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <Camera size={14} className="text-primary-foreground" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
        <div className="text-xl font-semibold text-foreground">{user.name}</div>
      </div>

      {/* Info Fields */}
      <div className="ios-card overflow-hidden">
        {profileFields.map((field, i) => (
          <button
            key={field.label}
            onClick={() => setEditingField(field)}
            className={`w-full flex items-center justify-between px-4 py-3 active:bg-accent transition-colors ${
              i < profileFields.length - 1 ? "ios-separator" : ""
            }`}
          >
            <span className="text-[15px] text-foreground">{field.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] text-muted-foreground">{field.value || "Not set"}</span>
              <ChevronRight size={16} className="text-muted-foreground/40" />
            </div>
          </button>
        ))}
      </div>

      {/* Location Sharing Toggle */}
      <div className="ios-card px-4 py-3.5 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-medium text-foreground">Share My Location</div>
          <div className="text-[13px] text-muted-foreground mt-0.5">Visible to your groups</div>
        </div>
        <Switch
          checked={user.is_sharing_location}
          onCheckedChange={(val) => {
            updateUser({ is_sharing_location: val });
            toast.success(val ? "Location sharing on" : "Location sharing off");
          }}
        />
      </div>

      {/* Saved Places */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
            Saved Places
          </div>
          <button
            onClick={() => { setEditingPlace(null); setPlaceEditorOpen(true); }}
            className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Plus size={14} className="text-primary" />
          </button>
        </div>
        <div className="ios-card overflow-hidden">
          {places.map((place, i) => (
            <button
              key={place.place_id}
              onClick={() => { setEditingPlace(place); setPlaceEditorOpen(true); }}
              className={`w-full flex items-center gap-3 px-4 py-3 active:bg-accent transition-colors ${
                i < places.length - 1 ? "ios-separator" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[15px] font-medium text-foreground">{place.label}</div>
                <div className="text-[13px] text-muted-foreground truncate">
                  {place.address || place.label}{place.is_default_home ? " · Default Home" : ""}
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/40 flex-shrink-0" />
            </button>
          ))}
          {places.length === 0 && (
            <div className="px-4 py-6 text-center text-[14px] text-muted-foreground">
              No saved places yet
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {editingField && (
        <EditFieldDialog
          open={!!editingField}
          onClose={() => setEditingField(null)}
          label={editingField.label}
          value={editingField.value}
          onSave={handleFieldSave}
        />
      )}

      <PlaceEditor
        open={placeEditorOpen}
        onClose={() => { setPlaceEditorOpen(false); setEditingPlace(null); }}
        place={editingPlace}
        onSave={(data) => {
          if (editingPlace) {
            updatePlace(editingPlace.place_id, data);
            toast.success("Place updated");
          } else {
            addPlace(data);
            toast.success("Place added");
          }
        }}
        onDelete={editingPlace ? () => {
          deletePlace(editingPlace.place_id);
          toast.success("Place deleted");
        } : undefined}
      />
    </div>
  );
};

export default ProfileTab;
