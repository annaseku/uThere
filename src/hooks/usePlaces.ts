import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Place {
  place_id: number;
  label: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_default_home: boolean;
}

// Mock places until auth
const MOCK_PLACES: Place[] = [
  { place_id: 1, label: "Home", address: "12 Red Gum Crescent", latitude: -27.4698, longitude: 153.0251, radius_meters: 100, is_default_home: true },
  { place_id: 2, label: "Work", address: "100 Eagle St, Brisbane", latitude: -27.4679, longitude: 153.0281, radius_meters: 100, is_default_home: false },
];

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [loading, setLoading] = useState(false);

  const fetchPlaces = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    const { data } = await supabase
      .from("places")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    
    if (data) {
      setPlaces(data.map(p => ({
        place_id: p.place_id,
        label: p.label,
        address: (p as any).address ?? null,
        latitude: p.latitude,
        longitude: p.longitude,
        radius_meters: p.radius_meters ?? 100,
        is_default_home: p.is_default_home ?? false,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlaces(); }, []);

  const addPlace = async (place: Omit<Place, "place_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Mock mode
      setPlaces(prev => [...prev, { ...place, place_id: Date.now() }]);
      return;
    }
    
    const { data } = await supabase.from("places").insert({
      label: place.label,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      radius_meters: place.radius_meters,
      is_default_home: place.is_default_home,
      user_id: user.id,
    } as any).select().single();
    
    if (data) fetchPlaces();
  };

  const updatePlace = async (place_id: number, updates: Partial<Place>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPlaces(prev => prev.map(p => p.place_id === place_id ? { ...p, ...updates } : p));
      return;
    }
    
    await supabase.from("places").update(updates as any).eq("place_id", place_id);
    fetchPlaces();
  };

  const deletePlace = async (place_id: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPlaces(prev => prev.filter(p => p.place_id !== place_id));
      return;
    }
    
    await supabase.from("places").delete().eq("place_id", place_id);
    fetchPlaces();
  };

  return { places, loading, addPlace, updatePlace, deletePlace, refetch: fetchPlaces };
}
