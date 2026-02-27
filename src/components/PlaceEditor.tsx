import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Place } from "@/hooks/usePlaces";

interface PlaceEditorProps {
  open: boolean;
  onClose: () => void;
  place?: Place | null;
  onSave: (data: Omit<Place, "place_id">) => void;
  onDelete?: () => void;
}

const PlaceEditor = ({ open, onClose, place, onSave, onDelete }: PlaceEditorProps) => {
  const [label, setLabel] = useState(place?.label ?? "");
  const [latitude, setLatitude] = useState(String(place?.latitude ?? ""));
  const [longitude, setLongitude] = useState(String(place?.longitude ?? ""));
  const [radius, setRadius] = useState(String(place?.radius_meters ?? 100));
  const [isHome, setIsHome] = useState(place?.is_default_home ?? false);

  const handleSave = () => {
    if (!label.trim() || !latitude || !longitude) return;
    onSave({
      label: label.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius_meters: parseInt(radius) || 100,
      is_default_home: isHome,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{place ? "Edit Place" : "Add Place"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Name</label>
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Home, Work" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Latitude</label>
              <Input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="-27.47" type="number" step="any" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Longitude</label>
              <Input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="153.02" type="number" step="any" />
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Radius (meters)</label>
            <Input value={radius} onChange={e => setRadius(e.target.value)} placeholder="100" type="number" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-foreground">Default Home</span>
            <Switch checked={isHome} onCheckedChange={setIsHome} />
          </div>
          <div className="flex gap-2 pt-2">
            {place && onDelete && (
              <Button variant="destructive" className="flex-1" onClick={() => { onDelete(); onClose(); }}>
                Delete
              </Button>
            )}
            <Button className="flex-1" onClick={handleSave}>
              {place ? "Save" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceEditor;
