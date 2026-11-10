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

---

## 6. Audit technique post-intervention — 2026-11-10

Audit réalisé en lecture seule sur `site/` (état actuel sur `main`). Périmètre : toutes les pages HTML, `vercel.json`, `robots.txt`, `sitemap.xml`, `llms.txt`, images, CSS, JS.

### 6.1 Résumé des forces en place

| Domaine | État |
|---|---|
| Indexabilité | `robots.txt` et `sitemap.xml` présents ; racine `/` en `noindex,follow` (aiguillage de langue — correct) |
| Canonicals | Absolus sur toutes les pages indexables |
| hreflang | Complet : HTML + sitemap, `x-default` → `/en/` cohérent |
| Données structurées | MobileApplication, Organization, WebSite, FAQPage, BreadcrumbList, Article/WebPage, WebApplication |
| Open Graph | Absolu, `og:image` correct, `og:locale` par langue |
| Twitter card | `summary_large_image` présent |
| Maillage interne | Footer + bloc "Guides & outils" sur les accueils ; liens croisés entre guides |
| Performance de base | HTML léger, `defer` sur les JS, `fetchpriority="high"` sur l'image hero |
| Smart App Banner | `meta apple-itunes-app` présent sur toutes les pages |
| Accessibilité de base | `alt` sur les captures, `aria-label` sur nav, `aria-hidden` sur SVG décoratifs, `prefers-reduced-motion` respecté |
| Campaign tokens | `ct=` distinct par emplacement, `mt=8` présent |
| llms.txt | Présent, factuel, bien structuré |
| IndexNow | Clé `4fe843eefdb3ab7d73dfe5d66c24dbab.txt` présente |

---

### 6.2 Constats priorisés

#### 🔴 Haute priorité

**[H1] Redirection racine JavaScript-only**
- `site/index.html` redirige via `location.replace()` côté client. Google exécute le JS, mais la découverte est plus lente qu'un 302 serveur. Le fallback `<noscript>` fait une meta-refresh vers `/en/` seulement.
- Risque : si Googlebot rencontre un délai JS, la racine `/` est indexée comme page vide.
- Fix : ajouter dans `vercel.json` une règle `redirects` ou `rewrites` avec `Accept-Language` pour servir un 302 serveur. Alternative minimaliste : faire pointer `/` directement sur `/en/` par défaut sans JS, avec la balise hreflang en `x-default`.

**[H2] Pas de `<link rel="preload">` pour l'image LCP**
- L'image hero (`/img/fr/1-dashboard.png` et `/img/en/1-dashboard.png`) a `fetchpriority="high"` sur la balise `<img>` — bien. Mais sans `<link rel="preload" as="image" href="..." fetchpriority="high">` dans le `<head>`, le navigateur ne découvre l'image qu'après avoir parsé le HTML jusqu'à la balise `<img>`. Ajout d'un preload améliore le LCP (Core Web Vitals).
- Fix : ajouter dans le `<head>` des pages `/fr/` et `/en/` :
  ```html
  <link rel="preload" as="image" href="/img/fr/1-dashboard.png" fetchpriority="high">
  ```

**[H3] Images PNG uniquement — pas de WebP/AVIF**
- Screenshots EN : 217 Ko, 188 Ko, 207 Ko, 173 Ko (total ~785 Ko). Screenshots FR : 111 Ko, 101 Ko, 77 Ko, 79 Ko (total ~368 Ko). `logo-512.png` : 232 Ko (uniquement utilisé en Open Graph / schema.org, jamais rendu dans le DOM visible).
- Économie estimée en WebP : ~40 %, soit ~350 Ko sur les screenshots EN seuls.
- Fix : générer des variantes `.webp` (et optionnellement `.avif`) et utiliser `<picture><source>` ou des URL `.webp` directes si la pipeline de build le permet. Le gain est surtout sur les pages EN.

#### 🟠 Priorité moyenne

