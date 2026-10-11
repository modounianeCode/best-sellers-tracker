import type { Product } from "./types";

// ⚠️ Amazon bloque le scraping direct (Captcha / 403).
// Voie officielle : Product Advertising API 5.0 (PA-API).
// https://webservices.amazon.com/paapi5/documentation/
// Sans clés, on retourne un mock pour que le dashboard fonctionne.

function stamp<T extends Omit<Product, "fetchedAt">>(p: T): Product {
  return { ...p, fetchedAt: new Date().toISOString() };
}

const MOCK_AMAZON: Product[] = [
  stamp({
    id: "amz-1",
    source: "amazon",
    rank: 1,
    title: "Écouteurs Bluetooth 5.3 à réduction de bruit",
    price: 29.99,
    currency: "EUR",
    image: "/products/amz-1.svg",
    url: "https://www.amazon.fr/s?k=%C3%A9couteurs+bluetooth+r%C3%A9duction+bruit",
    rating: 4.6,
    reviewsCount: 128431,
    seller: "SoundCore-like",
    category: "Électronique",
    priceHistory: [
      { date: "2026-05-11", price: 39.99 },
      { date: "2026-06-11", price: 37.99 },
      { date: "2026-07-11", price: 35.99 },
      { date: "2026-08-11", price: 34.49 },
      { date: "2026-09-26", price: 32.99 },
      { date: "2026-10-11", price: 29.99 },
    ],
  }),
  stamp({
    id: "amz-2",
    source: "amazon",
    rank: 2,
    title: "Aspirateur robot intelligent 4000Pa avec cartographie laser",
    price: 189.0,
    currency: "EUR",
    image: "/products/amz-2.svg",
    url: "https://www.amazon.fr/s?k=aspirateur+robot",
    rating: 4.4,
    reviewsCount: 45210,
    seller: "RoboClean",
    category: "Maison",
    priceHistory: [
      { date: "2026-05-11", price: 249.0 },
      { date: "2026-06-11", price: 239.0 },
      { date: "2026-07-11", price: 229.0 },
      { date: "2026-08-11", price: 219.0 },
      { date: "2026-09-26", price: 199.0 },
      { date: "2026-10-11", price: 189.0 },
    ],
  }),
  stamp({
    id: "amz-3",
    source: "amazon",
    rank: 3,
    title: "Friteuse sans huile Airfryer 5,5L double panier",
    price: 89.99,
    currency: "EUR",
    image: "/products/amz-3.svg",
    url: "https://www.amazon.fr/s?k=airfryer",
    rating: 4.7,
    reviewsCount: 98420,
    seller: "CrispyHome",
    category: "Cuisine",
    priceHistory: [
      { date: "2026-05-11", price: 129.99 },
      { date: "2026-06-11", price: 119.99 },
      { date: "2026-07-11", price: 109.99 },
      { date: "2026-08-11", price: 99.99 },
      { date: "2026-09-26", price: 94.99 },
      { date: "2026-10-11", price: 89.99 },
    ],
  }),
  stamp({
    id: "amz-4",
    source: "amazon",
    rank: 4,
    title: "Clavier mécanique gaming RGB switches silencieux",
    price: 54.9,
    currency: "EUR",
    image: "/products/amz-4.svg",
    url: "https://www.amazon.fr/s?k=clavier+m%C3%A9canique+gaming",
    rating: 4.5,
    reviewsCount: 23118,
    seller: "KeyForge",
    category: "Électronique",
    priceHistory: [
      { date: "2026-05-11", price: 69.9 },
      { date: "2026-06-11", price: 64.9 },
      { date: "2026-07-11", price: 62.9 },
      { date: "2026-08-11", price: 59.9 },
      { date: "2026-09-26", price: 57.9 },
      { date: "2026-10-11", price: 54.9 },
    ],
  }),
  stamp({
    id: "amz-5",
    source: "amazon",
    rank: 5,
    title: "Tapis de yoga antidérapant 6mm avec sangle",
    price: 24.95,
    currency: "EUR",
    image: "/products/amz-5.svg",
    url: "https://www.amazon.fr/s?k=tapis+yoga+antid%C3%A9rapant",
    rating: 4.6,
    reviewsCount: 31277,
    seller: "ZenFit",
    category: "Sport",
    priceHistory: [
      { date: "2026-05-11", price: 29.95 },
      { date: "2026-06-11", price: 29.95 },
      { date: "2026-07-11", price: 27.95 },
      { date: "2026-08-11", price: 26.95 },
      { date: "2026-09-26", price: 25.95 },
      { date: "2026-10-11", price: 24.95 },
    ],
  }),
  stamp({
    id: "amz-6",
    source: "amazon",
    rank: 6,
    title: "Gourde isotherme inox 1L garde froid 24h",
    price: 19.99,
    currency: "EUR",
    image: "/products/amz-6.svg",
    url: "https://www.amazon.fr/s?k=gourde+isotherme+inox",
    rating: 4.8,
    reviewsCount: 67102,
    seller: "HydroSteel",
    category: "Sport",
    priceHistory: [
      { date: "2026-05-11", price: 24.99 },
      { date: "2026-06-11", price: 23.99 },
      { date: "2026-07-11", price: 22.99 },
      { date: "2026-08-11", price: 21.99 },
      { date: "2026-09-26", price: 20.99 },
      { date: "2026-10-11", price: 19.99 },
    ],
  }),
  stamp({
    id: "amz-7",
    source: "amazon",
    rank: 7,
    title: "Lampadaire LED dimmable avec télécommande et 3 températures",
    price: 45.99,
    currency: "EUR",
    image: "/products/amz-7.svg",
    url: "https://www.amazon.fr/s?k=lampadaire+led+dimmable",
    rating: 4.3,
    reviewsCount: 8940,
    seller: "LumaHome",
    category: "Maison",
    priceHistory: [
      { date: "2026-05-11", price: 59.99 },
      { date: "2026-06-11", price: 55.99 },
      { date: "2026-07-11", price: 52.99 },
      { date: "2026-08-11", price: 49.99 },
      { date: "2026-09-26", price: 47.99 },
      { date: "2026-10-11", price: 45.99 },
    ],
  }),
  stamp({
    id: "amz-8",
    source: "amazon",
    rank: 8,
    title: "Cafetière espresso 19 bars avec mousseur à lait",
    price: 139.0,
    currency: "EUR",
    image: "/products/amz-8.svg",
    url: "https://www.amazon.fr/s?k=cafeti%C3%A8re+espresso",
    rating: 4.5,
    reviewsCount: 18764,
    seller: "BaristaPro",
    category: "Cuisine",
    priceHistory: [
      { date: "2026-05-11", price: 179.0 },
      { date: "2026-06-11", price: 169.0 },
      { date: "2026-07-11", price: 159.0 },
      { date: "2026-08-11", price: 149.0 },
      { date: "2026-09-26", price: 145.0 },
      { date: "2026-10-11", price: 139.0 },
    ],
  }),
  stamp({
    id: "amz-9",
    source: "amazon",
    rank: 9,
    title: "Valise cabine rigide 55cm 4 roulettes TSA",
    price: 64.99,
    currency: "EUR",
    image: "/products/amz-9.svg",
    url: "https://www.amazon.fr/s?k=valise+cabine+rigide",
    rating: 4.4,
    reviewsCount: 12533,
    seller: "TravelLite",
    category: "Mode",
    priceHistory: [
      { date: "2026-05-11", price: 89.99 },
      { date: "2026-06-11", price: 84.99 },
      { date: "2026-07-11", price: 79.99 },
      { date: "2026-08-11", price: 74.99 },
      { date: "2026-09-26", price: 69.99 },
      { date: "2026-10-11", price: 64.99 },
    ],
  }),
  stamp({
    id: "amz-10",
    source: "amazon",
    rank: 10,
    title: "Drone 4K pliable avec double batterie et suivi GPS",
    price: 119.99,
    currency: "EUR",
    image: "/products/amz-10.svg",
    url: "https://www.amazon.fr/s?k=drone+4k+gps",
    rating: 4.2,
    reviewsCount: 7421,
    seller: "SkyHawk",
    category: "Électronique",
    priceHistory: [
      { date: "2026-05-11", price: 159.99 },
      { date: "2026-06-11", price: 149.99 },
      { date: "2026-07-11", price: 139.99 },
      { date: "2026-08-11", price: 129.99 },
      { date: "2026-09-26", price: 124.99 },
      { date: "2026-10-11", price: 119.99 },
    ],
  }),
];

export async function fetchAmazonBestSellers(): Promise<Product[]> {
  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY;
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;

  if (!accessKey || !secretKey || !partnerTag) {
    console.warn("[amazon] clés PA-API absentes → mock (10 produits)");
    return MOCK_AMAZON;
  }

  // TODO: signer la requête SigV4 vers https://webservices.amazon.com/paapi5/getitems
  // et mapper la réponse vers Product. Voir docs PA-API 5.0.
  console.warn("[amazon] client PA-API non câblé → mock temporaire");
  return MOCK_AMAZON;
}
