import { createHash } from "node:crypto";
import { FetchResultSchema, ProductSchema, type Product } from "./types";

// Client officiel AliExpress Open Platform (Affiliate API).
// Auth : signature MD5 — secret + concaténation clé+valeur triée + secret,
// hash MD5 hexadécimal en MAJUSCULES. Requête POST form-urlencoded.
// Docs : https://openservice.aliexpress.com/doc/doc.htm

const DEFAULT_GATEWAY = "https://api-sg.aliexpress.com/router/rest";

export function gateway(): string {
  return process.env.ALIEXPRESS_API_GATEWAY ?? DEFAULT_GATEWAY;
}

/** Timestamp attendu par la plateforme : "YYYY-MM-DD HH:mm:ss". */
export function apiTimestamp(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

export function signRequest(
  params: Record<string, string>,
  secret: string,
): string {
  const sorted = Object.keys(params)
    .filter((k) => k !== "sign")
    .sort();
  const concat = sorted.map((k) => `${k}${params[k]}`).join("");
  return createHash("md5")
    .update(`${secret}${concat}${secret}`, "utf8")
    .digest("hex")
    .toUpperCase();
}

async function callApi(
  method: string,
  business: Record<string, string>,
  appKey: string,
  appSecret: string,
): Promise<unknown> {
  const payload: Record<string, string> = {
    method,
    app_key: appKey,
    sign_method: "md5",
    timestamp: apiTimestamp(),
    format: "json",
    v: "2.0",
    ...business,
  };
  const body = new URLSearchParams({
    ...payload,
    sign: signRequest(payload, appSecret),
  });
  const res = await fetch(gateway(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body,
  });
  if (!res.ok) throw new Error(`AliExpress API HTTP ${res.status}`);
  return res.json();
}

function num(v: unknown): number {
  const n =
    typeof v === "string" ? parseFloat(v.replace(/[^0-9.]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** "96.5%" (taux d'avis positifs) → note /5. */
export function ratingFromEvaluateRate(rate: unknown): number {
  const m = /([\d.]+)/.exec(String(rate ?? ""));
  if (!m) return 0;
  const pct = Math.min(Math.max(parseFloat(m[1]), 0), 100);
  return Math.round((pct / 20) * 10) / 10;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function searchFallbackUrl(title: string): string {
  return `https://fr.aliexpress.com/wholesale?SearchText=${encodeURIComponent(title)}`;
}

/** Extrait la liste brute de produits malgré les variantes d'enveloppe. */
export function unwrapProducts(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  const root = (json ?? {}) as Record<string, unknown>;
  const candidates = [
    (root.aliexpress_affiliate_hotproduct_query_response as Record<string, unknown> | undefined)
      ?.resp_result,
    (root.aliexpress_affiliate_product_query_response as Record<string, unknown> | undefined)
      ?.resp_result,
    root.resp_result,
    root.result,
    root,
  ];
  for (const c of candidates) {
    const r = (c ?? {}) as Record<string, unknown>;
    const inner = (r.result ?? r) as Record<string, unknown>;
    const holder = (inner.products ?? inner) as Record<string, unknown>;
    const list = holder.product ?? holder.products;
    if (Array.isArray(list)) return list as Record<string, unknown>[];
    if (list && typeof list === "object") return [list as Record<string, unknown>];
  }
  return [];
}

export function mapApiItem(raw: Record<string, unknown>, rank: number): Product | null {
  const s = (k: string) => (raw[k] == null ? "" : String(raw[k]));
  const productId = s("product_id") || s("productId");
  const title = s("product_title") || s("productTitle");
  const price = num(
    raw.target_sale_price ?? raw.app_sale_price ?? raw.target_app_sale_price,
  );
  if (!productId || !title || price <= 0) return null;

  const image = s("product_main_image_url") || s("product_main_image");
  const promotion = s("promotion_link") || s("promotionLink");
  const detail = s("product_detail_url") || s("product_detailUrl");
  const url = promotion || detail || searchFallbackUrl(title);
  const currency =
    s("target_sale_price_currency") ||
    s("target_app_sale_price_currency") ||
    s("sale_price_currency") ||
    "EUR";

  const candidate: Product = {
    id: `ali-${productId}`,
    source: "aliexpress",
    rank,
    title,
    price,
    currency,
    image: image.startsWith("http") ? image : `/products/ali-generic.svg`,
    url,
    rating: ratingFromEvaluateRate(raw.evaluate_rate ?? raw.evaluateRate),
    reviewsCount: 0, // l'API Affiliate ne retourne pas de compteur d'avis
    salesVolume: Math.round(
      num(raw.lastest_volume ?? raw.lastestVolume ?? raw.sale_count ?? 0),
    ),
    seller:
      s("shop_title") || (s("shop_id") ? `Boutique ${s("shop_id")}` : "AliExpress"),
    category:
      s("second_level_category_name") ||
      s("first_level_category_name") ||
      "Tendance",
    priceHistory: [{ date: today(), price }],
    fetchedAt: new Date().toISOString(),
  };
  if (promotion.startsWith("http")) candidate.affiliateUrl = promotion;
  const parsed = ProductSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

/**
 * Top ventes réelles via aliexpress.affiliate.hotproduct.query.
 * ⚠️ Nécessite l'autorisation "Hot Products" sur l'app (console Open Platform).
 */
export async function fetchLiveHotProducts(
  appKey: string,
  appSecret: string,
  opts: { pageSize?: number; country?: string } = {},
): Promise<Product[]> {
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID;
  const business: Record<string, string> = {
    page_no: "1",
    page_size: String(opts.pageSize ?? 10),
    target_currency: "EUR",
    target_language: "FR",
    country: opts.country ?? process.env.ALIEXPRESS_COUNTRY ?? "FR",
  };
  if (trackingId) business.tracking_id = trackingId;

  const json = await callApi(
    "aliexpress.affiliate.hotproduct.query",
    business,
    appKey,
    appSecret,
  );
  const items = unwrapProducts(json);
  if (items.length === 0) {
    throw new Error(
      "Réponse vide — vérifie l'autorisation 'Hot Products' de ton app sur open.aliexpress.com",
    );
  }
  const products = items
    .map((raw, i) => mapApiItem(raw, i + 1))
    .filter((p): p is Product => p !== null);
  return FetchResultSchema.shape.products.parse(products);
}
