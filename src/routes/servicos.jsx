import { createFileRoute } from "@tanstack/react-router";
import { CatalogEditor } from "@/components/CatalogEditor";

export const Route = createFileRoute("/servicos")({
  component: () => <CatalogEditor kind="services" />,
});
