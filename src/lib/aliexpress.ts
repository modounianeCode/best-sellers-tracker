import type { Product } from "./types";
import { fetchLiveHotProducts } from "./aliexpress-api";

// ⚠️ AliExpress bloque le scraping direct.
// Voie officielle : AliExpress Affiliate API (open.aliexpress.com)
// + programme Portals (portals.aliexpress.com) pour le Tracking ID.
// Sans clés → mock. Avec clés → top ventes réelles.

function stamp<T extends Omit<Product, "fetchedAt">>(p: T): Product {
  return { ...p, fetchedAt: new Date().toISOString() };
}

const MOCK_ALI: Product[] = [
  stamp({
    id: "ali-1",
    source: "aliexpress",
    rank: 1,
    title: "Montre connectée AMOLED appels Bluetooth",
    price: 19.49,
    currency: "EUR",
    image: "/products/ali-1.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=montre+connect%C3%A9e+amoled",
    rating: 4.7,
    reviewsCount: 89312,
    seller: "WearFit Store",
    category: "Électronique",
    priceHistory: [
      { date: "2026-05-11", price: 29.99 },
      { date: "2026-06-11", price: 27.99 },
      { date: "2026-07-11", price: 24.99 },
      { date: "2026-08-11", price: 22.99 },
      { date: "2026-09-26", price: 21.99 },
      { date: "2026-10-11", price: 19.49 },
    ],
  }),
  stamp({
    id: "ali-2",
    source: "aliexpress",
    rank: 2,
    title: "Sac bandoulière anti-vol USB femme",
    price: 12.89,
    currency: "EUR",
    image: "/products/ali-2.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=sac+bandouli%C3%A8re+femme",
    rating: 4.5,
    reviewsCount: 31208,
    seller: "Fashion Bag Official",
    category: "Mode",
    priceHistory: [
      { date: "2026-05-11", price: 18.99 },
      { date: "2026-06-11", price: 16.99 },
      { date: "2026-07-11", price: 15.99 },
      { date: "2026-08-11", price: 14.49 },
      { date: "2026-09-26", price: 13.49 },
      { date: "2026-10-11", price: 12.89 },
    ],
  }),
  stamp({
    id: "ali-3",
    source: "aliexpress",
    rank: 3,
    title: "Mini projecteur portable 1080P WiFi pour home cinéma",
    price: 45.99,
    currency: "EUR",
    image: "/products/ali-3.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=mini+projecteur+1080p",
    rating: 4.4,
    reviewsCount: 21045,
    seller: "CineMini Store",
    category: "Électronique",
    priceHistory: [
      { date: "2026-05-11", price: 69.99 },
      { date: "2026-06-11", price: 64.99 },
      { date: "2026-07-11", price: 59.99 },
      { date: "2026-08-11", price: 52.99 },
      { date: "2026-09-26", price: 48.99 },
      { date: "2026-10-11", price: 45.99 },
    ],
  }),
  stamp({
    id: "ali-4",
    source: "aliexpress",
    rank: 4,
    title: "Brosse nettoyante visage électrique waterproof 3 modes",
    price: 8.79,
    currency: "EUR",
    image: "/products/ali-4.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=brosse+nettoyante+visage+%C3%A9lectrique",
    rating: 4.6,
    reviewsCount: 54230,
    seller: "GlowBeauty",
    category: "Beauté",
    priceHistory: [
      { date: "2026-05-11", price: 12.99 },
      { date: "2026-06-11", price: 11.99 },
      { date: "2026-07-11", price: 10.99 },
      { date: "2026-08-11", price: 9.99 },
      { date: "2026-09-26", price: 9.29 },
      { date: "2026-10-11", price: 8.79 },
    ],
  }),
  stamp({
    id: "ali-5",
    source: "aliexpress",
    rank: 5,
    title: "Ruban LED RGB 10m avec application et musique",
    price: 9.99,
    currency: "EUR",
    image: "/products/ali-5.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=ruban+led+rgb",
    rating: 4.5,
    reviewsCount: 78112,
    seller: "LightUp Official",
    category: "Maison",
    priceHistory: [
      { date: "2026-05-11", price: 15.99 },
      { date: "2026-06-11", price: 13.99 },
      { date: "2026-07-11", price: 12.49 },
      { date: "2026-08-11", price: 11.49 },
      { date: "2026-09-26", price: 10.49 },
      { date: "2026-10-11", price: 9.99 },
    ],
  }),
  stamp({
    id: "ali-6",
    source: "aliexpress",
    rank: 6,
    title: "Chaussures running légères respirantes unisexe",
    price: 22.39,
    currency: "EUR",
    image: "/products/ali-6.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=chaussures+running",
    rating: 4.3,
    reviewsCount: 18934,
    seller: "RunFast Store",
    category: "Sport",
    priceHistory: [
      { date: "2026-05-11", price: 32.99 },
      { date: "2026-06-11", price: 29.99 },
      { date: "2026-07-11", price: 27.99 },
      { date: "2026-08-11", price: 25.99 },
      { date: "2026-09-26", price: 23.99 },
      { date: "2026-10-11", price: 22.39 },
    ],
  }),
  stamp({
    id: "ali-7",
    source: "aliexpress",
    rank: 7,
    title: "Set 12 pinceaux maquillage professionnels manche bois",
    price: 6.49,
    currency: "EUR",
    image: "/products/ali-7.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=pinceaux+maquillage",
    rating: 4.7,
    reviewsCount: 41208,
    seller: "MakeupPro Official",
    category: "Beauté",
    priceHistory: [
      { date: "2026-05-11", price: 9.99 },
      { date: "2026-06-11", price: 8.99 },
      { date: "2026-07-11", price: 7.99 },
      { date: "2026-08-11", price: 7.29 },
      { date: "2026-09-26", price: 6.89 },
      { date: "2026-10-11", price: 6.49 },
    ],
  }),
  stamp({
    id: "ali-8",
    source: "aliexpress",
    rank: 8,
    title: "Humidificateur d'air silencieux 500ml avec veilleuse",
    price: 11.59,
    currency: "EUR",
    image: "/products/ali-8.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=humidificateur+air",
    rating: 4.4,
    reviewsCount: 15672,
    seller: "AromaHome",
    category: "Maison",
    priceHistory: [
      { date: "2026-05-11", price: 17.99 },
      { date: "2026-06-11", price: 15.99 },
      { date: "2026-07-11", price: 14.49 },
      { date: "2026-08-11", price: 13.29 },
      { date: "2026-09-26", price: 12.29 },
      { date: "2026-10-11", price: 11.59 },
    ],
  }),
  stamp({
    id: "ali-9",
    source: "aliexpress",
    rank: 9,
    title: "Pantalon cargo homme multi-poches coupe regular",
    price: 16.99,
    currency: "EUR",
    image: "/products/ali-9.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=pantalon+cargo+homme",
    rating: 4.2,
    reviewsCount: 9841,
    seller: "UrbanWear Store",
    category: "Mode",
    priceHistory: [
      { date: "2026-05-11", price: 24.99 },
      { date: "2026-06-11", price: 22.99 },
      { date: "2026-07-11", price: 20.99 },
      { date: "2026-08-11", price: 19.49 },
      { date: "2026-09-26", price: 17.99 },
      { date: "2026-10-11", price: 16.99 },
    ],
  }),
  stamp({
    id: "ali-10",
    source: "aliexpress",
    rank: 10,
    title: "Enceinte Bluetooth portable étanche basses profondes",
    price: 17.89,
    currency: "EUR",
    image: "/products/ali-10.svg",
    url: "https://fr.aliexpress.com/wholesale?SearchText=enceinte+bluetooth+portable",
    rating: 4.6,
    reviewsCount: 33547,
    seller: "BoomSound",
    category: "Électronique",
    priceHistory: [
      { date: "2026-05-11", price: 27.99 },
      { date: "2026-06-11", price: 25.49 },
      { date: "2026-07-11", price: 22.99 },
      { date: "2026-08-11", price: 20.99 },
      { date: "2026-09-26", price: 18.99 },
      { date: "2026-10-11", price: 17.89 },
    ],
  }),
];

export async function fetchAliExpressBestSellers(): Promise<Product[]> {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;

  if (!appKey || !appSecret) {
    console.warn("[aliexpress] clés absentes → mock (10 produits)");
    return MOCK_ALI;
  }

  // TODO: appeler /aliexpress.affiliate.hotproduct.query et mapper vers Product.
  try {
    const live = await fetchLiveHotProducts(appKey, appSecret, {
      pageSize: 10,
    });
    console.log(`[aliexpress] ${live.length} top ventes réelles récupérées`);
    return live;
  } catch (err) {
    console.warn(
      `[aliexpress] API en échec (${err instanceof Error ? err.message : err}) → mock`,
    );
    return MOCK_ALI;
  }
}
