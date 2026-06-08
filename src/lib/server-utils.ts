import fs from "node:fs";
import path from "node:path";

const IMAGE_SIZE_LIMIT = 4 * 1024 * 1024; // 4MB

export function shouldOptimizeImage(src: string): boolean {
  const lower = src.toLowerCase();
  if (lower.endsWith(".gif") || lower.endsWith(".webp")) return false;

  try {
    let filePath = "";
    if (src.startsWith("/@fs")) {
      filePath = src.replace("/@fs", "").split("?")[0];
    } else if (src.startsWith("/") && !src.startsWith("http")) {
      filePath = path.join(process.cwd(), src.split("?")[0]);
    }
    if (filePath && fs.existsSync(filePath)) {
      return fs.statSync(filePath).size < IMAGE_SIZE_LIMIT;
    }
  } catch {
    // fall through to default
  }

  return true;
}
