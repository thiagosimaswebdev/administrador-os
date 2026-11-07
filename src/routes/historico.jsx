import { createFileRoute } from "@tanstack/react-router";
import { History } from "@/components/History";

export const Route = createFileRoute("/historico")({ component: History });
