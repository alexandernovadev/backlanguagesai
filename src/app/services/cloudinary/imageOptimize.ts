import sharp from "sharp";
import logger from "../../utils/logger";

/** Calidad WebP (1–100). Más alto = más peso, más fiel a la imagen original. */
const WEBP_QUALITY = 88;
const WEBP_EFFORT = 4;

/**
 * Misma resolución; recompresión a WebP. Si el resultado no pesa menos, se devuelve el original.
 */
export async function optimizeImageBuffer(buffer: Buffer): Promise<Buffer> {
  if (!buffer?.length) {
    return buffer;
  }
  try {
    const optimized = await sharp(buffer)
      .rotate()
      .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
      .toBuffer();

    if (optimized.length >= buffer.length) {
      return buffer;
    }

    return optimized;
  } catch (err) {
    logger.warn("optimizeImageBuffer: no se pudo optimizar, se usa original", {
      error: err instanceof Error ? err.message : err,
    });
    return buffer;
  }
}

export async function optimizeBase64ToBuffer(base64: string): Promise<Buffer> {
  const raw = base64.replace(/^data:image\/\w+;base64,/, "").trim();
  return optimizeImageBuffer(Buffer.from(raw, "base64"));
}
