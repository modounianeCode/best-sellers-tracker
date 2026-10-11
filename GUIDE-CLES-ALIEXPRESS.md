# 📌 Guide — Activer les top ventes réelles AliExpress

Objectif : remplacer les mocks par les **vraies top ventes** (`hotproduct.query`)
avec photos, prix EUR, volumes 30j et **liens affiliés** (commissions).

Coût : **0 €** — Quota gratuit : **5 000 requêtes/jour** (1 `pnpm fetch` = ~1 requête).

---

## 🚀 Étape A — Tracking ID sur Portals (~5 min, immédiat)

1. 📌 Crée un compte sur `https://aliexpress.com` si tu n'en as pas.
2. 📌 Connecte-toi sur `https://portals.aliexpress.com` (tableau affilié).
3. 📌 Remplis le formulaire honnêtement : comment tu vas promouvoir les produits
   (ex. « site comparateur de top ventes » + ton URL si tu en as une).
4. 📌 Va dans **Ad Center** → crée un **Tracking ID** (ex. `best-sellers`).
5. ✅ Note le Tracking ID : c'est lui qui rattache les commissions à ton compte.

## 🚀 Étape B — App Key + App Secret sur Open Platform (~2 j ouvrés)

1. 📌 Connecte-toi sur `https://open.aliexpress.com` avec ton compte AliExpress.
2. 📌 Active le **compte développeur**.
3. 📌 Onglet **App Management** → **Create App**.
4. 📌 Choisis le type **« Affiliate API »** → **Click to Apply**.
5. 📌 Remplis avec des infos réelles (si « Business license » demandé :
   pièce d'identité ou justificatif auto-entrepreneur).
6. 📌 Envoie et attends l'email (~2 j ouvrés).
   Silence après 4 jours → relance via `https://console.aliexpress.com/support`.
7. 📌 Retourne dans **App Management** → **Create App**
   (le bouton a remplacé « Click to Apply »).
8. 📌 Nom générique conseillé : `Affiliate websites`
   (une seule app suffit pour tous tes sites).
9. 📌 Clique **Management** → note **App Key**, clique **View** → note **App Secret**.
10. ⚠️ Vérifie que ton app possède l'autorisation **« Hot Products »**,
    sinon l'appel répondra vide (voir dépannage).

> Les pages sont en anglais (parfois chinois) : utilise la traduction
> automatique du navigateur.

## 🚀 Étape C — Brancher les clés au projet (2 min)

```bash
cd ~/projects/best-sellers-tracker
cp .env.example .env.local
```

📌 Renseigne dans `.env.local` :

```env
ALIEXPRESS_APP_KEY=colle_ta_clé_ici
ALIEXPRESS_APP_SECRET=colle_ton_secret_ici
ALIEXPRESS_TRACKING_ID=colle_ton_tracking_id_ici
```

📌 Lance la récupération :

```bash
pnpm fetch
```

✅ Succès si tu vois :

```text
[aliexpress] 10 top ventes réelles récupérées
```

❌ Tant que tu vois `[aliexpress] clés absentes → mock`, les clés ne sont
pas prises en compte (vérifie `.env.local`, pas `.env.example`).

📌 Visualise ensuite avec :

```bash
pnpm dev
# http://localhost:3000 puis une fiche /produit/ali-<id>
```

## ✅ Checklist

- [ ] Compte AliExpress créé
- [ ] Tracking ID créé sur Portals
- [ ] Demande « Affiliate API » envoyée sur Open Platform
- [ ] Email de validation reçu
- [ ] App créée, App Key + App Secret notés
- [ ] Autorisation « Hot Products » vérifiée
- [ ] `.env.local` rempli (jamais commité !)
- [ ] `pnpm fetch` affiche « top ventes réelles récupérées »
- [ ] Dashboard affiche les vrais produits + badge 🔥 ventes

## ⚠️ Dépannage

| Message                       | Cause probable                          | Action                                                |
| ----------------------------- | --------------------------------------- | ----------------------------------------------------- |
| `clés absentes → mock`        | `.env.local` manquant ou vide           | Vérifie le fichier et les noms de variables           |
| `Réponse vide` / 0 produit    | Autorisation « Hot Products » manquante | Demande-la dans la console Open Platform              |
| `HTTP 4xx` + message sign     | Horloge machine décalée                 | Resynchronise l'heure système (NTP)                   |
| Produit introuvable via l'API | Produit sans commission                 | Normal : seuls les produits à commission sont exposés |
| `API en échec → mock`         | Réseau / passerelle                     | Réessaie ; le dashboard reste fonctionnel en mock     |

## ❓ Besoin d'aide ?

Note l'étape exacte où tu bloques + le message affiché par `pnpm fetch`,
et on débloque ça ensemble.
