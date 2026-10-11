import { promises as fs } from "node:fs";
import path from "node:path";
import { fetchAmazonBestSellers } from "./amazon";
import { fetchAliExpressBestSellers } from "./aliexpress";
import { FetchResultSchema, type FetchResult, type Product } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "best-sellers.json");

export function scoreProduct(p: Product): number {
  // Score simple : note pondérée par log(volume) + bonus baisse de prix.
  // Volume = max(avis, ventes 30j) car l'API Affiliate ne donne pas d'avis.
  const volume = Math.max(p.reviewsCount, p.salesVolume ?? 0);
  const [first, last] = [
    p.priceHistory[0]?.price ?? p.price,
    p.priceHistory[p.priceHistory.length - 1]?.price ?? p.price,
  ];
  const dropBonus = first > 0 ? Math.max(0, (first - last) / first) * 2 : 0;
  return p.rating * Math.log10(volume + 10) + dropBonus;
}

export function sortByRelevance(products: Product[]): Product[] {
  return [...products].sort((a, b) => scoreProduct(b) - scoreProduct(a));
}

export async function fetchAllBestSellers(): Promise<FetchResult> {
  const [amazon, ali] = await Promise.all([
    fetchAmazonBestSellers(),
    fetchAliExpressBestSellers(),
  ]);
  const fresh = sortByRelevance([...amazon, ...ali]);
  // Conserve l'historique des prix précédents (courbe réelle jour après jour)
  const previous = await loadResult();
  const oldById = new Map((previous?.products ?? []).map((p) => [p.id, p]));
  const today = new Date().toISOString().slice(0, 10);
  const products = fresh.map((p) => {
    const old = oldById.get(p.id);
    if (!old) return p;
    const history = [...old.priceHistory];
    const lastEntry = history[history.length - 1];
    if (!lastEntry || (lastEntry.date !== today && lastEntry.price !== p.price)) {
      history.push({ date: today, price: p.price });
    } else if (lastEntry.date === today) {
      lastEntry.price = p.price;
    }
    return { ...p, priceHistory: history.slice(-30) };
  });
  const result: FetchResult = {
    updatedAt: new Date().toISOString(),
    products,
  };
  return FetchResultSchema.parse(result);
}

export async function saveResult(result: FetchResult): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(result, null, 2), "utf-8");
}

export async function loadResult(): Promise<FetchResult | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return FetchResultSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function getProductById(id: string): Promise<{
  product: Product;
  all: Product[];
} | null> {
  let data = await loadResult();
  if (!data) data = await fetchAllBestSellers();
  const product = data.products.find((p) => p.id === id);
  if (!product) return null;
  return { product, all: data.products };
}

export function getSimilarProducts(
  product: Product,
  all: Product[],
  limit = 3,
): Product[] {
  const others = all.filter((p) => p.id !== product.id);
  const sameCategory = others.filter((p) => p.category === product.category);
  const sameSource = others.filter(
    (p) => p.category !== product.category && p.source === product.source,
  );
  const rest = others.filter(
    (p) => p.category !== product.category && p.source !== product.source,
  );
  return [...sameCategory, ...sameSource, ...rest].slice(0, limit);
}
