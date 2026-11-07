import { createFileRoute } from "@tanstack/react-router";
import { CompanySettingsPage } from "@/pages/CompanySettingsPage";

export const Route = createFileRoute("/configuracoes")({ component: CompanySettingsPage });
