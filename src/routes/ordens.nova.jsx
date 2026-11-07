import { createFileRoute } from "@tanstack/react-router";
import { OrderEditorPage } from "@/pages/OrderEditorPage";

export const Route = createFileRoute("/ordens/nova")({ component: () => <OrderEditorPage /> });
