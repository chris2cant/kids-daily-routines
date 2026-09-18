import type { Metadata } from "next";

import { RoutineSettings } from "@/features/routines/components/routine-settings";

export const metadata: Metadata = {
  title: "Paramètres | Petites Routines",
};

export default function SettingsPage() {
  return <RoutineSettings />;
}
