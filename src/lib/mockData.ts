export interface User {
  user_id: string;
  name: string;
  photo_url: string;
  is_sharing_location: boolean;
  emoji: string;
}

export interface Group {
  group_id: string;
  name: string;
  member_ids: string[];
}

export interface UserPlace {
  place_id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface LiveLocation {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  battery_level: number;
}

export type LocationStatus = "home" | "work" | "school" | "elsewhere";

export interface MemberStatus {
  user: User;
  status: LocationStatus;
  placeName: string;
  lastUpdated: string;
}

export const users: User[] = [
  { user_id: "u1", name: "Anna", photo_url: "", is_sharing_location: true, emoji: "👩" },
  { user_id: "u2", name: "Dad", photo_url: "", is_sharing_location: true, emoji: "👨" },
  { user_id: "u3", name: "Mum", photo_url: "", is_sharing_location: true, emoji: "🧑" },
  { user_id: "u4", name: "Jake", photo_url: "", is_sharing_location: true, emoji: "👦" },
  { user_id: "u5", name: "Lisa", photo_url: "", is_sharing_location: false, emoji: "👧" },
  { user_id: "u6", name: "Tom", photo_url: "", is_sharing_location: true, emoji: "🧔" },
];

export const groups: Group[] = [
  { group_id: "g1", name: "Smith Household", member_ids: ["u1", "u2", "u3", "u4"] },
  { group_id: "g2", name: "Work Team", member_ids: ["u1", "u5", "u6"] },
];

export const memberStatuses: Record<string, MemberStatus[]> = {
  g1: [
    { user: users[0], status: "home", placeName: "Anna's Home", lastUpdated: "3 min ago" },
    { user: users[1], status: "home", placeName: "Home", lastUpdated: "1 hour ago" },
    { user: users[2], status: "home", placeName: "Home", lastUpdated: "Just now" },
    { user: users[3], status: "school", placeName: "Lincoln High", lastUpdated: "25 min ago" },
  ],
  g2: [
    { user: users[0], status: "work", placeName: "Office", lastUpdated: "10 min ago" },
    { user: users[4], status: "elsewhere", placeName: "Café Bloom", lastUpdated: "5 min ago" },
    { user: users[5], status: "work", placeName: "Office", lastUpdated: "2 min ago" },
  ],
};

export const statusColors: Record<LocationStatus, string> = {
  home: "bg-ios-green",
  work: "bg-ios-blue",
  school: "bg-ios-orange",
  elsewhere: "bg-muted-foreground",
};

export const statusLabels: Record<LocationStatus, string> = {
  home: "Home",
  work: "Work",
  school: "School",
  elsewhere: "Elsewhere",
};
