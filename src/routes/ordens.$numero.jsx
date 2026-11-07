import { createFileRoute } from "@tanstack/react-router";
import { OrderEditorPage } from "@/pages/OrderEditorPage";

function EditOrder() {
  const { numero } = Route.useParams();
  return <OrderEditorPage numero={numero} />;
}

export const Route = createFileRoute("/ordens/$numero")({ component: EditOrder });
