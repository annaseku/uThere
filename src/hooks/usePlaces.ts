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

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
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
    if (!user) return;
    
    await supabase.from("places").insert({
      label: place.label,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      radius_meters: place.radius_meters,
      is_default_home: place.is_default_home,
      user_id: user.id,
    } as any);
    
    fetchPlaces();
  };

  const updatePlace = async (place_id: number, updates: Partial<Place>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from("places").update(updates as any).eq("place_id", place_id);
    fetchPlaces();
  };

  const deletePlace = async (place_id: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from("places").delete().eq("place_id", place_id);
    fetchPlaces();
  };

  return { places, loading, addPlace, updatePlace, deletePlace, refetch: fetchPlaces };
}
