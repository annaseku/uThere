import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlaceGroupVisibility {
  place_id: number;
  place_label: string;
  group_id: number;
  group_name: string;
  is_visible: boolean;
}

export function useGroupPrivacy() {
  const [privacy, setPrivacy] = useState<PlaceGroupVisibility[]>([]);

  const fetchPrivacy = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: places } = await supabase
      .from("places")
      .select("place_id, label")
      .eq("user_id", user.id);

    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, groups(name)")
      .eq("user_id", user.id);

    if (!places || !memberships || places.length === 0 || memberships.length === 0) {
      setPrivacy([]);
      return;
    }

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
    const current = privacy.find(p => p.place_id === place_id && p.group_id === group_id);
    const newVal = !(current?.is_visible ?? true);

    // Optimistic update
    setPrivacy(prev => prev.map(p =>
      p.place_id === place_id && p.group_id === group_id
        ? { ...p, is_visible: newVal }
        : p
    ));

    // Check if row exists first
    const { data: existing } = await supabase
      .from("place_visibility")
      .select("place_id")
      .eq("place_id", place_id)
      .eq("group_id", group_id)
      .single();

    if (existing) {
      await supabase
        .from("place_visibility")
        .update({ is_visible: newVal })
        .eq("place_id", place_id)
        .eq("group_id", group_id);
    } else {
      await supabase
        .from("place_visibility")
        .insert({ place_id, group_id, is_visible: newVal });
    }
  };

  return { privacy, toggleVisibility, refetch: fetchPrivacy };
}
