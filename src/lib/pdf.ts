import { jsPDF } from "jspdf";
import { TERMO, garantiaDias, type OSData } from "./os";

const TEAL: [number, number, number] = [15, 107, 92];
const GRAY: [number, number, number] = [100, 110, 115];
const DARK: [number, number, number] = [30, 38, 42];

function imgSize(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((res) => {
    const i = new Image();
    i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
    i.onerror = () => res({ w: 1, h: 1 });
    i.src = dataUrl;
  });
}

export async function gerarPDF(o: OSData, logo: string | null, assinatura: string | null): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210, M = 14, CW = W - M * 2;
  let y = 12;

  // Header
  if (logo) {
    const { w, h } = await imgSize(logo);
    const maxH = 18, maxW = 50;
    const s = Math.min(maxW / w, maxH / h);
    const fmt = logo.startsWith("data:image/png") ? "PNG" : "JPEG";
    doc.addImage(logo, fmt, M, y, w * s, h * s);
  }
  doc.setTextColor(...TEAL).setFont("helvetica", "bold").setFontSize(16);
  doc.text("ORDEM DE SERVIÇO", W - M, y + 6, { align: "right" });
  doc.setFontSize(10).setTextColor(...DARK);
  doc.text(o.numero, W - M, y + 12, { align: "right" });
  doc.setFont("helvetica", "normal").setTextColor(...GRAY).setFontSize(8.5);
  doc.text(`Emissão: ${o.emissao.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`, W - M, y + 17, { align: "right" });
  y += 22;
  doc.setDrawColor(...TEAL).setLineWidth(0.6).line(M, y, W - M, y);
  y += 5;

  const section = (t: string) => {
    doc.setFillColor(232, 243, 240).rect(M, y, CW, 6, "F");
    doc.setTextColor(...TEAL).setFont("helvetica", "bold").setFontSize(9);
    doc.text(t.toUpperCase(), M + 2, y + 4.2);
    y += 8.5;
  };
  const fields = (pairs: [string, string][], cols = 2) => {
    const cw = CW / cols;
    pairs.forEach(([k, v], i) => {
      const cx = M + (i % cols) * cw;
      doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(...GRAY).text(k, cx + 2, y);
      doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...DARK);
      doc.text(doc.splitTextToSize(v || "—", cw - 4)[0], cx + 2, y + 4.2);
      if (i % cols === cols - 1 || i === pairs.length - 1) y += 9.5;
    });
  };
  const list = (items: string[]) => {
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...DARK);
    const lines = doc.splitTextToSize(items.length ? items.join("  •  ") : "Nenhum item marcado", CW - 4);
    doc.text(lines, M + 2, y + 1);
    y += lines.length * 4.2 + 3;
  };

  section("Dados do Cliente");
  fields([["Nome", o.cliente], ["Telefone", o.telefone]]);

  section("Dados do Equipamento");
  fields([["Sistema", o.so], ["Marca", o.marca], ["Modelo", o.modelo], ["IMEI", o.imei], ["Senha", o.senha || "Não informada"]], 3);

  const dias = garantiaDias(o.servico, Number(o.garantiaCustom));
  section("Serviço Executado");
  fields([
    ["Serviço", o.servico === "Outros" ? o.descricao : o.servico],
    ["Garantia", `${dias} dias`],
    ["Valor", o.valor],
  ], 3);

  section("Checklist de Entrada");
  list(o.checklist);
  section("Acessórios Recebidos");
  list(o.acessorios);

  if (o.observacoes.trim()) {
    section("Observações");
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...DARK);
    const lines = doc.splitTextToSize(o.observacoes.trim(), CW - 4);
    doc.text(lines, M + 2, y + 1);
    y += lines.length * 4.2 + 3;
  }

  section("Termo de Garantia");
  doc.setFont("helvetica", "normal").setFontSize(7.8).setTextColor(...GRAY);
  const termo = doc.splitTextToSize(TERMO, CW - 4);
  doc.text(termo, M + 2, y + 1, { lineHeightFactor: 1.35 });
  y += termo.length * 3.7 + 4;

  // Signatures
  if (y > 255) { doc.addPage(); y = 20; }
  const sy = Math.max(y + 18, 262);
  const half = (CW - 16) / 2;
  const drawSig = (x: number, label: string) => {
    doc.setDrawColor(...GRAY).setLineWidth(0.3).line(x, sy, x + half, sy);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...GRAY);
    doc.text(label, x + half / 2, sy + 4, { align: "center" });
  };
  if (assinatura) {
    doc.addImage(assinatura, "PNG", M + 8, sy - 20, half - 16, 19);
    drawSig(M, "Assinatura do Cliente");
    drawSig(M + half + 16, "Assinatura da Assistência Técnica");
  } else {
    drawSig(M + (CW - half) / 2, "Assinatura da Assistência Técnica");
  }

  doc.setFontSize(7).setTextColor(160, 165, 170).text(o.numero, W / 2, 291, { align: "center" });
  return doc.output("blob");
}
