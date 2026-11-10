# Roadmap SEO — Walkever

Mise à jour : 2026-11-10.  
Mesure du succès : impressions GSC → clics → clics App Store (`ct=site-*`) → téléchargements « Référents web » App Store Connect.  
Référence audit : `seo-audit.md` · Mots-clés : `seo-keywords.md` · Contenus sociaux : `calendrier-contenus.md`.

---

## 1. État des pages existantes

| URL | Mots-clés cibles | Intention | Statut |
|---|---|---|---|
| `/fr/` | walkever, application podomètre iphone | A | ✅ en ligne |
| `/en/` | walkever, step tracker app iphone | A | ✅ en ligne |
| `/fr/combien-de-pas-par-jour/` | combien de pas par jour, … pour la santé, … maigrir | I | ✅ en ligne |
| `/en/how-many-steps-a-day/` | how many steps a day, … is healthy, … to lose weight | I | ✅ en ligne |
| `/fr/10000-pas-en-km/` | 10000 pas en km, convertisseur pas kilomètre | I/T | ✅ en ligne |
| `/en/steps-to-miles/` | steps to miles, 10000 steps in miles, steps to km | I/T | ✅ en ligne |
| `/fr/calculateur-objectif-pas/` | calculateur objectif pas, moyenne requise de pas | T | ✅ en ligne |
| `/en/step-goal-calculator/` | step goal calculator, monthly step goal | T | ✅ en ligne |

---

## 2. Plan éditorial — priorité impact/effort

### Méthode de priorisation
- **Impact** : volume de la requête cible × intention d'app × concurrence (★ = faible concurrence = impact atteignable élevé)
- **Effort** : volume de code/contenu à produire (pages HTML + outil JS + FAQ JSON-LD + maillage)
- **Priorité** : impact/effort — les pages avec fort impact et faible effort passent en premier

### Tableau des pages à créer

| # | Priorité | URL FR | URL EN | Cluster | Intention | Outil JS | Impact | Effort | Semaine cible |
|---|---|---|---|---|---|---|---|---|---|
| P1 | 🔴 Urgente | `/fr/meilleure-application-podometre-iphone/` | `/en/best-step-counter-app-iphone/` | FR-7 / EN-6 | A (conversion) | Non | ★★★ | ★★ | S1 (11–17 nov) |
| P2 | 🔴 Urgente | `/fr/moyenne-pas-par-jour/` | `/en/average-steps-per-day/` | FR-4 / EN-3 | I | Non | ★★★ | ★★ | S2 (18–24 nov) |
| P3 | 🟠 Haute | `/fr/defi-10000-pas-janvier/` | `/en/january-step-challenge/` | FR-6 / EN-5 | I/T | Oui (calculateur réutilisé) | ★★★ | ★ | S3 (25 nov–1 déc) |
| P4 | 🟠 Haute | `/fr/objectif-annuel-pas/` | `/en/annual-step-goal/` | FR-6 / EN-5 | I/T | Oui (variation du calculateur mensuel) | ★★ | ★★ | S4 (2–8 déc) |
| P5 | 🟡 Moyenne | Enrichissements pages existantes (sections âge, calories, sections longue traîne) | | tous | I/T | — | ★★ | ★ | S1–S2 en parallèle |
| P6 | 🟡 Moyenne | Corrections techniques audit (H1 302, H2 preload, H3 WebP, M1-M9) | | — | — | — | ★★ | ★★ | S1–S2 |
| P7 | 🔵 Données | Pages par âge (`/fr/pas-par-jour-60-ans/` etc.) | | FR-1 variantes | I | Non | ★★ | ★★ | Mois 2 (si GSC le confirme) |
| P8 | 🔵 Données | Netlinking blanc (blogs santé, associations de marche) | | — | — | — | ★★ | ★★★ | Mois 2–3 (après feu vert David) |

---

## 3. Briefs de contenu

### P1 — Page comparaison app

**FR** : `/fr/meilleure-application-podometre-iphone/`  
**EN** : `/en/best-step-counter-app-iphone/`

