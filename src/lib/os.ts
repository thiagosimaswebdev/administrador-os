export type Servico = "Troca de Tela" | "Troca de Bateria" | "Porta de Carregamento" | "Outros";
export const SERVICOS: Servico[] = ["Troca de Tela", "Troca de Bateria", "Porta de Carregamento", "Outros"];

export const CHECKLIST = [
  "Tela quebrada", "Trincas", "Tampa traseira danificada", "Carcaça amassada", "Marcas de queda",
  "Oxidação aparente", "Sem avarias aparentes", "Sem teste funcional", "Aparelho não liga", "Outro",
];
export const ACESSORIOS = ["Carregador", "Cabo USB", "Chip", "Cartão de Memória", "Película", "Capa", "Nenhum"];

export const TERMO =
  "A garantia cobre exclusivamente o serviço executado e/ou a peça substituída, pelo prazo informado nesta Ordem de Serviço. A garantia não cobre danos decorrentes de quedas, impactos, pressão física, mau uso, violação do aparelho por terceiros, oxidação, contato com água ou qualquer outro líquido, utilização de acessórios inadequados, descargas elétricas ou quaisquer danos externos posteriores ao reparo. Equipamentos que apresentem sinais de violação, umidade ou avarias físicas terão a garantia automaticamente cancelada. A garantia é limitada ao reparo realizado e não cobre defeitos não relacionados ao serviço executado.";

export function garantiaDias(servico: Servico | "", custom?: number): number | null {
  if (servico === "Troca de Tela" || servico === "Troca de Bateria") return 90;
  if (servico === "Porta de Carregamento") return 30;
  if (servico === "Outros") return custom && custom > 0 ? custom : null;
  return null;
}

export function gerarNumeroOS(date = new Date(), rand = Math.random): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const x = String(Math.floor(rand() * 10000)).padStart(4, "0");
  return `OS-${y}${m}${d}-${x}`;
}

/** Digits-only input -> "R$ 350,00" */
export function formatBRLFromDigits(digits: string): string {
  const n = parseInt(digits.replace(/\D/g, "") || "0", 10);
  if (!n) return "";
  return (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export interface OSData {
  numero: string;
  emissao: Date;
  cliente: string;
  telefone: string;
  so: "" | "Android" | "iPhone (iOS)";
  marca: string;
  modelo: string;
  imei: string;
  senha: string;
  servico: Servico | "";
  descricao: string;
  garantiaCustom: string;
  valor: string;
  checklist: string[];
  acessorios: string[];
  observacoes: string;
}

export function validar(o: OSData): string | null {
  if (!o.cliente.trim()) return "Informe o nome do cliente.";
  if (o.telefone.replace(/\D/g, "").length < 10) return "Informe um telefone válido.";
  if (!o.so) return "Selecione o sistema operacional.";
  if (!o.marca.trim()) return "Informe a marca do aparelho.";
  if (!o.modelo.trim()) return "Informe o modelo do aparelho.";
  if (!o.servico) return "Selecione o serviço executado.";
  if (o.servico === "Outros") {
    if (!o.descricao.trim()) return "Descreva o serviço executado.";
    if (!garantiaDias("Outros", Number(o.garantiaCustom))) return "Informe a garantia em dias.";
  }
  if (!o.valor) return "Informe o valor do serviço.";
  if (o.observacoes.length > 500) return "As observações devem ter no máximo 500 caracteres.";
  return null;
}
