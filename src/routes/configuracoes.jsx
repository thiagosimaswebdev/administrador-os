import { createFileRoute } from "@tanstack/react-router";
import { CompanySettings } from "@/components/CompanySettings";

export const Route = createFileRoute("/configuracoes")({ component: CompanySettings });
