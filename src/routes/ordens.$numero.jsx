import { createFileRoute } from "@tanstack/react-router";
import { OrderEditor } from "@/components/OrderEditor";

function EditOrder() {
  const { numero } = Route.useParams();
  return <OrderEditor numero={numero} />;
}

export const Route = createFileRoute("/ordens/$numero")({ component: EditOrder });