**Objectif** : capturer les recherches à intention d'app directe, les internautes qui ont déjà décidé de télécharger quelque chose.

**Structure** :
1. Titre H1 (FR) : « Meilleure application podomètre iPhone gratuite sans publicité »
2. Paragraphe intro (≤80 mots) : pourquoi le choix est difficile, critères clés
3. Tableau comparatif honnête (4–5 colonnes, 4–5 apps) : gratuit ?, pub ?, accès HealthKit, fonctionnalité différenciante, note App Store
   - Apps à inclure : Walkever, Apple Santé (natif), Steps (Fitness Tracker), Pedometer++
   - Règle : uniquement des faits vérifiables, aucune formulation dénigrant les concurrents
4. Section « Pourquoi Walkever si tu veux suivre un objectif mensuel » (1–2 paragraphes, lien vers `/fr/calculateur-objectif-pas/`)
5. CTA App Store : `ct=site-compare-fr` / `ct=site-compare-en`
6. FAQ JSON-LD (4 questions) :
   - Quelle est la meilleure application podomètre gratuite iPhone ?
   - Quel podomètre ne collecte pas mes données ?
   - Peut-on changer l'objectif de pas sur iPhone ?
   - Apple Santé compte-t-elle les pas automatiquement ?
7. BreadcrumbList JSON-LD
8. Maillage sortant : `/fr/calculateur-objectif-pas/`, `/fr/combien-de-pas-par-jour/`, accueil

**CTA App Store** : `https://apps.apple.com/app/id6762572011?ct=site-compare-fr&mt=8`

---

### P2 — Guide « moyenne de pas par jour »

**FR** : `/fr/moyenne-pas-par-jour/`  
**EN** : `/en/average-steps-per-day/`

**Objectif** : variantes longue traîne (par âge, par genre, par pays) ; complément naturel du guide « combien de pas par jour ».

**Structure** :
1. H1 : « Moyenne de pas par jour : par âge, hommes, femmes (données 2024–2025) »
2. Résumé clé (3 chiffres sources) : adulte actif, sédentaire, senior
3. Tableau : tranches d'âge (20–29, 30–39, 40–49, 50–59, 60–69, 70+) × genre, valeurs médianes (source : Lancet 2022, NHANES, Tudor-Locke)
4. Graphique SVG simple (optionnel, inline)
5. Section « Comment calculer ta moyenne personnelle » → lien vers `/fr/calculateur-objectif-pas/`
6. Section « Pourquoi la moyenne du mois compte plus que le compteur du jour »
7. FAQ JSON-LD (5 questions) :
   - Quelle est la moyenne de pas par jour d'un Français ?
   - Quelle est la moyenne de pas par jour à 60 ans ?
   - Combien de pas fait en moyenne une femme par jour ?
   - Comment calculer sa propre moyenne de pas mensuelle ?
   - 7000 ou 10000 pas par jour : que dit la science ?
8. BreadcrumbList, Article JSON-LD avec `datePublished`

**CTA App Store** : `ct=site-avg-fr` / `ct=site-avg-en`  
**Sources obligatoires** : Paluch 2022 (Lancet), NHANES, Tudor-Locke 2010 (baseline historique), Bourassa 2017

---

### P3 — Défi janvier

**FR** : `/fr/defi-10000-pas-janvier/`  
**EN** : `/en/january-step-challenge/`

**Objectif** : pic de trafic saisonnier (nov–jan), requêtes « défi pas janvier », « step challenge », lien naturel avec les résolutions.

