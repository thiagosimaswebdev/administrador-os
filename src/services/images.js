export async function imageFromFile(file, maxSize = 1200) {
  if (!file.type.startsWith("image/")) throw new Error("Selecione uma imagem.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Imagem muito grande.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Imagem indisponível.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function extractLogoPalette(file) {
  if (!file.type.startsWith("image/")) throw new Error("Selecione uma imagem.");
  const fallbackPalette = ["#0f6b5c", "#2ab99a"];
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });

    const sampleSize = 48;
    const scale = Math.min(1, sampleSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Imagem indisponível.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const buckets = new Map();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const alpha = pixels[offset + 3];
      const brightness = (red + green + blue) / 3;
      const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
      if (alpha < 128 || (brightness > 242 && saturation < 28)) continue;

      const key = `${red >> 4}-${green >> 4}-${blue >> 4}`;
      const bucket = buckets.get(key) || { red: 0, green: 0, blue: 0, count: 0 };
      bucket.red += red;
      bucket.green += green;
      bucket.blue += blue;
      bucket.count += 1;
      buckets.set(key, bucket);
    }

    const colors = [...buckets.values()]
      .map((bucket) => {
        const channels = [bucket.red, bucket.green, bucket.blue].map((channel) =>
          Math.round(channel / bucket.count),
        );
        return {
          hex: `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`,
          channels,
          chroma: Math.max(...channels) - Math.min(...channels),
          count: bucket.count,
        };
      })
      .filter((color) => color.chroma >= 36)
      .sort((first, second) => second.count * second.chroma - first.count * first.chroma);

    if (colors.length === 0) return fallbackPalette;
    const [first, second] = colors;
    const distinctSecond = colors.find((color) => {
      const distance = Math.sqrt(
        color.channels.reduce(
          (sum, channel, index) => sum + (channel - first.channels[index]) ** 2,
          0,
        ),
      );
      return distance > 48;
    });
    return [first.hex, distinctSecond?.hex || fallbackPalette[1]];
  } finally {
    URL.revokeObjectURL(url);
  }
}
