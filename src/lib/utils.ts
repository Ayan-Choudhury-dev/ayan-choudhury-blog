import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fs from "node:fs";
import path from "node:path";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html?.replace(/<[^>]+>/g, "") || "";
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString("default", { month: "short" });
  const startYear = startDate.getFullYear().toString();
  let endMonth;
  let endYear;

  if (endDate) {
    if (typeof endDate === "string") {
      endMonth = "";
      endYear = endDate;
    } else {
      endMonth = endDate.toLocaleString("default", { month: "short" });
      endYear = endDate.getFullYear().toString();
    }
  }

  return `${startMonth}${startYear} - ${endMonth}${endYear}`;
}

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

export function convertUrl(url: string) {
  // Remove trailing slash if present
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  // Split the URL by '/' and take the first part
  const parts = url.split("/");
  const base = parts[0];

  // Return the base part with a trailing slash
  return `${base}/`;
}