**Structure** :
1. H1 : « Défi 10 000 pas par jour en janvier : plan sur 31 jours »
2. Intro courte : contexte (résolutions, pic d'usage Santé en janvier)
3. Plan semaine par semaine (objectifs, conseils pratiques)
4. Widget calculateur réutilisé (même logique que `/fr/calculateur-objectif-pas/`) pré-rempli pour janvier 2027 : objectif 310 000 pas au total
5. Tableau de suivi hebdomadaire téléchargeable (optionnel)
6. CTA App Store : « Suis ton défi automatiquement »
7. FAQ JSON-LD :
   - Comment faire 10 000 pas par jour en janvier ?
   - Quel est l'objectif total de pas pour janvier ?
   - Combien de km représentent 310 000 pas ?

**Note timing** : publier avant le 15 décembre pour être indexée avant les pics de recherche de fin décembre.

**CTA App Store** : `ct=site-defi-fr` / `ct=site-defi-en`

---

### P4 — Calculateur objectif annuel

**FR** : `/fr/objectif-annuel-pas/`  
**EN** : `/en/annual-step-goal/`

**Objectif** : requêtes bilan et résolutions (déc–jan), calculateur evergreen utilisable toute l'année.

**Structure** :
1. H1 : « Calculateur d'objectif annuel de pas »
2. Outil JS : entrer objectif journalier → total annuel, semaines restantes, moyenne requise (réutilise la logique du calculateur mensuel)
3. Tableau de référence : 7 000, 8 000, 10 000, 12 000 pas/jour → km parcourus, calories estimées, total annuel
4. Section « Bilan 2026 » (éphémère, remplacée par « 2027 » en janvier) → lien vers l'écran Historique de l'app
5. FAQ JSON-LD (4 questions)

**CTA App Store** : `ct=site-annual-fr` / `ct=site-annual-en`

---

### P5 — Enrichissements des pages existantes

Sections à ajouter sur les pages déjà en ligne (faible effort, complémentaires aux mots-clés longue traîne) :

| Page | Section à ajouter | Mots-clés visés |
|---|---|---|
| `/fr/10000-pas-en-km/` | « 10 000 pas en calories brûlées » | 10000 pas en calories |
| `/fr/combien-de-pas-par-jour/` | Tableau par âge (20–70 ans) | combien de pas par jour à 60 ans, … à 70 ans |
| `/en/how-many-steps-a-day/` | Table by age + « by gender » | how many steps a day for a 60 year old |
| `/fr/calculateur-objectif-pas/` | FAQ supplémentaire + lien vers P2 | moyenne de pas nécessaire pour finir le mois |
| `/en/step-goal-calculator/` | FAQ extension | required daily steps to reach monthly goal |

---

## 4. Maillage interne et CTA App Store

### Schéma de maillage

```
Accueils (/fr/, /en/)
  ├─→ combien-de-pas-par-jour / how-many-steps-a-day
  ├─→ 10000-pas-en-km / steps-to-miles
  ├─→ calculateur-objectif-pas / step-goal-calculator
  ├─→ moyenne-pas-par-jour / average-steps-per-day     [P2 — à créer]
  └─→ meilleure-app-podometre / best-step-counter-app  [P1 — à créer]

combien-de-pas-par-jour / how-many-steps-a-day
  ├─→ calculateur-objectif-pas (CTA « Calculer ta moyenne requise »)
  ├─→ 10000-pas-en-km (CTA « Convertir en km »)
  └─→ moyenne-pas-par-jour (CTA « Comparer à la moyenne »)   [dès P2 créée]

10000-pas-en-km / steps-to-miles
  ├─→ calculateur-objectif-pas
  └─→ combien-de-pas-par-jour

calculateur-objectif-pas / step-goal-calculator
  ├─→ combien-de-pas-par-jour
  ├─→ defi-janvier (en saison nov–jan)   [P3]
  └─→ objectif-annuel-pas / annual-step-goal   [P4]

meilleure-app-podometre / best-step-counter-app   [P1]
  ├─→ calculateur-objectif-pas (différenciateur clé)
  └─→ combien-de-pas-par-jour

defi-janvier / january-step-challenge   [P3]
  ├─→ calculateur-objectif-pas (widget réutilisé)
  └─→ objectif-annuel-pas

objectif-annuel-pas / annual-step-goal   [P4]
  ├─→ calculateur-objectif-pas
  └─→ defi-janvier (en saison)
```

**Règle** : chaque page pointe vers au maximum 3 pages internes + 1 CTA App Store. Pas de lien croisé artificiel.

### CTA App Store — table des paramètres `ct=`

| Page | `ct=` | URL complète (à compléter avec `pt=<token>` une fois B4 résolu) |
|---|---|---|
| `/fr/` hero | `site-home-fr` | `https://apps.apple.com/app/id6762572011?ct=site-home-fr&mt=8` |
| `/en/` hero | `site-home-en` | `https://apps.apple.com/app/id6762572011?ct=site-home-en&mt=8` |
| `/fr/combien-de-pas-par-jour/` | `site-guide-fr` | `…?ct=site-guide-fr&mt=8` |
| `/en/how-many-steps-a-day/` | `site-guide-en` | `…?ct=site-guide-en&mt=8` |
| `/fr/10000-pas-en-km/` | `site-conv-fr` | `…?ct=site-conv-fr&mt=8` |
| `/en/steps-to-miles/` | `site-conv-en` | `…?ct=site-conv-en&mt=8` |
| `/fr/calculateur-objectif-pas/` | `site-calc-fr` | `…?ct=site-calc-fr&mt=8` |
| `/en/step-goal-calculator/` | `site-calc-en` | `…?ct=site-calc-en&mt=8` |
| `/fr/meilleure-application-podometre-iphone/` | `site-compare-fr` | `…?ct=site-compare-fr&mt=8` |
| `/en/best-step-counter-app-iphone/` | `site-compare-en` | `…?ct=site-compare-en&mt=8` |
| `/fr/moyenne-pas-par-jour/` | `site-avg-fr` | `…?ct=site-avg-fr&mt=8` |
| `/en/average-steps-per-day/` | `site-avg-en` | `…?ct=site-avg-en&mt=8` |
| `/fr/defi-10000-pas-janvier/` | `site-defi-fr` | `…?ct=site-defi-fr&mt=8` |
| `/en/january-step-challenge/` | `site-defi-en` | `…?ct=site-defi-en&mt=8` |
| `/fr/objectif-annuel-pas/` | `site-annual-fr` | `…?ct=site-annual-fr&mt=8` |
| `/en/annual-step-goal/` | `site-annual-en` | `…?ct=site-annual-en&mt=8` |

**Note** : sans le `pt=` (provider token, bloquant B4), les `ct=` ne remontent pas dans App Store Connect Analytics. Ajouter le token dès que David l'a récupéré : une seule passe sur tous les fichiers HTML.

---

## 5. GEO — Moteurs IA (llms.txt + FAQs structurées)

### Stratégie GEO

Depuis août 2026, quasi 100 % des PAA en anglais sont répondus via AI Overviews (Google), et ChatGPT Search/Copilot (Bing) indexe activement. Deux leviers :

1. **llms.txt** : tenir à jour la liste des pages pour que les crawleurs IA trouvent directement les contenus citables.
2. **FAQPage JSON-LD** : chaque réponse ≤ 60 mots, factuellement vérifiable, citant une source si santé. C'est la forme la plus directement ingérable par les LLMs.

### Màj llms.txt à chaque nouvelle page

Fichier actuel : `site/llms.txt` — ajouter une ligne par page créée dans la section `## Pages` :

```
[Meilleure application podomètre iPhone](https://www.walkever.app/fr/meilleure-application-podometre-iphone/)
[Best step counter app for iPhone](https://www.walkever.app/en/best-step-counter-app-iphone/)
[Moyenne de pas par jour](https://www.walkever.app/fr/moyenne-pas-par-jour/)
[Average steps per day](https://www.walkever.app/en/average-steps-per-day/)
[Défi 10 000 pas en janvier](https://www.walkever.app/fr/defi-10000-pas-janvier/)
[January step challenge](https://www.walkever.app/en/january-step-challenge/)
[Objectif annuel de pas](https://www.walkever.app/fr/objectif-annuel-pas/)
[Annual step goal](https://www.walkever.app/en/annual-step-goal/)
[Politique de confidentialité](https://www.walkever.app/fr/confidentialite.html)
```

### FAQs GEO-ready par page (réponses ≤ 60 mots, à intégrer en JSON-LD)

**Pages existantes — FAQs à ajouter ou enrichir** :

`/fr/combien-de-pas-par-jour/` :
- _À quel âge les recommandations changent-elles ?_ → « Les études recommandent 10 000 pas/jour pour les adultes actifs de 18 à 60 ans. À partir de 60 ans, 7 000 à 8 000 pas sont associés à une réduction de mortalité similaire (Paluch, Lancet 2022). » (source citée)
- _Les 10 000 pas viennent-ils d'une étude scientifique ?_ → « Non : ce chiffre vient d'une campagne marketing japonaise de 1965. Des études récentes (JAMA 2019, Lancet 2022) montrent que les bénéfices continuent au-delà mais que 7 000 pas représentent déjà un seuil significatif. »

`/fr/10000-pas-en-km/` :
- _Combien de pas pour 1 km ?_ → « En moyenne, 1 km correspond à environ 1 300 pas pour une personne de 1,70 m. Ce chiffre varie de 1 150 (1,80 m) à 1 500 (1,60 m) selon la taille. »
- _Combien de calories brûle-t-on en 10 000 pas ?_ → « Environ 300 à 500 kcal selon le poids et l'allure — équivalent à une marche de 7 à 8 km. »

**Pages P1 (comparaison app)** — FAQs GEO clés :
- _Quelle application podomètre ne collecte pas les données ?_ → « Walkever ne collecte aucune donnée : les pas sont lus depuis Apple Santé et restent sur l'iPhone. Pas de compte, pas de serveur. »
- _Apple Santé peut-elle remplacer un podomètre ?_ → « Oui pour compter les pas. Mais elle n'affiche ni l'avance/retard sur un objectif mensuel, ni la moyenne requise pour finir le mois — c'est ce qu'ajoute Walkever. »

**Pages P2 (moyenne)** — FAQs GEO clés :
- _Quelle est la moyenne de pas par jour en France ?_ → « Environ 7 500 pas/jour selon une étude Stanford sur 46 pays (Althoff 2017). La moyenne française est légèrement inférieure à la moyenne mondiale de 4 961. »
- _Combien de pas par jour fait en moyenne une femme ?_ → « Les femmes font en moyenne 200 à 400 pas de moins par jour que les hommes dans la même tranche d'âge, selon les données NHANES 2005–2016. »

---

## 6. Corrections techniques (audit §6.2) — ordre de traitement

| ID | Action | Effort | Semaine |
|---|---|---|---|
| H1 | 302 serveur sur `/` dans `vercel.json` (remplace la redirection JS) | ★★ | S1 |
| H2 | `<link rel="preload" as="image">` dans `<head>` des accueils | ★ | S1 |
| H3 | Captures WebP + `<picture><source>` ou `srcset` | ★★★ | S2 |
| M1 | `twitter:image/title/description` (3 lignes par page) | ★ | S1 |
| M2 | `datePublished` sur les schemas Article | ★ | S1 |
| M3 | Header/footer sur confidentialite.html / privacy.html | ★★ | S1 |
| M4 | `cleanUrls: true` dans `vercel.json` + màj canonicals + sitemap | ★★ | S1 |
| M5 | `og:type: "website"` sur les pages calculatrices | ★ | S1 |
| M6 | `og:image:width/height` | ★ | S1 |
| M7 | `WebSite` schema `inLanguage: ["fr","en"]` | ★ | S1 |
| M8 | Ajouter privacy FR dans `llms.txt` | ★ | S1 |
| M9 | Ajouter `pt=<token>` une fois B4 résolu | ★ | Dès B4 |
| F2 | Liens EN : `/us/app/` → `/app/` (conversion universelle) | ★ | S1 |
| F3 | `:focus-visible` CSS sur `a, button, .btn` | ★ | S2 |

---

## 7. Calendrier

| Semaine | Dates | Priorité | Productions SEO |
|---|---|---|---|
| S0 | 10 nov | ✅ Fait | Audit, 6 pages, technique, llms.txt, sitemap |
| S1 | 11–17 nov | 🔴 P1 + corrections M/F + H1/H2 | P1 : pages comparaison app FR/EN · Corrections M1, M2, M3, M4, M5, M6, M7, M8, H1, H2 · P5 enrichissements pages existantes (sections âge) |
| S2 | 18–24 nov | 🔴 P2 + H3 (WebP) | P2 : guide moyenne de pas FR/EN · H3 : WebP des captures · Enrichissements P5 suite (calories) |
| S3 | 25 nov–1 déc | 🟠 P3 (défi janvier) | Pages défi FR/EN (publier avant le 15 déc pour indexation) · IndexNow ping post-déploiement |
| S4 | 2–8 déc | 🟠 P4 (objectif annuel) | Pages objectif annuel FR/EN · Màj maillage interne |
| S5 | 9–15 déc | 🟡 Itération | Màj llms.txt avec toutes nouvelles pages · Vérifier GSC : pages indexées, premières impressions |
| S6–S7 | 16–29 déc | 🟡 Contenu saisonnier | Màj « Bilan 2026 » sur `/fr/objectif-annuel-pas/` · Coordination social (voir `calendrier-contenus.md` S7) |
| Mois 2 | jan 2027 | 🔵 Données | Pages âge si GSC confirme les impressions · Màj `pt=` si B4 résolu |
| Mois 3 | fév 2027 | 🔵 Netlinking | Outreach blogs santé + associations de marche (**après feu vert David**) · Itérer titres/desc pages à CTR < 2 % |

---

## 8. Bloquants — besoin de David

| # | Action | Pourquoi |
|---|---|---|
| ~~B1~~ | ✅ GSC vérifiée (10 nov), sitemap soumis | — |
| ~~B2~~ | ✅ inutile (session navigateur Timon) | — |
| B3 | Bing Webmaster Tools : connexion → importer depuis GSC | Alimente ChatGPT Search et Copilot ; IndexNow couvre l'indexation en attendant |
| B4 | Récupérer `pt=` (provider token) dans App Store Connect → Analytics → Liens de campagne | Sans `pt`, les `ct=site-*` ne remontent pas dans App Store Connect |
| B5 | Feu vert pour chaque déploiement de page | Règle générale : aucun déploiement sans accord de David |
| B6 | Feu vert pour tout contact externe (netlinking, presse, communautés) | Voir `calendrier-contenus.md` §Communautés |

---

## 9. Coordination avec 10k-steps.marketing

- Chaque nouvelle page doit être signalée à l'agent marketing pour qu'un post social pointe vers l'outil (pas directement vers l'App Store) — ex. P3 « défi janvier » → post social + lien vers `/fr/defi-10000-pas-janvier/`.
- Le paramètre de campagne social (`ct=bluesky`, `ct=linkedin`…) est distinct du paramètre SEO (`ct=site-<page>`) : ne pas les mélanger.
- Le calendrier social (`calendrier-contenus.md`) est calé pour amplifier les pics saisonniers que les pages P3/P4 ciblent.

---

## 10. Règles éditoriales

- Une page = une intention réelle ; pas de pages quasi identiques par ville ou par chiffre.
- Toute affirmation santé est sourcée (Lancet, JAMA, OMS, NHANES) ; aucune promesse médicale.
- Aucune fonctionnalité citée qui n'existe pas dans l'app.
- Comparaison honnête uniquement : faits vérifiables, aucune formulation dénigrant les concurrents.
- Aucun script tiers ni analytics invasif.
- FAQPage JSON-LD sur toutes les pages (minimum 4 questions, réponses ≤ 60 mots).
- BreadcrumbList JSON-LD sur toutes les pages hors accueils.
- `ct=` distinct par page dans tous les liens App Store.
- `llms.txt` mis à jour à chaque nouveau déploiement.
