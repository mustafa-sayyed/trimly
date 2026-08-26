import QRCode from "qrcode";

/**
 * Plain QR (no branding) as a PNG data URL.
 */
export function generateQrDataUrl(target: string): Promise<string> {
  return QRCode.toDataURL(target, { width: 512, margin: 2 });
}

/**
 * QR composed onto a white card with the Trimly wordmark and the target URL
 * printed underneath, so the link stays readable without scanning.
 * Falls back to the plain QR if canvas composition is unavailable.
 */
export async function generateBrandedQr(target: string): Promise<{
  simpleQr: string;
  brandedQr: string;
}> {
  const qrDataUrl = await generateQrDataUrl(target);
  try {
    return await composeBrandedCard(qrDataUrl, target);
  } catch {
    return {
      simpleQr: qrDataUrl,
      brandedQr: qrDataUrl,
    };
  }
}

const CARD_W = 620;
const CARD_H = 792;
const PAD = 54;
const QR_SIZE = CARD_W - PAD * 2;

async function load_image(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

function truncateForDisplay(url: string, max = 46): string {
  const bare = url.replace(/^https?:\/\//, "");
  return bare.length > max ? `${bare.slice(0, max - 1)}…` : bare;
}

async function composeBrandedCard(
  qrDataUrl: string,
  target: string,
): Promise<{
  simpleQr: string;
  brandedQr: string;
}> {
  const img = await load_image(qrDataUrl);

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W * scale;
  canvas.height = CARD_H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.scale(scale, scale);
  ctx.textAlign = "center";

  // White rounded card background.
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(0, 0, CARD_W, CARD_H, 28);
  ctx.fill();

  // Violet top accent strip.
  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.roundRect(2, 0, CARD_W - 6, 15, [28, 28, 0, 0]);
  ctx.fill();

  // QR code.
  ctx.drawImage(img, PAD, PAD, QR_SIZE, QR_SIZE);

  // Wordmark: violet chip + "Trimly".
  const wordY = PAD + QR_SIZE + 78;
  ctx.fillStyle = "#171717";
  ctx.font = '700 42px ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif';
  const wordWidth = ctx.measureText("Trimly").width;
  const chipSize = 40;
  const gap = 16;
  const groupW = chipSize + gap + wordWidth;
  const startX = (CARD_W - groupW) / 2;

  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.roundRect(startX, wordY - chipSize / 1.2, chipSize, chipSize, 12);
  ctx.fill();
  // White chain-link dot inside the chip.
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(startX + chipSize / 2, wordY - 12, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#171717";
  ctx.textAlign = "left";
  ctx.fillText("Trimly", startX + chipSize + gap, wordY);

  // Target URL caption.
  ctx.textAlign = "center";
  ctx.font = '500 24px ui-monospace, "Cascadia Mono", "Courier New", monospace';
  ctx.fillStyle = "#737373";
  ctx.fillText(truncateForDisplay(target), CARD_W / 2, wordY + 52);

  return {
    simpleQr: qrDataUrl,
    brandedQr: canvas.toDataURL("image/png"),
  };
}
