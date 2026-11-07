import { afterEach, describe, expect, it, vi } from "vitest";

const pdfState = vi.hoisted(() => ({ page: 1, textCalls: [], imageCalls: [] }));

vi.mock("jspdf", () => ({
  jsPDF: class {
    constructor() {
      pdfState.page = 1;
      pdfState.textCalls = [];
      pdfState.imageCalls = [];
    }

    addPage() {
      pdfState.page += 1;
      return this;
    }

    addImage(data, format, x, y, width, height) {
      pdfState.imageCalls.push({ data, page: pdfState.page, x, y, width, height });
      return this;
    }

    setTextColor() {
      return this;
    }

    setFont() {
      return this;
    }

    setFontSize() {
      return this;
    }

    setDrawColor() {
      return this;
    }

    setFillColor() {
      return this;
    }

    setLineWidth() {
      return this;
    }

    line() {
      return this;
    }

    rect() {
      return this;
    }

    splitTextToSize(text) {
      if (text === "LONG_OBSERVATIONS") return Array(19).fill("Linha de observação");
      return [String(text)];
    }

    text(text) {
      pdfState.textCalls.push({
        page: pdfState.page,
        text: Array.isArray(text) ? text.join("\n") : text,
      });
    }

    output() {
      return new Blob();
    }
  },
}));

vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,qr") },
}));

import { gerarPDF } from "./pdf";

afterEach(() => {
  vi.unstubAllGlobals();
});

function createOrder(photoCount, overrides = {}) {
  return {
    numero: "OS-20261107-1234",
    emissao: "2026-11-07T12:00:00.000Z",
    checklist: [],
    checklistOutro: "",
    acessorios: [],
    observacoes: "",
    fotos: Array.from({ length: photoCount }, (_, index) => ({
      data: "data:image/jpeg;base64,photo",
      label: `Foto ${index + 1}`,
    })),
    ...overrides,
  };
}

describe("gerarPDF", () => {
  it.each([1, 8])("mantém o termo inteiro após %i fotos", async (photoCount) => {
    vi.stubGlobal(
      "Image",
      class {
        naturalWidth = 400;
        naturalHeight = 300;

        set src(value) {
          this.onload();
        }
      },
    );

    await gerarPDF(createOrder(photoCount), null, null);

    const term = pdfState.textCalls.find(({ text }) => text === "TERMO DE GARANTIA");
    const lastPhoto = pdfState.textCalls.findLast(({ text }) => text === `Foto ${photoCount}`);
    expect(term.page).toBe(lastPhoto.page + 1);
  });

  it("posiciona as fotos em três colunas compactas", async () => {
    vi.stubGlobal(
      "Image",
      class {
        naturalWidth = 400;
        naturalHeight = 300;

        set src(value) {
          this.onload();
        }
      },
    );

    await gerarPDF(createOrder(8), null, null);

    const photoImages = pdfState.imageCalls.filter(({ data }) => data.includes("photo"));
    expect(photoImages).toHaveLength(8);
    for (let index = 0; index < photoImages.length; index += 3) {
      const row = photoImages.slice(index, index + 3);
      expect(new Set(row.map((photo) => photo.y)).size).toBe(1);
      if (row.length === 3) {
        expect(row[1].x).toBeGreaterThan(row[0].x);
        expect(row[2].x).toBeGreaterThan(row[1].x);
      }
    }
    expect(photoImages[3].page > photoImages[0].page || photoImages[3].y > photoImages[0].y).toBe(
      true,
    );
  });

  it("não adiciona uma página vazia para o termo quando não há fotos", async () => {
    await gerarPDF(createOrder(0), null, null);

    const term = pdfState.textCalls.find(({ text }) => text === "TERMO DE GARANTIA");
    expect(term.page).toBe(1);
  });

  it("passa o termo para a próxima página se não houver espaço suficiente", async () => {
    await gerarPDF(createOrder(0, { observacoes: "LONG_OBSERVATIONS" }), null, null);

    const term = pdfState.textCalls.find(({ text }) => text === "TERMO DE GARANTIA");
    expect(term.page).toBeGreaterThan(1);
  });
});
