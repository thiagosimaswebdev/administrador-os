import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import {
  ACESSORIOS, CHECKLIST, MARCA_IOS, MARCAS_ANDROID, MODELOS_IPHONE, SERVICOS,
  formatBRLFromDigits, formatPhone, garantiaDias, gerarNumeroOS, validar,
  type OSData, type Servico,
} from "@/lib/os";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ordem de Serviço — Assistência Técnica de Celulares" },
      { name: "description", content: "Gere ordens de serviço em PDF com garantia, checklist e assinatura, direto do celular." },
      { property: "og:title", content: "Ordem de Serviço — Assistência Técnica" },
      { property: "og:description", content: "Crie, baixe e compartilhe ordens de serviço em PDF pelo celular." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const vazio = (numero = ""): OSData => ({
  numero, emissao: new Date(), cliente: "", telefone: "", so: "", marca: "", modelo: "",
  imei: "", senha: "", servico: "", descricao: "", garantiaCustom: "", valor: "", checklist: [], acessorios: [], observacoes: "",
});

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-card">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-primary">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Field({ label, req, children }: { label: string; req?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}{req && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
function Chips({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <label key={o} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${on ? "border-primary bg-accent text-accent-foreground" : "border-border"}`}>
            <Checkbox checked={on} onCheckedChange={(c) => onChange(c ? [...value, o] : value.filter((x) => x !== o))} />
            {o}
          </label>
        );
      })}
    </div>
  );
}
const selectCls = "h-11 w-full rounded-md border border-input bg-background px-3 text-base";

function Index() {
  const [os, setOs] = useState<OSData>(() => vazio());
  const [logo, setLogo] = useState<string | null>(null);
  const [pdf, setPdf] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const sig = useRef<SignaturePadHandle>(null);
  const set = <K extends keyof OSData>(k: K, v: OSData[K]) => setOs((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    setLogo(localStorage.getItem("os-logo"));
    setOs((p) => ({ ...p, numero: p.numero || gerarNumeroOS() }));
  }, []);

  const onLogo = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const v = r.result as string;
      setLogo(v);
      try { localStorage.setItem("os-logo", v); } catch { /* too large */ }
    };
    r.readAsDataURL(f);
  };

  const gerar = async () => {
    const err = validar(os);
    if (err) { toast.error(err); return; }
    setBusy(true);
    try {
      const { gerarPDF } = await import("@/lib/pdf");
      const blob = await gerarPDF({ ...os, emissao: new Date() }, logo, sig.current?.toDataURL() ?? null);
      if (pdf) URL.revokeObjectURL(pdf.url);
      setPdf({ blob, url: URL.createObjectURL(blob) });
    } catch {
      toast.error("Não foi possível gerar o PDF.");
    } finally {
      setBusy(false);
    }
  };

  const fileName = `${os.numero}.pdf`;
  const baixar = () => {
    const a = document.createElement("a");
    a.href = pdf!.url; a.download = fileName; a.click();
  };
  const compartilhar = async () => {
    const file = new File([pdf!.blob], fileName, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: `Ordem de Serviço ${os.numero}` }); } catch { /* cancelado */ }
    } else {
      toast.info("Compartilhamento não suportado neste navegador. Baixe o PDF.");
    }
  };
  const nova = () => {
    if (pdf) URL.revokeObjectURL(pdf.url);
    setPdf(null); setOs(vazio(gerarNumeroOS())); sig.current?.clear(); window.scrollTo({ top: 0 });
  };

  const dias = garantiaDias(os.servico, Number(os.garantiaCustom));

  if (pdf) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-4 pb-8">
        <Toaster position="top-center" />
        <header className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">PDF gerado</p>
          <h1 className="text-2xl font-extrabold">{os.numero}</h1>
        </header>
        <iframe src={pdf.url} title="Prévia do PDF" className="h-[60vh] w-full rounded-2xl border bg-card shadow-card" />
        <div className="grid gap-3">
          <Button size="lg" className="h-12 text-base font-bold" onClick={compartilhar}>COMPARTILHAR PDF</Button>
          <Button size="lg" variant="outline" className="h-12 text-base font-bold" onClick={baixar}>BAIXAR PDF</Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={() => setPdf(null)}>Editar ordem</Button>
            <Button variant="secondary" onClick={nova}>Nova ordem</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4 pb-28">
      <Toaster position="top-center" />
      <header className="flex items-center gap-4 pt-2">
        <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-input bg-card text-center text-[10px] leading-tight text-muted-foreground">
          {logo ? <img src={logo} alt="Logo" className="h-full w-full object-contain" /> : <>Enviar<br />logo</>}
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
        </label>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ordem de Serviço</p>
          <h1 className="truncate text-xl font-extrabold">{os.numero}</h1>
          {logo && <button className="text-xs text-muted-foreground underline" onClick={() => { setLogo(null); localStorage.removeItem("os-logo"); }}>remover logo</button>}
        </div>
      </header>

      <Card title="Cliente">
        <Field label="Nome do cliente" req><Input className="h-11" value={os.cliente} onChange={(e) => set("cliente", e.target.value)} /></Field>
        <Field label="Telefone" req><Input className="h-11" inputMode="tel" placeholder="(11) 98765-4321" value={os.telefone} onChange={(e) => set("telefone", formatPhone(e.target.value))} /></Field>
      </Card>

      <Card title="Equipamento">
        <Field label="Sistema operacional" req>
          <div className="grid grid-cols-2 gap-2">
            {(["Android", "iPhone (iOS)"] as const).map((s) => (
              <Button key={s} type="button" variant={os.so === s ? "default" : "outline"} className="h-11" onClick={() => set("so", s)}>{s}</Button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marca" req><Input className="h-11" value={os.marca} onChange={(e) => set("marca", e.target.value)} /></Field>
          <Field label="Modelo" req><Input className="h-11" value={os.modelo} onChange={(e) => set("modelo", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="IMEI"><Input className="h-11" inputMode="numeric" value={os.imei} onChange={(e) => set("imei", e.target.value.replace(/\D/g, "").slice(0, 15))} /></Field>
          <Field label="Senha"><Input className="h-11" value={os.senha} onChange={(e) => set("senha", e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="Serviço">
        <Field label="Serviço executado" req>
          <select className={selectCls} value={os.servico} onChange={(e) => set("servico", e.target.value as Servico)}>
            <option value="">Selecione…</option>
            {SERVICOS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        {os.servico === "Outros" && (
          <>
            <Field label="Descrição do serviço" req><Input className="h-11" value={os.descricao} onChange={(e) => set("descricao", e.target.value)} /></Field>
            <Field label="Garantia (dias)" req><Input className="h-11" inputMode="numeric" value={os.garantiaCustom} onChange={(e) => set("garantiaCustom", e.target.value.replace(/\D/g, "").slice(0, 4))} /></Field>
          </>
        )}
        {dias && <p className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground">Garantia: {dias} dias</p>}
        <Field label="Valor" req><Input className="h-11 text-lg font-bold" inputMode="numeric" placeholder="R$ 0,00" value={os.valor} onChange={(e) => set("valor", formatBRLFromDigits(e.target.value))} /></Field>
      </Card>

      <Card title="Checklist de entrada"><Chips options={CHECKLIST} value={os.checklist} onChange={(v) => set("checklist", v)} /></Card>
      <Card title="Acessórios recebidos"><Chips options={ACESSORIOS} value={os.acessorios} onChange={(v) => set("acessorios", v)} /></Card>

      <Card title="Observações">
        <Textarea rows={3} maxLength={500} value={os.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
        <p className="text-right text-xs text-muted-foreground">{os.observacoes.length}/500</p>
      </Card>

      <Card title="Assinatura do cliente (opcional)">
        <SignaturePad ref={sig} />
        <Button variant="outline" size="sm" onClick={() => sig.current?.clear()}>Limpar assinatura</Button>
      </Card>

      <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-xl">
          <Button size="lg" className="h-13 w-full text-base font-bold" disabled={busy} onClick={gerar}>
            {busy ? "Gerando…" : "Gerar PDF"}
          </Button>
        </div>
      </div>
    </main>
  );
}
