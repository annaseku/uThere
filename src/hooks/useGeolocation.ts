import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tracks the user's GPS location and upserts it into user_locations every 60s.
 * Also fires once on mount.
 */
export function useGeolocation() {
  const { user } = useAuth();
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!user || !("geolocation" in navigator)) return;

    const updateLocation = async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const timestamp = new Date(pos.timestamp).toISOString();

      // Upsert: user_id is unique in user_locations
      await supabase.from("user_locations").upsert(
        {
          user_id: user.id,
          latitude,
          longitude,
          accuracy,
          timestamp,
        },
        { onConflict: "user_id" }
      );
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(updateLocation, () => {}, {
      enableHighAccuracy: true,
      timeout: 10000,
    });

    // Watch for changes
    watchId.current = navigator.geolocation.watchPosition(updateLocation, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 60000,
    });

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [user]);
}
