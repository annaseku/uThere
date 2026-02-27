import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Place } from "@/hooks/usePlaces";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PlaceEditorProps {
  open: boolean;
  onClose: () => void;
  place?: Place | null;
  onSave: (data: Omit<Place, "place_id">) => void;
  onDelete?: () => void;
}

const GEOCODE_API_KEY = "69a12ca80288c284364353hdxd915e3";

const PlaceEditor = ({ open, onClose, place, onSave, onDelete }: PlaceEditorProps) => {
  const [label, setLabel] = useState(place?.label ?? "");
  const [address, setAddress] = useState(place?.address ?? "");
  const [latitude, setLatitude] = useState(String(place?.latitude ?? ""));
  const [longitude, setLongitude] = useState(String(place?.longitude ?? ""));
  const [radius, setRadius] = useState(String(place?.radius_meters ?? 100));
  const [isHome, setIsHome] = useState(place?.is_default_home ?? false);
  const [geocoding, setGeocoding] = useState(false);

  const handleGeocode = async () => {
    if (!address.trim()) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://geocode.maps.co/search?q=${encodeURIComponent(address.trim())}&api_key=${GEOCODE_API_KEY}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(data[0].lat);
        setLongitude(data[0].lon);
        if (!label.trim()) setLabel(data[0].display_name?.split(",")[0] ?? "");
        toast.success("Address found!");
      } else {
        toast.error("Address not found");
      }
    } catch {
      toast.error("Geocoding failed");
    }
    setGeocoding(false);
  };

  const handleSave = () => {
    if (!label.trim() || !latitude || !longitude) return;
    onSave({
      label: label.trim(),
      address: address.trim() || null,
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
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Address</label>
            <div className="flex gap-2">
              <Input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 555 5th Ave New York NY"
                onKeyDown={e => e.key === "Enter" && handleGeocode()}
              />
              <Button size="icon" variant="outline" onClick={handleGeocode} disabled={geocoding}>
                {geocoding ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </Button>
            </div>
          </div>
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
