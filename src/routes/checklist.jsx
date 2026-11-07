import { createFileRoute } from "@tanstack/react-router";
import { CatalogEditor } from "@/components/CatalogEditor";

export const Route = createFileRoute("/checklist")({
  component: () => <CatalogEditor kind="checklist" />,
});
