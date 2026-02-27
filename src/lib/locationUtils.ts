import { Place } from "@/hooks/usePlaces";

/**
 * Determines a user's location status based on proximity to saved places.
 * If the user is not within the radius of any saved place, returns "Elsewhere".
 */
export function getLocationStatus(
  lat: number,
  lng: number,
  places: Place[]
): { status: string; placeName: string } {
  for (const place of places) {
    const distance = haversineDistance(lat, lng, place.latitude, place.longitude);
    if (distance <= place.radius_meters) {
      return {
        status: place.is_default_home ? "home" : place.label.toLowerCase(),
        placeName: place.label,
      };
    }
  }
  return { status: "elsewhere", placeName: "Elsewhere" };
}

/** Haversine formula - returns distance in meters */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
