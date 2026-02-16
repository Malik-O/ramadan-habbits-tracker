import {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Heart,
  Star,
  BookOpen,
  HandHelping,
  Building2,
  Droplets,
  UtensilsCrossed,
  Flame,
  Clock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface IconOption {
  value: string;
  label: string;
  component: LucideIcon;
}

/** Map icon string keys → Lucide components */
export const ICON_MAP: Record<string, LucideIcon> = {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Heart,
  Star,
  Book: BookOpen,
  BookOpen,
  Pray: HandHelping,
  HandHelping,
  Mosque: Building2,
  Building2,
  Water: Droplets,
  Droplets,
  Food: UtensilsCrossed,
  UtensilsCrossed,
  Flame,
  Clock,
  Sparkles,
};

/** Icon options available in the picker UI */
export const AVAILABLE_ICONS: IconOption[] = [
  { value: "Sunrise", label: "شروق", component: Sunrise },
  { value: "Sun", label: "شمس", component: Sun },
  { value: "CloudSun", label: "غيوم", component: CloudSun },
  { value: "Sunset", label: "غروب", component: Sunset },
  { value: "Moon", label: "قمر", component: Moon },
  { value: "Heart", label: "قلب", component: Heart },
  { value: "Star", label: "نجمة", component: Star },
  { value: "BookOpen", label: "كتاب", component: BookOpen },
  { value: "HandHelping", label: "دعاء", component: HandHelping },
  { value: "Building2", label: "مسجد", component: Building2 },
  { value: "Droplets", label: "ماء", component: Droplets },
  { value: "UtensilsCrossed", label: "طعام", component: UtensilsCrossed },
];

/** Gets the Lucide icon component for a given icon key, falls back to Heart */
export function getIconComponent(iconKey: string): LucideIcon {
  return ICON_MAP[iconKey] ?? Heart;
}
