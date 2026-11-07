import { Link } from "@tanstack/react-router";
import { Plus, ArrowRight, ClipboardList, Wrench, CheckCheck, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkshop } from "@/contexts/WorkshopContext";
import { resumoOrdens } from "@/lib/os";
import { OrderList } from "@/components/OrderList";

export function DashboardPage() {
  const { orders, settings } = useWorkshop();
  const stats = resumoOrdens(orders);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-primary">Visão geral</p>
          <h1 className="text-3xl font-extrabold">Sua bancada, em dia.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {settings.empresa.fantasia || settings.empresa.nome}
          </p>
        </div>
        <Button asChild size="lg" className="h-12">
          <Link to="/ordens/nova">
            <Plus className="size-5" />
            NOVA O.S.
          </Link>
        </Button>
      </div>
      <div className="my-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total de O.S.", stats.total, ClipboardList, "text-foreground"],
          ["Em andamento", stats.andamento, Wrench, "text-chart-1"],
          ["Finalizadas", stats.finalizadas, CheckCheck, "text-primary"],
          ["Entregues", stats.entregues, PackageCheck, "text-chart-3"],
        ].map(([label, count, Icon, tone]) => (
          <article key={label} className="rounded-lg border bg-card p-4 sm:p-5">
            <Icon className={`mb-5 size-5 ${tone}`} />
            <p className="text-3xl font-extrabold">{count}</p>
            <h2 className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">{label}</h2>
          </article>
        ))}
      </div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">Últimas ordens</h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/historico">
            Ver todas
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <OrderList orders={orders.slice(0, 6)} />
    </main>
  );
}
