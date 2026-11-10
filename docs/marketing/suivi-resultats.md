# Suivi des résultats et itération

Aucune donnée n'est encore relevée : **tous les tableaux sont à remplir** à partir d'App Store Connect (Analytics) et des plateformes de publication. Ne rien estimer ni inventer.

## 1. Sources (gratuites)
- **App Store Connect → Analytics** : impressions, vues de la page produit, téléchargements, taux de conversion, sources (recherche, navigation, référents web, campagnes).
- **Avis et notes** : App Store Connect → Notes et avis (par pays).
- **Statistiques natives** des réseaux (portée, clics) — saisies à la main.
- **Liens de campagne** : un paramètre de campagne par canal sur le lien App Store (ex. `reddit-fr`, `bluesky`, `vitrine`), pour attribuer les vues de page produit sans traceur tiers. Nommage à fixer avec 10k-steps.dev.

## 2. Tableau de bord hebdomadaire (à remplir chaque lundi)
| Semaine | Impressions | Vues page produit | Téléchargements | Conversion (téléch./vues) | Nouvelles notes (n, moyenne) | Posts publiés | Notes |
|---|---|---|---|---|---|---|---|
| Base (avant 16/11) | | | | | | 0 | |
| S1 | | | | | | | |
| S2 | | | | | | | |

## 3. Suivi par canal
| Canal | Publications | Clics/vues page produit (campagne) | Téléchargements attribués | Retours qualitatifs |
|---|---|---|---|---|
| Recherche App Store | — | | | |
| Page vitrine | — | | | |
| Bluesky / Mastodon / X / Threads | | | | |
| LinkedIn | | | | |
| Vidéo courte | | | | |
| Communautés | | | | |
| Presse/créateurs | | | | |

## 4. Règles d'itération
1. **Un seul changement ASO à la fois** (sous-titre, mots-clés, captures, texte promo), puis attendre ~2 semaines avant de juger, en comparant impressions, vues de page produit et conversion.
2. **Un contenu qui marche = le refaire** : relever le format/l'accroche des 2 meilleurs posts toutes les 2 semaines et en produire une variation.
3. **Un canal sans retour après 4 semaines** : réduire l'effort, pas l'abandonner sans décision de David.
4. **Les avis et retours** nourrissent la fiche et les contenus (sans citer un avis sans l'accord de son auteur) ; les demandes de fonctionnalités sont transmises à 10k-steps.dev via David.
5. **Rapport** toutes les 2 semaines à David : ce qui a été publié, chiffres relevés, 2–3 propositions.

## 5. Questions de décision (à poser une fois la base relevée)
- Les impressions sont-elles le goulot (peu visible) ou la conversion (visible mais non téléchargée) ? → ASO mots-clés/sous-titre vs captures/icône.
- Quels canaux amènent des vues de page produit mesurables ?
- Le pic « bilan annuel / résolutions » amène-t-il un effet visible ? → à reproduire l'an prochain.

## 6. Journal des changements
| Date | Changement (fiche, contenu, canal) | Hypothèse | Résultat à J+14 |
|---|---|---|---|
| | | | |

## 7. SEO — site walkever.app (agent SEO)
Rapport hebdomadaire à David chaque lundi. Sources : Google Search Console, Bing Webmaster (dès vérification), App Store Connect (Référents web, campagnes `ct=site-*`).

| Semaine | Pages indexées | Impressions GSC | Clics GSC | Position moy. | Clics App Store (ct=site-*) | Téléch. référents web | Changements |
|---|---|---|---|---|---|---|---|
| S0 (10 nov) | 0 (site inconnu de Google) ; 10 découvertes via sitemap | GSC branchée le 10/11 | 0 | — | non mesuré (pt manquant) | non relevé | Audit + 6 pages + technique (voir seo-audit.md) |
| S1 (11–17 nov) | | | | | | | P1 comparaison app FR/EN · corrections M1–M8 H1–H2 |
| S2 (18–24 nov) | | | | | | | P2 moyenne de pas FR/EN · WebP (H3) |
| S3 (25 nov–1 déc) | | | | | | | P3 défi janvier FR/EN |
| S4 (2–8 déc) | | | | | | | P4 objectif annuel FR/EN |
| S5 (9–15 déc) | | | | | | | Màj llms.txt · 1er relevé GSC significatif |
| S6–S7 (16–29 déc) | | | | | | | Contenu saisonnier bilan 2026 |

### KPIs SEO cibles (à 3 mois)

| Métrique | Cible J+30 | Cible J+90 | Source |
|---|---|---|---|
| Pages indexées | ≥ 8 | ≥ 14 | GSC → Index |
| Impressions/sem | > 100 | > 1 000 | GSC |
| Clics/sem | > 5 | > 50 | GSC |
| Position moy. sur requêtes outil | < 30 | < 15 | GSC |
| Clics App Store `ct=site-*`/sem | mesurable (pt= résolu) | > 5 | App Store Connect |
| Téléchargements référents web/mois | 1er relevé | > 10 | App Store Connect |

### Requêtes GSC à surveiller en priorité

Les requêtes suivantes sont les plus susceptibles d'apparaître en premier (longue traîne, peu concurrencées) :

| Requête | Page cible | Action si position > 20 |
|---|---|---|
| calculateur objectif pas mensuel | `/fr/calculateur-objectif-pas/` | Enrichir FAQ + H1 |
| step goal calculator monthly | `/en/step-goal-calculator/` | Enrichir FAQ + H1 |
| 10000 pas en calories | `/fr/10000-pas-en-km/` | Ajouter section dédiée |
| meilleure application podometre iphone sans pub | `/fr/meilleure-application-podometre-iphone/` | Vérifier titre/H1 |
| january step challenge calculator | `/en/january-step-challenge/` | Vérifier indexation (délai possible) |
