import { describe, it, expect } from "vitest";
import { garantiaDias, gerarNumeroOS, formatBRLFromDigits, MARCA_IOS, MARCAS_ANDROID, MODELOS_IPHONE } from "./os";

describe("regras da O.S.", () => {
  it("tela e bateria têm 90 dias", () => {
    expect(garantiaDias("Troca de Tela")).toBe(90);
    expect(garantiaDias("Troca de Bateria")).toBe(90);
  });
  it("porta de carregamento tem 30 dias", () => {
    expect(garantiaDias("Porta de Carregamento")).toBe(30);
  });
  it("outros usa garantia personalizada", () => {
    expect(garantiaDias("Outros", 45)).toBe(45);
    expect(garantiaDias("Outros")).toBeNull();
  });
  it("número no formato OS-AAAAMMDD-XXXX", () => {
    expect(gerarNumeroOS(new Date(2026, 10, 2), () => 0.4837)).toBe("OS-20261102-4837");
  });
  it("valor em reais", () => {
    expect(formatBRLFromDigits("35000").replace(/\s/g, " ")).toBe("R$ 350,00");
  });
  it("iPhone tem marca fixa e modelos na lista; Android tem as marcas usuais", () => {
    expect(MARCA_IOS).toBe("Apple (iPhone)");
    expect(MODELOS_IPHONE).toContain("iPhone 17 Pro Max");
    expect(MARCAS_ANDROID).toContain("Samsung");
    expect(MARCAS_ANDROID).toContain("Xiaomi");
    expect(MARCAS_ANDROID).not.toContain(MARCA_IOS);
  });
});
