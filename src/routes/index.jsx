import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ordem de Serviço | Assistência Técnica" },
      {
        name: "description",
        content: "Emita e acompanhe ordens de serviço para sua assistência técnica.",
      },
    ],
  }),
  component: Dashboard,
});
