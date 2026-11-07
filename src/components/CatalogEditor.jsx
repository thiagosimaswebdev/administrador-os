import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWorkshop } from "@/contexts/WorkshopContext";

export function CatalogEditor({ kind }) {
  const { settings, saveSettings } = useWorkshop();
  const service = kind === "services";
  const [entry, setEntry] = useState(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);
  async function save(e) {
    e.preventDefault();
    if (!entry.nome.trim()) return;
    if (service && (!Number.isInteger(Number(entry.dias)) || Number(entry.dias) < 0)) {
      toast.error("Informe a garantia em dias.");
      return;
    }
    if (
      settings[kind].some(
        (item) =>
          item.id !== entry.id && item.nome.toLowerCase() === entry.nome.trim().toLowerCase(),
      )
    ) {
      toast.error("Este nome já está cadastrado.");
      return;
    }
    setBusy(true);
    try {
      const item = {
        ...entry,
        nome: entry.nome.trim(),
        id: entry.id || crypto.randomUUID(),
        ...(service ? { dias: Number(entry.dias) } : {}),
      };
      const items = entry.id
        ? settings[kind].map((old) => (old.id === entry.id ? item : old))
        : [...settings[kind], item];
      await saveSettings({ ...settings, [kind]: items });
      setEntry(null);
      toast.success("Cadastro salvo.");
    } catch {
      toast.error("Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await saveSettings({
        ...settings,
        [kind]: settings[kind].filter((item) => item.id !== removing.id),
      });
      setRemoving(null);
      toast.success("Item excluído.");
    } catch {
      toast.error("Não foi possível excluir.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">{service ? "Serviços" : "Checklist"}</h1>
        <Button
          onClick={() => {
            setRemoving(null);
            setEntry({ nome: "", dias: 90, observacao: "" });
          }}
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>
      {entry && (
        <form className="my-6 space-y-4 border-y py-5" onSubmit={save}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{entry.id ? "Editar" : "Novo item"}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cancelar edição"
              onClick={() => setEntry(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="catalog-name">Nome *</Label>
            <Input
              id="catalog-name"
              required
              autoFocus
              maxLength={100}
              value={entry.nome}
              onChange={(e) => setEntry((p) => ({ ...p, nome: e.target.value }))}
            />
          </div>
          {service && (
            <>
              <div className="space-y-2">
                <Label htmlFor="catalog-days">Garantia em dias *</Label>
                <Input
                  id="catalog-days"
                  type="number"
                  min="0"
                  max="9999"
                  required
                  value={entry.dias}
                  onChange={(e) => setEntry((p) => ({ ...p, dias: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalog-note">Observação</Label>
                <Textarea
                  id="catalog-note"
                  maxLength={500}
                  value={entry.observacao}
                  onChange={(e) => setEntry((p) => ({ ...p, observacao: e.target.value }))}
                />
              </div>
            </>
          )}
          <Button disabled={busy}>
            <Save className="size-4" />
            Salvar
          </Button>
        </form>
      )}
      {removing && (
        <div role="alertdialog" aria-label="Confirmar exclusão" className="my-6 border-y py-5">
          <p className="mb-3">Excluir “{removing.nome}”?</p>
          <div className="flex gap-2">
            <Button variant="destructive" disabled={busy} onClick={remove}>
              Excluir
            </Button>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
      <div className="mt-6 divide-y border-y">
        {settings[kind].map((item) => (
          <article key={item.id} className="flex items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <h2 className="break-words font-semibold">{item.nome}</h2>
              {service && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.dias} dias de garantia{item.observacao && ` · ${item.observacao}`}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar ${item.nome}`}
                title="Editar"
                onClick={() => {
                  setRemoving(null);
                  setEntry({ ...item });
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Excluir ${item.nome}`}
                title="Excluir"
                onClick={() => {
                  setEntry(null);
                  setRemoving(item);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </article>
        ))}
        {!settings[kind].length && (
          <p className="py-10 text-muted-foreground">Nenhum item cadastrado.</p>
        )}
      </div>
    </main>
  );
}