**[M1] `twitter:image`, `twitter:title`, `twitter:description` absents**
- Toutes les pages ont `<meta name="twitter:card" content="summary_large_image">` mais aucun tag `twitter:image`, `twitter:title` ou `twitter:description`. Twitter utilise le fallback OG, mais ce n'est pas garanti selon le client.
- Fix (3 lignes par page) :
  ```html
  <meta name="twitter:image" content="https://www.walkever.app/img/fr/1-dashboard.png">
  <meta name="twitter:title" content="[même valeur que og:title]">
  <meta name="twitter:description" content="[même valeur que og:description]">
  ```

**[M2] `datePublished` manquant dans les schémas `Article`**
- Les pages `combien-de-pas-par-jour` (FR) et `how-many-steps-a-day` (EN) déclarent un schéma `@type: "Article"` avec `dateModified` mais sans `datePublished`. Google recommande les deux pour l'éligibilité aux rich results d'articles.
- Fix : ajouter `"datePublished":"2026-11-10"` dans les deux blocs JSON-LD.

**[M3] Pages confidentialité/privacy sans navigation complète**
- `fr/confidentialite.html` et `en/privacy.html` n'ont ni `<header>` avec le logo et les liens de langue, ni `<footer>` avec les guides. La seule sortie interne est le lien de retour dans le `.legal` div. Ces pages sont donc des culs-de-sac pour le jus de liens.
- Fix : ajouter le même header/footer que les autres pages (y compris les 3 liens de guides en footer).

**[M4] URLs des pages confidentialité non-clean (`.html`)**
- `vercel.json` a `"cleanUrls": false`. Les pages privacy sont donc servies en `/fr/confidentialite.html` et `/en/privacy.html` alors que toutes les autres pages sont en `/fr/`, `/en/`, `/fr/10000-pas-en-km/`, etc. L'incohérence est légère mais visible dans les SERP et les canonicals.
- Fix : passer `"cleanUrls": true` dans `vercel.json`. Vercel servirait alors `confidentialite.html` sous `/fr/confidentialite` automatiquement. Mettre à jour les canonicals et hreflang en conséquence (supprimer `.html`), ainsi que le sitemap.

**[M5] `og:type: "article"` sur les pages calculatrices**
- `/fr/calculateur-objectif-pas/` et `/en/step-goal-calculator/` déclarent `og:type: "article"` mais sont des outils interactifs, pas du contenu éditorial. Les partages sur les réseaux sociaux risquent d'afficher un mauvais template.
- Fix : changer en `og:type: "website"` sur les deux pages calculatrices.

**[M6] `og:image:width` et `og:image:height` absents**
- Facebook/LinkedIn recommend ces meta pour choisir le bon ratio d'affichage. Les images hero sont de 560×1212 px (portrait).
- Fix : ajouter `<meta property="og:image:width" content="560">` et `<meta property="og:image:height" content="1212">` sur toutes les pages.

**[M7] `WebSite` schema : `inLanguage` mono-langue**
- Sur `/fr/`, le schéma `WebSite` déclare `"inLanguage":"fr"` ; sur `/en/`, `"inLanguage":"en"`. L'entité `WebSite` représente le domaine entier, pas une page. Il vaudrait mieux `"inLanguage":["fr","en"]` sur les deux.
- Fix : mettre `["fr","en"]` sur les deux versions.

**[M8] Politique de confidentialité française absente de `llms.txt`**
- `llms.txt` liste `[Privacy policy](https://www.walkever.app/en/privacy.html)` mais pas la version française. Les crawleurs IA qui indexent le contenu FR n'ont pas de pointeur.
- Fix : ajouter `[Politique de confidentialité](https://www.walkever.app/fr/confidentialite.html)` dans la section `## Pages`.

**[M9] Attribution App Store — provider token (`pt`) manquant**
- Tous les liens App Store ont `ct=<emplacement>&mt=8` mais pas `pt=<provider_token>`. Sans `pt`, les `ct` ne remontent pas dans App Store Connect Analytics → Sources → Liens de campagne.
- Fix : récupérer le provider token dans App Store Connect et l'ajouter à toutes les URLs : `?ct=…&pt=<token>&mt=8`.

