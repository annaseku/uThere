import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GroupPrivacy {
  group_id: number;
  group_name: string;
  is_location_visible: boolean;
}

// Mock data
const MOCK_PRIVACY: GroupPrivacy[] = [
  { group_id: 1, group_name: "Smith Household", is_location_visible: true },
  { group_id: 2, group_name: "Work Team", is_location_visible: true },
];

export function useGroupPrivacy() {
  const [privacy, setPrivacy] = useState<GroupPrivacy[]>(MOCK_PRIVACY);

  const fetchPrivacy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's groups
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, groups(name)")
      .eq("user_id", user.id);

    if (memberships) {
      // Get user's default home place for visibility settings
      const { data: homePlace } = await supabase
        .from("places")
        .select("place_id")
        .eq("user_id", user.id)
        .eq("is_default_home", true)
        .single();

      const results: GroupPrivacy[] = [];
      for (const m of memberships) {
        const groupData = m.groups as any;
        let isVisible = true;
        
        if (homePlace) {
          const { data: vis } = await supabase
            .from("place_visibility")
            .select("is_visible")
            .eq("place_id", homePlace.place_id)
            .eq("group_id", m.group_id)
            .single();
          if (vis) isVisible = vis.is_visible ?? true;
        }
        
        results.push({
          group_id: m.group_id,
          group_name: groupData?.name ?? `Group ${m.group_id}`,
          is_location_visible: isVisible,
        });
      }
      setPrivacy(results);
    }
  };

  useEffect(() => { fetchPrivacy(); }, []);

  const toggleGroupVisibility = async (group_id: number) => {
    setPrivacy(prev => prev.map(g => 
      g.group_id === group_id ? { ...g, is_location_visible: !g.is_location_visible } : g
    ));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: homePlace } = await supabase
      .from("places")
      .select("place_id")
      .eq("user_id", user.id)
      .eq("is_default_home", true)
      .single();

    if (!homePlace) return;

    const current = privacy.find(g => g.group_id === group_id);
    const newVal = !(current?.is_location_visible ?? true);

    await supabase.from("place_visibility").upsert({
      place_id: homePlace.place_id,
      group_id,
      is_visible: newVal,
    }, { onConflict: "place_id,group_id" });
  };

  return { privacy, toggleGroupVisibility, refetch: fetchPrivacy };
}
