import {
  Archive,
  Atom,
  BookOpen,
  BrainCircuit,
  FlaskConical,
  Gauge,
  Home,
  Library,
  LockKeyhole,
  Moon,
  Search,
  Settings,
  Shield,
  Sparkles,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { RecordKind } from "@/lib/modules";

export const moduleIcons: Record<RecordKind, LucideIcon> = {
  library: Library,
  thesis: BrainCircuit,
  knowledge: Atom,
  technique: Gauge,
  symbol: Sparkles,
  faction: Users,
  test: FlaskConical,
};

export const navIcons = {
  home: Home,
  search: Search,
  archive: Archive,
  book: BookOpen,
  security: Shield,
  settings: Settings,
  lock: LockKeyhole,
  moon: Moon,
  tags: Tags,
};
