import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CurrentUser {
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  is_sharing_location: boolean;
  notifications_enabled: boolean;
  emoji: string;
}

// Fallback mock user until auth is implemented
const MOCK_USER: CurrentUser = {
  user_id: "u1",
  name: "Anna",
  email: "anna@smith.com",
  phone: "+61 400 123 456",
  photo_url: null,
  is_sharing_location: true,
  notifications_enabled: true,
  emoji: "👩",
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(MOCK_USER);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return; // use mock
    
    setLoading(true);
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", authUser.id)
      .single();
    
    if (data) {
      setUser({
        user_id: data.user_id,
        name: data.name,
        email: (data as any).email || null,
        phone: (data as any).phone || null,
        photo_url: data.photo_url,
        is_sharing_location: data.is_sharing_location ?? true,
        notifications_enabled: (data as any).notifications_enabled ?? true,
        emoji: "👩",
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchUser(); }, []);

  const updateUser = async (updates: Partial<Pick<CurrentUser, "name" | "email" | "phone" | "is_sharing_location" | "notifications_enabled" | "photo_url">>) => {
    // Optimistic update
    setUser(prev => ({ ...prev, ...updates }));
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return; // mock mode
    
    await supabase.from("users").update(updates as any).eq("user_id", authUser.id);
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;
    
    const ext = file.name.split(".").pop();
    const path = `${authUser.id}/avatar.${ext}`;
    
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return null;
    
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await updateUser({ photo_url: publicUrl });
    return publicUrl;
  };

  return { user, loading, updateUser, uploadAvatar, refetch: fetchUser };
}
