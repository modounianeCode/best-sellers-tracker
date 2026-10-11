import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  source: z.enum(["amazon", "aliexpress"]),
  rank: z.number(),
  title: z.string(),
  price: z.number(),
  currency: z.string().default("EUR"),
  image: z.string().url().or(z.string().startsWith("/")),
  url: z.string().url(),
  rating: z.number().min(0).max(5),
  reviewsCount: z.number().int().min(0),
  /** Volume de ventes 30j (renseigné par l'API AliExpress, absent = inconnu) */
  salesVolume: z.number().int().min(0).optional(),
  /** Lien affilié avec tracking (quand fourni par l'API) */
  affiliateUrl: z.string().url().optional(),
  seller: z.string(),
  category: z.string(),
  priceHistory: z.array(z.object({ date: z.string(), price: z.number() })),
  fetchedAt: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

export const FetchResultSchema = z.object({
  updatedAt: z.string(),
  products: z.array(ProductSchema),
});

export type FetchResult = z.infer<typeof FetchResultSchema>;
