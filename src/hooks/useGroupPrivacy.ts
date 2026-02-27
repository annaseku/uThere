import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlaceGroupVisibility {
  place_id: number;
  place_label: string;
  group_id: number;
  group_name: string;
  is_visible: boolean;
}

// Mock data
const MOCK_PRIVACY: PlaceGroupVisibility[] = [
  { place_id: 1, place_label: "Home", group_id: 1, group_name: "Smith Household", is_visible: true },
  { place_id: 1, place_label: "Home", group_id: 2, group_name: "Work Team", is_visible: true },
  { place_id: 2, place_label: "Work", group_id: 1, group_name: "Smith Household", is_visible: true },
  { place_id: 2, place_label: "Work", group_id: 2, group_name: "Work Team", is_visible: true },
];

export function useGroupPrivacy() {
  const [privacy, setPrivacy] = useState<PlaceGroupVisibility[]>(MOCK_PRIVACY);

  const fetchPrivacy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's places
    const { data: places } = await supabase
      .from("places")
      .select("place_id, label")
      .eq("user_id", user.id);

    // Get user's groups
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, groups(name)")
      .eq("user_id", user.id);

    if (!places || !memberships) return;

    const results: PlaceGroupVisibility[] = [];

    for (const place of places) {
      for (const m of memberships) {
        const groupData = m.groups as any;
        let isVisible = true;

        const { data: vis } = await supabase
          .from("place_visibility")
          .select("is_visible")
          .eq("place_id", place.place_id)
          .eq("group_id", m.group_id)
          .single();

        if (vis) isVisible = vis.is_visible ?? true;

        results.push({
          place_id: place.place_id,
          place_label: place.label,
          group_id: m.group_id,
          group_name: groupData?.name ?? `Group ${m.group_id}`,
          is_visible: isVisible,
        });
      }
    }
    setPrivacy(results);
  };

  useEffect(() => { fetchPrivacy(); }, []);

  const toggleVisibility = async (place_id: number, group_id: number) => {
    // Optimistic update
    setPrivacy(prev => prev.map(p =>
      p.place_id === place_id && p.group_id === group_id
        ? { ...p, is_visible: !p.is_visible }
        : p
    ));

    const current = privacy.find(p => p.place_id === place_id && p.group_id === group_id);
    const newVal = !(current?.is_visible ?? true);

    await supabase.from("place_visibility").upsert({
      place_id,
      group_id,
      is_visible: newVal,
    }, { onConflict: "place_id,group_id" });
  };

  return { privacy, toggleVisibility, refetch: fetchPrivacy };
}
