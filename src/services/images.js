export async function imageFromFile(file, maxSize = 1200) {
  if (!file.type.startsWith("image/")) throw new Error("Selecione uma imagem.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Imagem muito grande.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Imagem indisponível.");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally { URL.revokeObjectURL(url); }
}