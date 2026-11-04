import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { STATUS, buscarOrdens } from "@/lib/os";
import { useWorkshop } from "@/contexts/WorkshopContext";
import { OrderList } from "@/components/OrderList";

export function History() {
  const { orders } = useWorkshop();
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("");
  const filtered = buscarOrdens(orders, search).filter(o => !status || o.status === status);
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><h1 className="text-2xl font-extrabold">Histórico de ordens</h1><div className="my-6 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="h-11 pl-10" aria-label="Buscar ordens" placeholder="Número da O.S., cliente ou telefone" value={search} onChange={e => setSearch(e.target.value)} /></div><select aria-label="Filtrar status" className="h-11 rounded-md border bg-card px-3 text-sm" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos os status</option>{STATUS.map(s => <option key={s}>{s}</option>)}</select></div><p className="mb-3 text-xs text-muted-foreground">{filtered.length} ordem(ns)</p><OrderList orders={filtered} /></main>;
}