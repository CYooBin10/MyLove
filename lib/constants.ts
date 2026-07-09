import { BellRing, CalendarDays, Heart, Images, Settings2, Sparkles } from "lucide-react";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MyLove";
export const SESSION_COOKIE = "mylove_session";
export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

export const QUOTES = [
  "Yêu nhau bình yên thôi, đủ để nhớ nhau cả ngày.",
  "Chúng ta không hoàn hảo, nhưng rất hợp để thương nhau.",
  "Một ngày bình thường, chỉ cần có nhau là đủ đẹp.",
  "Tình yêu nhỏ thôi, nhưng là nơi để cùng trở về.",
  "Có em/anh, mọi ngày đều dịu lại một chút.",
  "Mình thương nhau chậm rãi, nhưng thật lâu.",
  "Bên đúng người, im lặng cũng thấy ấm áp.",
];

export const MEMORY_TAGS = ["đi chơi", "sinh nhật", "cãi nhau", "làm lành", "du lịch", "lần đầu", "ăn uống", "ở nhà"];
export const TING_PRESETS = [
  { type: "MISS_YOU", label: "Nhớ em/anh", emoji: "heart" },
  { type: "LOVE", label: "Yêu em/anh", emoji: "spark" },
  { type: "HUG", label: "Muốn ôm", emoji: "hug" },
  { type: "UPSET", label: "Dỗi rồi", emoji: "cloud" },
  { type: "MAKE_UP", label: "Làm lành nha", emoji: "olive" },
];

export const SPECIAL_DAY_TYPES = [
  { value: "ANNIVERSARY", label: "Anniversary" },
  { value: "BIRTHDAY", label: "Sinh nhật" },
  { value: "DATE", label: "Ngày hẹn" },
  { value: "TRIP", label: "Đi chơi" },
  { value: "CUSTOM", label: "Khác" },
];

export const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Heart },
  { href: "/memories", label: "Memories", icon: Images },
  { href: "/ting-ting", label: "Ting Ting", icon: BellRing },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

export const HEADER_TITLES: Record<string, string> = {
  "/home": "Nhà của tụi mình",
  "/profile": "Couple Profile",
  "/memories": "Kỷ niệm",
  "/ting-ting": "Ting Ting",
  "/notes": "Love Notes",
  "/calendar": "Ngày đặc biệt",
  "/gallery": "Gallery",
  "/settings": "Cài đặt",
};

export const SHELL_POLL_SECONDS = 20;
