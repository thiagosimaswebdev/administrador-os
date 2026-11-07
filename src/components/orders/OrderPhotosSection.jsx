import { useRef } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MAX_ORDER_PHOTOS } from "@/lib/os";
import { imageFromFile } from "@/services/images";

const FIXED_PHOTO_LABELS = new Set(["Frente", "Traseira", "Adicional"]);

export function OrderPhotosSection({ photos, onPhotosChange }) {
  const cameraInput = useRef(null);
  const galleryInput = useRef(null);
  const orderPhotos = photos || [];

  const addAdditionalPhoto = async (event) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (orderPhotos.length >= MAX_ORDER_PHOTOS) {
      toast.error(`O limite é de ${MAX_ORDER_PHOTOS} fotos por O.S.`);
      return;
    }

    const usedLabels = new Set(orderPhotos.map((photo) => photo.label));
    let index = 1;
    while (usedLabels.has(`Extra ${index}`)) index += 1;

    try {
      const data = await imageFromFile(file);
      onPhotosChange([...orderPhotos, { label: `Extra ${index}`, data }]);
    } catch {
      toast.error("Não foi possível abrir a foto.");
    }
  };

  const replaceFixedPhoto = async (label, event) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const replacingPhoto = orderPhotos.some((photo) => photo.label === label);
    if (!replacingPhoto && orderPhotos.length >= MAX_ORDER_PHOTOS) {
      toast.error(`O limite é de ${MAX_ORDER_PHOTOS} fotos por O.S.`);
      return;
    }

    try {
      const data = await imageFromFile(file);
      onPhotosChange([...orderPhotos.filter((photo) => photo.label !== label), { label, data }]);
    } catch {
      toast.error("Não foi possível abrir a foto.");
    }
  };

  const removePhoto = (label) => {
    onPhotosChange(orderPhotos.filter((photo) => photo.label !== label));
  };

  return (
    <section className="border-b py-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-normal text-primary">
        Fotos do aparelho (opcional)
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {["Frente", "Traseira", "Adicional"].map((label) => {
            const photo = orderPhotos.find((item) => item.label === label);
            return (
              <div key={label}>
                <label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted text-muted-foreground">
                  {photo ? (
                    <img src={photo.data} alt={label} className="size-full object-cover" />
                  ) : (
                    <Camera className="size-6" />
                  )}
                  <input
                    type="file"
                    aria-label={`Foto ${label}`}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => replaceFixedPhoto(label, event)}
                  />
                </label>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs">{label}</span>
                  {photo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover foto ${label}`}
                      onClick={() => removePhoto(label)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {orderPhotos
            .filter((photo) => !FIXED_PHOTO_LABELS.has(photo.label))
            .map((photo) => (
              <div key={photo.label}>
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  <img src={photo.data} alt={photo.label} className="size-full object-cover" />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs">{photo.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover foto ${photo.label}`}
                    onClick={() => removePhoto(photo.label)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              aria-label="Tirar foto adicional"
              onChange={addAdditionalPhoto}
            />
            <Button
              type="button"
              variant="outline"
              disabled={orderPhotos.length >= MAX_ORDER_PHOTOS}
              onClick={() => cameraInput.current?.click()}
            >
              <Camera className="size-4" />
              Tirar foto
            </Button>
            <input
              ref={galleryInput}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Escolher foto da galeria"
              onChange={addAdditionalPhoto}
            />
            <Button
              type="button"
              variant="outline"
              disabled={orderPhotos.length >= MAX_ORDER_PHOTOS}
              onClick={() => galleryInput.current?.click()}
            >
              <ImagePlus className="size-4" />
              Escolher da galeria
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            {orderPhotos.length}/{MAX_ORDER_PHOTOS} fotos
          </span>
        </div>
      </div>
    </section>
  );
}
