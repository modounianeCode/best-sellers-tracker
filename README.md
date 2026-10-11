# 📌 Best-Sellers Tracker

[![CI](https://github.com/modounianeCode/best-sellers-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/modounianeCode/best-sellers-tracker/actions/workflows/ci.yml)

Dashboard web Next.js qui récupère les produits les plus vendus sur **Amazon + AliExpress**.

## 🚀 Démarrage

```bash
cd ~/projects/best-sellers-tracker
pnpm install
cp .env.example .env.local
pnpm fetch   # récupère les best-sellers (mock sans clés API)
pnpm dev     # http://localhost:3000
```

## ✅ Données récupérées

📌 Nom, prix, image, lien, rang + avis, notes, vendeur, évolution prix.

## ⚠️ Sources de données réelles

- **AliExpress (câblé ✅)** : Affiliate API sur `open.aliexpress.com`, méthode
  `aliexpress.affiliate.hotproduct.query` (top ventes réelles : prix, photo,
  taux positifs → note /5, volume 30j, lien affilié).
  1. Compte AliExpress → `portals.aliexpress.com` → crée un **Tracking ID**
  2. `open.aliexpress.com` → compte développeur → App Management → Create App
     (type « Affiliate API », validation ~2 j ouvrés)
  3. Si `hotproduct.query` répond vide : demande l'autorisation « Hot Products »
     pour ton app dans la console
  4. `cp .env.example .env.local`, renseigne `ALIEXPRESS_APP_KEY`,
     `ALIEXPRESS_APP_SECRET`, `ALIEXPRESS_TRACKING_ID`, puis `pnpm fetch`
  5. Quota gratuit : 5 000 requêtes/jour. Sans clés → mocks automatiques.
- **Amazon** : Product Advertising API dépréciée au profit de la Creators API
  (compte Partenaires + ventes qualifiantes requises).
  Alternative rapide : SerpAPI / Rainforest API.

## 🚀 Automatisation

- `pnpm fetch` → `GET /api/best-sellers` → sauve `data/best-sellers.json`
- Cron exemple (quotidien 6h) : `0 6 * * * cd ~/projects/best-sellers-tracker && pnpm fetch`
- Évolution prévue : Neon + Drizzle pour historiser les prix.

## 🧪 Vérification

```bash
pnpm typecheck
pnpm test
```
