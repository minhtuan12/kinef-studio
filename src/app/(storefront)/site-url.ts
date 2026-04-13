const FALLBACK_SITE_URL = "https://kinef-studio.vercel.app";

export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!envUrl) {
    return FALLBACK_SITE_URL;
  }

  try {
    return new URL(envUrl).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

