# Roadmap SEO — Walkever

Mise à jour : 2026-11-10. Mesure du succès : impressions et clics Search Console → clics App Store (`ct=site-*`) → téléchargements « Référents web » dans App Store Connect.

## Fait (S0, 10 nov)
- [x] robots.txt, sitemap.xml, llms.txt
- [x] canonicals, hreflang et Open Graph absolus ; racine en noindex
- [x] JSON-LD MobileApplication, Organization, WebSite, FAQPage, Breadcrumb, Article
- [x] 6 pages : guide « combien de pas par jour », convertisseur pas ↔ km/miles, calculateur d'objectif mensuel (FR + EN)
- [x] maillage interne + liens App Store avec `ct` par emplacement

## Bloquant : besoin de David (une fois)
| # | Action | Pourquoi |
|---|---|---|
| ~~B1~~ | ✅ 10 nov : propriété Domaine `walkever.app` créée et validée (TXT DNS Vercel), sitemap lu (10 pages), indexation demandée pour les 8 pages | — |
| ~~B2~~ | ✅ inutile : relevés faits via le navigateur Timon (session Google de David) | — |
| B3 | Bing Webmaster Tools : connexion à faire par David (Get started → Se connecter avec Google → Importer depuis Search Console). En attendant, IndexNow couvre l'indexation Bing | Bing alimente ChatGPT Search et Copilot |
| B4 | Récupérer le `pt` (provider token) dans App Store Connect → Analytics → Liens de campagne | Pour que les `ct=site-*` soient comptés |

## Semaines 1–2 (11 → 24 nov)
- IndexNow (Bing/Yandex) : fichier clé + ping à chaque déploiement (gratuit, sans compte).
- Images : captures en WebP + `srcset`, `og:image` dédiée 1200×630 par langue.
- Page FR « Application podomètre iPhone gratuite sans pub » et EN « Free step counter app for iPhone, no ads » : page de comparaison honnête (Apple Santé seule vs Walkever vs podomètres classiques), sans dénigrer les concurrents.
- Guide « moyenne de pas par jour (par âge, femme, homme) » FR/EN, sourcé.
- Ajouter dans la fiche App Store (texte promo) un lien implicite vers le site (lien « Site web du développeur » dans App Store Connect = walkever.app).

## Semaines 3–6 (25 nov → 22 déc) : pic saisonnier
- Page « Défi 10 000 pas par jour en janvier » / « January step challenge » : plan sur 31 jours avec moyenne requise (outil réutilisé).
- Page « Bilan de l'année : combien de pas as-tu fait en 2026 ? » (calcul annuel, objectif annuel 3 650 000 pas).
- Calculateur « objectif annuel de pas » (même logique que le mensuel).
- Coordination avec 10k-steps.marketing : chaque post social renvoie vers un outil du site (contenu utile) plutôt que directement vers le store.

## Mois 2–3
- Pages par tranche d'âge si Search Console montre des impressions sur ces requêtes.
- Netlinking blanc : proposer les calculateurs à des sites qui citent déjà ce type d'outils (associations de marche, blogs santé, clubs de randonnée), **après validation de David** pour tout contact externe.
- Itérer titres et descriptions sur les pages avec impressions mais CTR < 2 %.

## Règles
- Une page = une intention réelle ; pas de pages quasi identiques par ville ou par chiffre.
- Toute affirmation santé est sourcée ; aucune promesse médicale.
- Aucune fonctionnalité citée qui n'existe pas dans l'app.
- Aucun script tiers ni analytics invasif.