#### 🟡 Priorité faible

**[F1] Pas de `twitter:site` ni `twitter:creator`**
- Tags optionnels mais utiles pour associer les partages au compte X de Walkever (@walkeverapp ou similaire).
- Fix : ajouter `<meta name="twitter:site" content="@<handle>">` si un compte X existe.

**[F2] App Store EN vers `/us/app/` — utilisateurs non-américains exclus**
- Les pages EN redirigent vers `https://apps.apple.com/us/app/id6762572011`. Un utilisateur anglophone du UK, d'Australie ou du Canada voit la page US. L'URL universelle sans pays (`https://apps.apple.com/app/id6762572011`) redirige automatiquement vers le store local.
- Impact SEO nul, mais impact conversion possible.
- Fix : remplacer `/us/app/` par `/app/` dans les liens EN.

**[F3] Focus visible insuffisant sur navigation et boutons**
- CSS ne définit pas de style `:focus-visible` sur les liens de navigation (`.lang a`, `.brand`) ni sur `.btn`. Seuls les `<input>` et `<select>` des outils ont un `outline`. Non-conforme WCAG 2.1 AA (critère 2.4.7).
- Fix : ajouter `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }` sur `a, button, .btn`.

**[F4] `logo-512.png` (232 Ko) jamais rendu dans le DOM**
- Utilisé uniquement dans les blobs JSON-LD (`"logo"`) et `og:image` de secours, jamais dans une balise `<img>` visible. Le serveur le livre quand les crawleurs le réclament. Ce n'est pas un problème de performance page, mais l'image est lourde pour un logo.
- Fix non urgent : générer un WebP 512px optimisé.

---

### 6.3 Tableau de synthèse

| ID | Constat | Impact | Effort |
|---|---|---|---|
| H1 | Redirection racine JS-only (pas de 302 serveur) | ★★★ | ★★ |
| H2 | Pas de `<link rel="preload">` pour l'image LCP | ★★★ | ★ |
| H3 | Images PNG uniquement (pas de WebP) | ★★★ | ★★★ |
| M1 | `twitter:image/title/description` absents | ★★ | ★ |
| M2 | `datePublished` manquant sur Article schema | ★★ | ★ |
| M3 | Pages privacy sans header/footer — culs-de-sac | ★★ | ★★ |
| M4 | `cleanUrls: false` — URLs privacy avec `.html` | ★★ | ★★ |
| M5 | `og:type: "article"` sur les outils interactifs | ★ | ★ |
| M6 | `og:image:width/height` absents | ★ | ★ |
| M7 | `WebSite` schema mono-langue | ★ | ★ |
| M8 | Privacy FR absente de `llms.txt` | ★ | ★ |
| M9 | Provider token (`pt`) absent des liens App Store | ★★ | ★ |
| F1 | Pas de `twitter:site` / `twitter:creator` | ★ | ★ |
| F2 | Liens EN vers `/us/app/` (non-US exclus) | ★ | ★ |
| F3 | Focus visible insuffisant (WCAG 2.4.7) | ★ | ★ |
| F4 | `logo-512.png` lourd (232 Ko, usage schema-only) | ★ | ★★ |

*Impact et Effort : ★ faible · ★★ moyen · ★★★ élevé*

---

### 6.4 Ce qui est délibérément hors périmètre

- **Search Console / Bing** : vérification du domaine, soumission du sitemap, monitoring GSC — actions ponctuelles non techniques (voir roadmap).
- **Contenu éditorial** : enrichissement des guides (nouvelles sections, sources supplémentaires) — hors audit technique.
- **ASO** : fiche App Store — traité dans `docs/marketing/aso.md`.
- **CMS ou pipeline build** : le site est en HTML statique, pas de SSG/framework. Les optimisations (WebP, preload) nécessitent soit des modifications manuelles des fichiers HTML, soit un script de build.
