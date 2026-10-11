import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mapApiItem,
  ratingFromEvaluateRate,
  signRequest,
  unwrapProducts,
} from "./aliexpress-api";

describe("signRequest", () => {
  it("signe secret + concat trié + secret en MD5 majuscule", () => {
    const got = signRequest({ b: "2", a: "1", sign: "IGNORED" }, "s");
    const expected = createHash("md5")
      .update("sa1b2s", "utf8")
      .digest("hex")
      .toUpperCase();
    assert.equal(got, expected);
    assert.match(got, /^[A-F0-9]{32}$/);
  });

  it("est indépendant de l'ordre des paramètres", () => {
    assert.equal(
      signRequest({ z: "9", a: "1" }, "secret"),
      signRequest({ a: "1", z: "9" }, "secret"),
    );
  });
});

describe("ratingFromEvaluateRate", () => {
  it("convertit 96.5% en 4.8/5", () => {
    assert.equal(ratingFromEvaluateRate("96.5%"), 4.8);
  });

  it("retourne 0 sans taux", () => {
    assert.equal(ratingFromEvaluateRate(undefined), 0);
    assert.equal(ratingFromEvaluateRate(""), 0);
  });
});

describe("unwrapProducts", () => {
  it("extrait la liste depuis l'enveloppe hotproduct.query", () => {
    const json = {
      aliexpress_affiliate_hotproduct_query_response: {
        resp_result: {
          result: { products: { product: [{ product_id: "1" }] } },
        },
      },
    };
    assert.deepEqual(unwrapProducts(json), [{ product_id: "1" }]);
  });

  it("retourne [] sur réponse vide", () => {
    assert.deepEqual(unwrapProducts({}), []);
  });
});

describe("mapApiItem", () => {
  const raw = {
    product_id: 1005001234567890,
    product_title: "Montre connectée AMOLED",
    product_main_image_url: "https://ae-pic-a1.aliexpress-media.com/kf/IMG.jpg",
    target_sale_price: "19.49",
    target_sale_price_currency: "EUR",
    product_detail_url: "https://fr.aliexpress.com/item/1005001234567890.html",
    promotion_link: "https://s.click.aliexpress.com/e/TRACK123",
    evaluate_rate: "96.5%",
    lastest_volume: 12500,
    shop_id: 911234567,
    second_level_category_name: "Montres",
  };

  it("mappe un item API vers Product", () => {
    const p = mapApiItem(raw, 3);
    assert.ok(p);
    assert.equal(p?.id, "ali-1005001234567890");
    assert.equal(p?.source, "aliexpress");
    assert.equal(p?.rank, 3);
    assert.equal(p?.price, 19.49);
    assert.equal(p?.rating, 4.8);
    assert.equal(p?.salesVolume, 12500);
    assert.equal(p?.url, "https://s.click.aliexpress.com/e/TRACK123");
    assert.equal(p?.affiliateUrl, "https://s.click.aliexpress.com/e/TRACK123");
    assert.equal(p?.category, "Montres");
  });

  it("rejette un item sans prix valide", () => {
    assert.equal(mapApiItem({ product_id: "1", product_title: "X" }, 1), null);
  });
});
