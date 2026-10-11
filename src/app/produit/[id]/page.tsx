import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchAllBestSellers,
  getSimilarProducts,
  loadResult,
} from "@/lib/store";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const data = (await loadResult()) ?? (await fetchAllBestSellers());
  return data.products.map((p) => ({ id: p.id }));
}

function discount(p: Product): number {
  const first = p.priceHistory[0]?.price ?? p.price;
  if (first <= 0 || first <= p.price) return 0;
  return Math.round(((first - p.price) / first) * 100);
}

function stats(p: Product) {
  const prices = p.priceHistory.map((h) => h.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    drop: Math.max(0, prices[0] - p.price),
    dropPct: discount(p),
  };
}

function PriceCurve({ p }: { p: Product }) {
  const W = 640;
  const H = 220;
  const PAD = 28;
  const prices = p.priceHistory.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(max - min, 0.01);
  const x = (i: number) =>
    PAD + (i * (W - PAD * 2)) / Math.max(prices.length - 1, 1);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const line = prices.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const area = `${line} L${x(prices.length - 1)},${H - PAD} L${x(0)},${H - PAD} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Courbe de prix de ${p.title}`}
      className="h-56 w-full"
    >
      <defs>
        <linearGradient id={`curve-${p.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10B981" stopOpacity="0.35" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={PAD}
          x2={W - PAD}
          y1={H * t}
          y2={H * t}
          stroke="#E2E8F0"
          strokeDasharray="4 4"
        />
      ))}
      <path d={area} fill={`url(#curve-${p.id})`} />
      <path d={line} fill="none" stroke="#059669" strokeWidth="3" strokeLinejoin="round" />
      {prices.map((v, i) => (
        <g key={`${p.id}-${i}`}>
          <circle cx={x(i)} cy={y(v)} r="5" fill="#059669" stroke="#fff" strokeWidth="2" />
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748B">
            {p.priceHistory[i].date.slice(5).replace("-", "/")}
          </text>
        </g>
      ))}
      <text x={W - PAD} y={y(max) - 8} textAnchor="end" fontSize="12" fontWeight="700" fill="#059669">
        {max.toFixed(2)} €
      </text>
      <text x={W - PAD} y={y(min) + 16} textAnchor="end" fontSize="12" fontWeight="700" fill="#059669">
        {min.toFixed(2)} €
      </text>
    </svg>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data = await loadResult();
  if (!data) data = await fetchAllBestSellers();
  const product = data.products.find((p) => p.id === id);
  if (!product) notFound();

  const s = stats(product);
  const similar = getSimilarProducts(product, data.products, 3);
  const verdict =
    s.dropPct >= 20
      ? "Bonne affaire : le prix a nettement baissé."
      : s.dropPct > 0
        ? "Prix en baisse douce, tendance favorable."
        : "Prix stable sur la période suivie.";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          Radar
        </Link>{" "}
        / {product.source === "amazon" ? "Amazon" : "AliExpress"} /{" "}
        <span className="font-semibold text-slate-800">{product.category}</span>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <Image
            src={product.image}
            alt={product.title}
            width={960}
            height={600}
            className="aspect-[8/5] w-full object-cover"
            priority
          />
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span
                className={`rounded-full px-2.5 py-1 ${product.source === "amazon" ? "bg-[#FF9900] text-slate-950" : "bg-[#E62E04] text-white"}`}
              >
                {product.source === "amazon" ? "Amazon" : "AliExpress"}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                Rang #{product.rank} · {product.category}
              </span>
              {s.dropPct > 0 && (
                <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-white">
                  −{s.dropPct} % depuis le début du suivi
                </span>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {product.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Vendu par {product.seller} · ⭐ {product.rating.toFixed(1)}
              {product.reviewsCount > 0 &&
                ` · ${product.reviewsCount.toLocaleString("fr-FR")} avis`}
              {(product.salesVolume ?? 0) > 0 &&
                ` · 🔥 ${(product.salesVolume ?? 0).toLocaleString("fr-FR")} ventes (30j)`}
            </p>

            <h2 className="mt-6 text-lg font-bold">Courbe de prix</h2>
            <p className="text-sm text-slate-500">{verdict}</p>
            <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <PriceCurve p={product} />
            </div>

            <h2 className="mt-6 text-lg font-bold">Historique détaillé</h2>
            <table className="mt-2 w-full overflow-hidden rounded-2xl text-sm">
              <thead>
                <tr className="bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-300">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Prix</th>
                  <th className="px-4 py-2">Évolution</th>
                </tr>
              </thead>
              <tbody>
                {product.priceHistory.map((h, i) => {
                  const prev = product.priceHistory[i - 1]?.price;
                  const delta = prev === undefined ? 0 : h.price - prev;
                  return (
                    <tr key={h.date} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                      <td className="px-4 py-2">
                        {new Date(h.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 font-bold">{h.price.toFixed(2)} €</td>
                      <td
                        className={`px-4 py-2 font-semibold ${delta < 0 ? "text-emerald-600" : delta > 0 ? "text-red-500" : "text-slate-400"}`}
                      >
                        {prev === undefined
                          ? "référence"
                          : `${delta > 0 ? "+" : ""}${delta.toFixed(2)} €`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-xs text-slate-400">Prix actuel</p>
            <p className="mt-1 text-4xl font-extrabold">
              {product.price.toFixed(2)} {product.currency}
            </p>
            {s.drop > 0 && (
              <p className="mt-1 text-sm text-emerald-300">
                Tu économises {s.drop.toFixed(2)} € par rapport au début du suivi.
              </p>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-white/10 p-2">
                <p className="text-base font-bold">{s.min.toFixed(2)} €</p>
                <p className="text-slate-300">plus bas</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2">
                <p className="text-base font-bold">{s.max.toFixed(2)} €</p>
                <p className="text-slate-300">plus haut</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2">
                <p className="text-base font-bold">{product.rating.toFixed(1)}/5</p>
                <p className="text-slate-300">note</p>
              </div>
            </div>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-xl bg-amber-400 px-4 py-3 text-center text-sm font-bold text-slate-950 hover:bg-amber-300"
            >
              Voir l&apos;offre sur {product.source === "amazon" ? "Amazon" : "AliExpress"}
            </a>
            <Link
              href="/"
              className="mt-2 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-slate-300 ring-1 ring-white/20 hover:bg-white/10"
            >
              Retour au radar
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold">Produits similaires</h2>
            <div className="mt-3 flex flex-col gap-3">
              {similar.map((p) => (
                <Link
                  key={p.id}
                  href={`/produit/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-2 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={120}
                    height={80}
                    className="h-14 w-20 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.category} · {p.price.toFixed(2)} {p.currency} · ⭐{" "}
                      {p.rating.toFixed(1)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
