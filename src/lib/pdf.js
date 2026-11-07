import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { TERMO, garantiaDias } from "./os";

const TEAL = [15, 107, 92];
const GRAY = [100, 110, 115];
const DARK = [30, 38, 42];

function imgSize(dataUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ w: image.naturalWidth, h: image.naturalHeight });
    image.onerror = () => resolve({ w: 1, h: 1 });
    image.src = dataUrl;
  });
}

export async function gerarPDF(order, logo, assinatura) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const width = 210;
  const margin = 14;
  const contentWidth = width - margin * 2;
  const company = order.empresa || {};
  let y = 12;

  const ensureSpace = (height) => {
    if (y + height > 270) {
      doc.addPage();
      y = 16;
    }
  };

  if (logo) {
    const { w, h } = await imgSize(logo);
    const scale = Math.min(42 / w, 18 / h);
    doc.addImage(
      logo,
      logo.startsWith("data:image/png") ? "PNG" : "JPEG",
      margin,
      y,
      w * scale,
      h * scale,
    );
  }
  doc
    .setTextColor(...TEAL)
    .setFont("helvetica", "bold")
    .setFontSize(16);
  doc.text("ORDEM DE SERVIÇO", width - margin, y + 6, { align: "right" });
  doc.setFontSize(10).setTextColor(...DARK);
  doc.text(order.numero, width - margin, y + 12, { align: "right" });
  doc
    .setFont("helvetica", "normal")
    .setTextColor(...GRAY)
    .setFontSize(8.5);
  doc.text(
    `Emissão: ${new Date(order.emissao).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`,
    width - margin,
    y + 17,
    { align: "right" },
  );
  y += 23;
  const companyLine = [company.nome, company.telefone, company.email].filter(Boolean).join("  ·  ");
  if (companyLine) {
    doc
      .setFont("helvetica", "normal")
      .setTextColor(...GRAY)
      .setFontSize(7.5);
    doc.text(doc.splitTextToSize(companyLine, contentWidth)[0], margin, y);
    y += 4;
  }
  doc
    .setDrawColor(...TEAL)
    .setLineWidth(0.6)
    .line(margin, y, width - margin, y);
  y += 5;

  const section = (title) => {
    ensureSpace(12);
    doc.setFillColor(232, 243, 240).rect(margin, y, contentWidth, 6, "F");
    doc
      .setTextColor(...TEAL)
      .setFont("helvetica", "bold")
      .setFontSize(9);
    doc.text(title.toUpperCase(), margin + 2, y + 4.2);
    y += 8.5;
  };
  const fields = (pairs, columns = 2) => {
    const cellWidth = contentWidth / columns;
    pairs.forEach(([label, value], index) => {
      if (index % columns === 0) ensureSpace(10);
      const x = margin + (index % columns) * cellWidth;
      doc
        .setFont("helvetica", "normal")
        .setFontSize(7.5)
        .setTextColor(...GRAY)
        .text(label, x + 2, y);
      doc
        .setFont("helvetica", "bold")
        .setFontSize(9.5)
        .setTextColor(...DARK);
      doc.text(doc.splitTextToSize(String(value || "—"), cellWidth - 4)[0], x + 2, y + 4.2);
      if (index % columns === columns - 1 || index === pairs.length - 1) y += 9.5;
    });
  };
  const list = (items) => {
    doc
      .setFont("helvetica", "normal")
      .setFontSize(9)
      .setTextColor(...DARK);
    const lines = doc.splitTextToSize(
      items.length ? items.join("  •  ") : "Nenhum item marcado",
      contentWidth - 4,
    );
    for (let offset = 0; offset < lines.length; offset += 10) {
      const pageLines = lines.slice(offset, offset + 10);
      ensureSpace(pageLines.length * 4.2 + 3);
      doc.text(pageLines, margin + 2, y + 1);
      y += pageLines.length * 4.2 + 3;
    }
  };

  section("Dados da assistência");
  fields([
    ["Empresa", company.fantasia || company.nome],
    ["Telefone / WhatsApp", [company.telefone, company.whatsapp].filter(Boolean).join(" / ")],
    ["Instagram", company.instagram],
    ["Endereço", [company.endereco, company.cidade, company.estado].filter(Boolean).join(", ")],
  ]);

  section("Dados do cliente");
  fields([
    ["Nome", order.cliente],
    ["Telefone", order.telefone],
    ["Status", order.status || "Recebido"],
  ]);

  section("Dados do equipamento");
  fields(
    [
      ["Sistema", order.so],
      ["Marca", order.marca],
      ["Modelo", order.modelo],
      ["IMEI", order.imei],
      ["Senha", order.senha || "Não informada"],
    ],
    3,
  );

  const days = order.garantiaSnapshot ?? garantiaDias(order.servico, Number(order.garantiaCustom));
  section("Serviço executado");
  fields(
    [
      ["Serviço", order.servico === "Outros" ? order.descricao : order.servico],
      ["Garantia", days === null ? "A combinar" : `${days} dias`],
      ["Valor", order.valor],
    ],
    3,
  );
  if (order.serviceObservation) {
    ensureSpace(8);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(8)
      .setTextColor(...GRAY);
    doc.text(
      doc.splitTextToSize(
        `Observação do serviço: ${order.serviceObservation}`,
        contentWidth - 4,
      )[0],
      margin + 2,
      y,
    );
    y += 5;
  }

  section("Checklist de entrada");
  const checklist =
    order.checklist.includes("Outro") && order.checklistOutro.trim()
      ? order.checklist.map((item) =>
          item === "Outro" ? `Outro: ${order.checklistOutro.trim()}` : item,
        )
      : order.checklist;
  list(checklist);
  section("Acessórios recebidos");
  list(order.acessorios);

  if (order.observacoes.trim()) {
    section("Observações");
    const lines = doc.splitTextToSize(order.observacoes.trim(), contentWidth - 4);
    for (let offset = 0; offset < lines.length; offset += 10) {
      const pageLines = lines.slice(offset, offset + 10);
      ensureSpace(pageLines.length * 4.2 + 3);
      doc
        .setFont("helvetica", "normal")
        .setFontSize(9)
        .setTextColor(...DARK);
      doc.text(pageLines, margin + 2, y + 1);
      y += pageLines.length * 4.2 + 3;
    }
  }

  const photos = order.fotos || [];
  if (photos.length) {
    section("Fotos do aparelho");
    for (const photo of photos) {
      ensureSpace(43);
      const { w, h } = await imgSize(photo.data);
      const scale = Math.min(54 / w, 34 / h);
      const format = photo.data.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(photo.data, format, margin + 2, y, w * scale, h * scale);
      doc
        .setFont("helvetica", "normal")
        .setFontSize(8)
        .setTextColor(...GRAY)
        .text(photo.label, margin + 60, y + 5);
      y += 39;
    }
  }

  section("Termo de garantia");
  const warrantyLines = doc.splitTextToSize(TERMO, contentWidth - 4);
  for (let offset = 0; offset < warrantyLines.length; offset += 10) {
    const pageLines = warrantyLines.slice(offset, offset + 10);
    ensureSpace(pageLines.length * 3.7 + 4);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(7.8)
      .setTextColor(...GRAY);
    doc.text(pageLines, margin + 2, y + 1, { lineHeightFactor: 1.35 });
    y += pageLines.length * 3.7 + 4;
  }

  ensureSpace(48);
  const signatureY = y + 24;
  const half = (contentWidth - 16) / 2;
  const drawSignature = (x, label) => {
    doc
      .setDrawColor(...GRAY)
      .setLineWidth(0.3)
      .line(x, signatureY, x + half, signatureY);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(8)
      .setTextColor(...GRAY);
    doc.text(label, x + half / 2, signatureY + 4, { align: "center" });
  };
  if (assinatura) doc.addImage(assinatura, "PNG", margin + 8, signatureY - 19, half - 16, 18);
  drawSignature(margin, "Assinatura do Cliente");
  drawSignature(margin + half + 16, "Assinatura da Assistência Técnica");

  const qrValue = order.trackingUrl || order.numero;
  const qr = await QRCode.toDataURL(qrValue, { errorCorrectionLevel: "M", margin: 1, width: 128 });
  doc.addImage(qr, "PNG", width - margin - 18, signatureY - 25, 18, 18);
  doc
    .setFont("helvetica", "normal")
    .setFontSize(6)
    .setTextColor(...GRAY);
  doc.text("Acompanhe sua O.S.", width - margin - 27, signatureY - 3, { align: "center" });
  doc
    .setFontSize(7)
    .setTextColor(160, 165, 170)
    .text(company.fantasia || company.nome || order.numero, width / 2, 291, { align: "center" });

  return doc.output("blob");
}
