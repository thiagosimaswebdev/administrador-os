import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS } from "@/lib/os";
import { useWorkshop } from "@/contexts/WorkshopContext";
import { toast } from "sonner";

export function OrderList({ orders }) {
  const { saveOrder } = useWorkshop();
  if (!orders.length)
    return (
      <div className="flex flex-col items-center gap-3 border-y py-14 text-center text-muted-foreground">
        <ClipboardList className="size-8" />
        <p>Nenhuma ordem encontrada.</p>
        <Button variant="outline" asChild>
          <Link to="/ordens/nova">Nova O.S.</Link>
        </Button>
      </div>
    );
  return (
    <div className="divide-y border-y">
      {orders.map((order) => (
        <article key={order.numero} className="flex flex-wrap items-center gap-3 py-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <Link
              to="/ordens/$numero"
              params={{ numero: order.numero }}
              className="font-bold hover:text-primary"
            >
              {order.cliente}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.numero} · {new Date(order.emissao).toLocaleDateString("pt-BR")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.marca} · {order.modelo}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              aria-label={`Status de ${order.numero}`}
              value={order.status}
              className="h-9 max-w-40 rounded-md border bg-card px-2 text-xs"
              onChange={async (e) => {
                try {
                  await saveOrder({ ...order, status: e.target.value }, true);
                  toast.success("Status atualizado.");
                } catch {
                  toast.error("Não foi possível salvar o status.");
                }
              }}
            >
              {STATUS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Button asChild variant="outline" size="icon" title="Abrir ordem">
              <Link
                to="/ordens/$numero"
                params={{ numero: order.numero }}
                aria-label={`Abrir ${order.numero}`}
              >
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
