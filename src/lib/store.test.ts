import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSimilarProducts, scoreProduct, sortByRelevance } from "./store";
import type { Product } from "./types";

function makeProduct(over: Partial<Product>): Product {
  return {
    id: "test-1",
    source: "amazon",
    rank: 1,
    title: "Produit test",
    price: 20,
    currency: "EUR",
    image: "/placeholder.svg",
    url: "https://example.com/p/1",
    rating: 4.5,
    reviewsCount: 1000,
    seller: "Vendeur",
    category: "Test",
    priceHistory: [{ date: "2026-10-11", price: 20 }],
    fetchedAt: new Date().toISOString(),
    ...over,
  };
}

describe("scoreProduct", () => {
  it("favorise les produits mieux notés et avec baisse de prix", () => {
    const base = makeProduct({ id: "a", rating: 4.0, reviewsCount: 100 });
    const boosted = makeProduct({
      id: "b",
      rating: 4.8,
      reviewsCount: 50000,
      priceHistory: [
        { date: "2026-09-11", price: 40 },
        { date: "2026-10-11", price: 20 },
      ],
    });
    assert.ok(scoreProduct(boosted) > scoreProduct(base));
  });
});

describe("sortByRelevance", () => {
  it("trie par score décroissant", () => {
    const low = makeProduct({ id: "low", rating: 3.0, reviewsCount: 5 });
    const high = makeProduct({ id: "high", rating: 5.0, reviewsCount: 90000 });
    const sorted = sortByRelevance([low, high]);
    assert.equal(sorted[0].id, "high");
  });
});

describe("getSimilarProducts", () => {
  it("privilégie la même catégorie puis la même source", () => {
    const current = makeProduct({
      id: "current",
      source: "amazon",
      category: "Cuisine",
    });
    const sameCat = makeProduct({
      id: "same-cat",
      source: "aliexpress",
      category: "Cuisine",
    });
    const sameSource = makeProduct({
      id: "same-source",
      source: "amazon",
      category: "Sport",
    });
    const other = makeProduct({
      id: "other",
      source: "aliexpress",
      category: "Mode",
    });
    const similar = getSimilarProducts(current, [current, other, sameSource, sameCat], 2);
    assert.deepEqual(
      similar.map((p) => p.id),
      ["same-cat", "same-source"],
    );
  });
});
