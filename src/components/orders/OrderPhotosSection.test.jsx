import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderPhotosSection } from "./OrderPhotosSection";
import { imageFromFile } from "@/services/images";

vi.mock("@/services/images", () => ({
  imageFromFile: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

describe("OrderPhotosSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    imageFromFile.mockResolvedValue("data:image/jpeg;base64,processed");
  });

  it("substitui uma foto fixa sem ultrapassar o limite", async () => {
    const photos = [
      { label: "Frente", data: "data:image/jpeg;base64,old" },
      ...Array.from({ length: 7 }, (_, index) => ({
        label: `Extra ${index + 1}`,
        data: "data:image/jpeg;base64,extra",
      })),
    ];
    const onPhotosChange = vi.fn();
    const file = new File(["photo"], "frente.jpg", { type: "image/jpeg" });

    render(<OrderPhotosSection photos={photos} onPhotosChange={onPhotosChange} />);
    fireEvent.change(screen.getByLabelText("Foto Frente"), { target: { files: [file] } });

    await waitFor(() => expect(onPhotosChange).toHaveBeenCalledOnce());
    const updatedPhotos = onPhotosChange.mock.calls[0][0];
    expect(updatedPhotos).toHaveLength(8);
    expect(updatedPhotos.find((photo) => photo.label === "Frente").data).toBe(
      "data:image/jpeg;base64,processed",
    );
  });

  it("impede anexos adicionais quando o limite foi atingido", () => {
    const photos = Array.from({ length: 8 }, (_, index) => ({
      label: `Extra ${index + 1}`,
      data: "data:image/jpeg;base64,extra",
    }));
    const onPhotosChange = vi.fn();
    const file = new File(["photo"], "extra.jpg", { type: "image/jpeg" });

    render(<OrderPhotosSection photos={photos} onPhotosChange={onPhotosChange} />);
    fireEvent.change(screen.getByLabelText("Tirar foto adicional"), { target: { files: [file] } });

    expect(onPhotosChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Tirar foto" })).toBeDisabled();
  });
});
