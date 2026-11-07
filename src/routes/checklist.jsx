import { createFileRoute } from "@tanstack/react-router";
import { ChecklistPage } from "@/pages/ChecklistPage";

export const Route = createFileRoute("/checklist")({
  component: ChecklistPage,
});
