import Image from "next/image";
import Link from "next/link";
import { fetchAllBestSellers, loadResult } from "@/lib/store";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { source?: string; q?: string; sort?: string };

const SOURCE_STYLE: Record<string, string> = {
  amazon: "bg-[#FF9900] text-slate-950",
  aliexpress: "bg-[#E62E04] text-white",
};

function formatReviews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k`;
  return n.toLocaleString("fr-FR");
}

function discount(p: Product): number {
  const first = p.priceHistory[0]?.price ?? p.price;
  if (first <= 0 || first <= p.price) return 0;
  return Math.round(((first - p.price) / first) * 100);
}

function oldPrice(p: Product): number | null {
  const first = p.priceHistory[0]?.price;
  return first && first > p.price ? first : null;
}

function stars(rating: number): string {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function applyFilters(products: Product[], { source, q, sort }: Params): Product[] {
  const query = (q ?? "").trim().toLowerCase();
  let list = products.filter((p) => {
    const okSource = !source || source === "all" ? true : p.source === source;
    const okQuery =
      !query ||
      `${p.title} ${p.seller} ${p.category}`.toLowerCase().includes(query);
    return okSource && okQuery;
  });
  switch (sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list = [...list].sort((a, b) => b.rating - a.rating);
      break;
    case "reviews":
      list = [...list].sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
    case "discount":
      list = [...list].sort((a, b) => discount(b) - discount(a));
      break;
  }
  return list;
}

function Sparkline({ p }: { p: Product }) {
  const max = Math.max(...p.priceHistory.map((h) => h.price));
  const min = Math.min(...p.priceHistory.map((h) => h.price));
  const span = Math.max(max - min, 0.01);
  return (
    <div className="flex h-9 items-end gap-1" aria-hidden="true">
      {p.priceHistory.map((h, i) => {
        const height = 30 + Math.round(((max - h.price) / span) * 70);
        const last = i === p.priceHistory.length - 1;
        return (
          <div
            key={`${h.date}-${i}`}
            title={`${h.date} : ${h.price.toFixed(2)} €`}
            style={{ height: `${Math.min(height, 100)}%` }}
            className={`w-full rounded-sm ${last ? "bg-emerald-500" : "bg-slate-300"}`}
          />
        );
      })}
    </div>
  );
}

function ProductCard({ p, rank }: { p: Product; rank: number }) {
  const pct = discount(p);
  const old = oldPrice(p);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)]">
      <div className="relative">
        <Link href={`/produit/${p.id}`} aria-label={`Détail : ${p.title}`}>
          <Image
            src={p.image}
            alt={p.title}
            width={640}
            height={400}
            className="aspect-[8/5] w-full object-cover"
          />
        </Link>
        <span className="absolute left-3 top-3 rounded-full bg-slate-950/90 px-2.5 py-1 text-xs font-bold text-white">
          #{rank}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${SOURCE_STYLE[p.source] ?? "bg-slate-200"}`}
        >
          {p.source === "amazon" ? "Amazon" : "AliExpress"}
        </span>
        {pct > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
            −{pct} %
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-slate-500">
          {p.category} · {p.seller}
        </p>
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">
          <Link href={`/produit/${p.id}`} className="hover:underline">
            {p.title}
          </Link>
        </h3>
        <p className="text-sm text-amber-500" aria-label={`Note ${p.rating} sur 5`}>
          <span aria-hidden="true">{stars(p.rating)}</span>{" "}
          <span className="font-semibold text-slate-800">{p.rating.toFixed(1)}</span>{" "}
          {p.reviewsCount > 0 && (
            <span className="text-slate-500">({formatReviews(p.reviewsCount)} avis)</span>
          )}
          {(p.salesVolume ?? 0) > 0 && (
            <span className="ml-1 font-semibold text-emerald-600">
              🔥 {formatReviews(p.salesVolume ?? 0)} ventes
            </span>
          )}
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-extrabold tracking-tight">
            {p.price.toFixed(2)} {p.currency}
          </span>
          {old && (
            <span className="text-sm text-slate-400 line-through">
              {old.toFixed(2)} {p.currency}
            </span>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs text-slate-500">Évolution du prix</p>
          <Sparkline p={p} />
        </div>

        <div className="mt-2 flex gap-2">
          <Link
            href={`/produit/${p.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Fiche détail
          </Link>
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Voir l&apos;offre
          </a>
        </div>
      </div>
    </article>
  );
}

function PodiumCard({ p, medal }: { p: Product; medal: string }) {
  return (
    <Link
      href={`/produit/${p.id}`}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur transition hover:bg-white/[0.1]"
    >
      <span className="text-3xl" aria-hidden="true">
        {medal}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{p.title}</p>
        <p className="mt-0.5 text-xs text-slate-300">
          {p.source === "amazon" ? "Amazon" : "AliExpress"} · ⭐ {p.rating.toFixed(1)} ·{" "}
          {formatReviews(p.reviewsCount)} avis ·{" "}
          <span className="font-bold text-white">
            {p.price.toFixed(2)} {p.currency}
          </span>
          {discount(p) > 0 && (
            <span className="ml-1 font-bold text-emerald-300">−{discount(p)} %</span>
          )}
        </p>
      </div>
    </Link>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const source = params.source ?? "all";
  const q = params.q ?? "";
  const sort = params.sort ?? "";

  let data = await loadResult();
  if (!data) data = await fetchAllBestSellers();

  const filtered = applyFilters(data.products, { source, q, sort });
  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const totalReviews = data.products.reduce((s, p) => s + p.reviewsCount, 0);
  const avgRating =
    data.products.reduce((s, p) => s + p.rating, 0) /
    Math.max(data.products.length, 1);
  const bestDrop = Math.max(0, ...data.products.map(discount));
  const medals = ["🥇", "🥈", "🥉"];

  const tab = (key: string, label: string) => {
    const active = source === key;
    const href = `/?source=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}${sort ? `&sort=${sort}` : ""}`;
    return (
      <a
        key={key}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          active
            ? "bg-slate-950 text-white"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
        }`}
      >
        {label}
      </a>
    );
  };

  const sortLink = (key: string, label: string) => {
    const active = sort === key;
    const href = `/?source=${source}${q ? `&q=${encodeURIComponent(q)}` : ""}&sort=${key}`;
    return (
      <a
        key={key}
        href={href}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
          active
            ? "bg-amber-400 text-slate-950 ring-amber-400"
            : "bg-transparent text-slate-300 ring-white/20 hover:bg-white/10"
        }`}
      >
        {label}
      </a>
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      {/* En-tête radar */}
      <header className="overflow-hidden rounded-3xl bg-slate-950 text-white">
        <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Radar des ventes en direct
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Ce qui se vend vraiment sur Amazon et AliExpress
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Prix, avis, vendeurs et baisses repérées au même endroit pour
              détecter les produits gagnants avant les autres.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {sortLink("discount", "Plus fortes baisses")}
              {sortLink("reviews", "Plus avisées")}
              {sortLink("rating", "Mieux notées")}
              {sortLink("price-asc", "Prix croissant")}
              {sortLink("price-desc", "Prix décroissant")}
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Données actualisées le{" "}
              {new Date(data.updatedAt).toLocaleString("fr-FR")} ·{" "}
              {data.products.length} produits suivis
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/[0.07] p-3 text-center ring-1 ring-white/10">
                <p className="text-2xl font-extrabold">{data.products.length}</p>
                <p className="text-xs text-slate-300">produits</p>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3 text-center ring-1 ring-white/10">
                <p className="text-2xl font-extrabold">{avgRating.toFixed(1)}</p>
                <p className="text-xs text-slate-300">note moy.</p>
              </div>
              <div className="rounded-2xl bg-white/[0.07] p-3 text-center ring-1 ring-white/10">
                <p className="text-2xl font-extrabold">−{bestDrop}%</p>
                <p className="text-xs text-slate-300">max baisse</p>
              </div>
            </div>
            {podium.map((p, i) => (
              <PodiumCard key={p.id} p={p} medal={medals[i]} />
            ))}
            <p className="text-xs text-slate-400">
              {formatReviews(totalReviews)} avis cumulés analysés
            </p>
          </div>
        </div>
      </header>

      {/* Barre d'outils */}
      <div className="sticky top-2 z-10 mt-4 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tab("all", "Tout")}
            {tab("amazon", "Amazon")}
            {tab("aliexpress", "AliExpress")}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <form action="/" method="get" className="flex gap-2">
              <input type="hidden" name="source" value={source} />
              <input type="hidden" name="sort" value={sort} />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Rechercher un produit, vendeur…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-amber-400 sm:w-64"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Chercher
              </button>
            </form>
            <a
              href="/api/best-sellers"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Actualiser
            </a>
          </div>
        </div>
        {q && (
          <p className="mt-2 text-xs text-slate-500">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""} pour « {q} » ·{" "}
            <a href={`/?source=${source}${sort ? `&sort=${sort}` : ""}`} className="underline">
              effacer la recherche
            </a>
          </p>
        )}
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl">🔭</p>
          <h2 className="mt-3 text-lg font-bold">Rien dans le radar pour cette recherche</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Essaie un autre mot-clé ou reviens à l&apos;ensemble des produits suivis.
          </p>
          <a
            href="/"
            className="mt-4 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Tout afficher
          </a>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} p={p} rank={i + 1} />
          ))}
        </div>
      )}

      {rest.length === 0 && podium.length > 0 && filtered.length > 0 && (
        <p className="mt-6 text-center text-xs text-slate-400">
          Le podium ci-dessus reprend déjà tout le classement actuel.
        </p>
      )}

      <footer className="mt-10 flex flex-col items-center gap-1 text-center text-xs text-slate-400">
        <p>
          Sources : API Amazon PA-API 5.0 et AliExpress Affiliate — maquettes affichées sans
          clés API.
        </p>
        <p>Lien affilié possible sur « Voir l&apos;offre ».</p>
      </footer>
    </main>
  );
}
