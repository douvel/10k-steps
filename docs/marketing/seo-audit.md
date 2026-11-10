# Audit SEO — walkever.app

Date : 2026-11-10 · Auteur : agent SEO (10k-steps.seo)

## 1. Contexte
- Site statique (HTML/CSS/JS sans framework) dans `site/`, hébergé sur Vercel (équipe `bellasor`, projet `10k-steps`), `outputDirectory: site`, déployé avec la CLI (`vercel --prod` depuis la racine du repo). `walkever.app` redirige (308) vers `https://www.walkever.app/`.
- App : ID App Store 6762572011. **La fiche publiée s'appelle encore « Objectif 10K Pas » (v1.1.2, 1 note, 5★)** ; le renommage Walkever est dans `docs/store/` mais pas encore en ligne. Le site et la fiche ne portent donc pas le même nom : à lever dès la prochaine soumission.
- Aucune donnée Search Console ou Bing : le domaine n'est vérifié nulle part (aucun fichier ni balise de vérification).

## 2. État avant intervention (constats)
| Domaine | Constat | Gravité |
|---|---|---|
| Indexation | Pas de `robots.txt` ni de `sitemap.xml` (404) | Haute |
| Indexation | Domaine non déclaré à Google Search Console ni à Bing Webmaster | Haute |
| Canonicals / hreflang | hreflang en URLs relatives, aucune canonical sur /fr/ et /en/ ; la racine `/` redirige en JS avec une canonical relative | Moyenne |
| Contenu | **2 pages indexables seulement** (une accueil par langue) + confidentialité. Aucune page ne cible une recherche réelle (« combien de pas par jour », « 10000 pas en km », « step goal calculator ») | **Critique** |
| Données structurées | Aucune (ni SoftwareApplication/MobileApplication, ni Organization, ni FAQPage) | Moyenne |
| Open Graph | `og:image` relative (cassée sur la plupart des réseaux), pas de `og:url`, pas de Twitter card | Moyenne |
| Conversion | Liens App Store sans paramètre de campagne : impossible d'attribuer les téléchargements au site | Haute |
| Moteurs IA | Pas de `llms.txt`, peu de texte factuel à citer | Moyenne |
| Maillage | Aucun lien interne hors accueil ↔ confidentialité | Moyenne |
| Performance | Bonne base : HTML léger (~14 Ko), CSS 12 Ko, JS 3 Ko, aucun script tiers. Captures PNG de 80 à 220 Ko (WebP possible, gain modéré) | Basse |
| Accessibilité | Correcte (alt sur les captures, `prefers-reduced-motion` respecté). Contenu des sections masqué (`opacity:0`) tant que le JS ne l'a pas révélé : Google exécute le JS, risque faible | Basse |
| Smart App Banner | Présent (`apple-itunes-app`) | OK |

## 3. Concurrence (SERP et App Store)
- Les recherches informationnelles (« combien de pas par jour », « 10000 pas en km », « how many steps a day ») sont dominées par la presse santé (Doctissimo, Santé Magazine, Healthline, Mayo Clinic) et les calculateurs dédiés (omnicalculator, calculator.net). Pour un petit site neuf, la chance est sur la **longue traîne** (par âge, par taille, « moyenne requise », « objectif mensuel ») et sur des **outils interactifs** plus utiles que les articles.
- App Store US sur « step goal tracker » : beaucoup d'apps avec 0 à quelques notes (The Step, NextStep, WATCH10K) au milieu de grosses apps (Steps 19k notes, Pedometer++, ActivityTracker 100k). Notre angle « rythme mensuel / moyenne requise » n'est revendiqué par personne : c'est notre différenciation SEO et ASO.

## 4. Actions faites le 2026-11-10
- `robots.txt`, `sitemap.xml` (10 URLs avec alternates hreflang), `llms.txt` (fiche factuelle pour les moteurs IA).
- Canonicals et hreflang absolus sur toutes les pages ; racine `/` en `noindex,follow` (simple aiguillage de langue).
- JSON-LD : MobileApplication (avec `alternateName` « Objectif 10K Pas » pour relier l'ancien nom), Organization, WebSite, FAQPage sur les accueils ; Article/WebPage + BreadcrumbList + FAQPage sur les nouvelles pages.
- Open Graph absolu + Twitter card.
- FAQ des accueils enrichie (6 questions réelles).
- **6 nouvelles pages** (FR/EN), générées par `scripts/site/build_pages.py` :
  - `/fr/combien-de-pas-par-jour/` · `/en/how-many-steps-a-day/` (guide sourcé : Lancet 2022, Lancet 2025, JAMA 2019, OMS)
  - `/fr/10000-pas-en-km/` · `/en/steps-to-miles/` (convertisseur selon la taille + tableau)
  - `/fr/calculateur-objectif-pas/` · `/en/step-goal-calculator/` (moyenne requise mensuelle : le cœur de l'app)
- Maillage : bloc « Guides et outils » sur les accueils, liens croisés entre pages, footer commun.
- Liens App Store avec `ct=` par emplacement (`site-home-hero`, `site-distance`, etc.) et `mt=8`.

## 5. Ce qui reste bloqué ou dépend d'un tiers
- **Search Console / Bing** : vérification du domaine (voir la roadmap).
- **Attribution App Store** : le paramètre `ct` n'est comptabilisé dans App Store Connect que s'il est accompagné du `pt` (provider token) de l'équipe. À récupérer dans App Store Connect → Analytics → Sources → Liens de campagne.
- **Nom de la fiche** : publier le nom Walkever (prochaine soumission, gérée par 10k-steps.dev / David).
