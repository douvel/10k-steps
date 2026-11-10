# Page web vitrine — plan

Mise en œuvre technique : site en ligne sur https://www.walkever.app (refonte animée du 2026-11-10, voir en bas). Ici : structure et textes.

## Principes
- Une seule page, rapide, bilingue (FR/EN, détection de langue du navigateur + sélecteur).
- Objectif unique : **faire cliquer vers l'App Store**.
- Textes alignés sur `docs/store/` ; uniquement des fonctionnalités réelles.
- Pas de traceur tiers, cohérent avec la promesse « aucune donnée collectée » (mesure via App Store Connect plutôt que des scripts d'analytics).

## Structure
1. **Hero** — titre, sous-titre, bouton App Store, capture du dashboard.
2. **Le problème / la promesse** — « Savoir combien tu as marché ne suffit pas. »
3. **3 fonctions clés** — moyenne requise, avance/retard cumulé, historique.
4. **Aperçu** — 3 à 4 captures (dashboard, barre, calendrier, mois/années).
5. **Respect de la vie privée** — gratuit, sans pub, aucune donnée collectée, lecture directe d'Apple Santé.
6. **FAQ** — 4 questions.
7. **Pied de page** — lien App Store, politique de confidentialité, contact (e-mail à valider par David), mention Apple Santé.

## Textes (FR)
- **Titre** : Tu marches déjà. Es-tu dans le rythme ?
- **Sous-titre** : Walkever compare tes pas au rythme de ton objectif, sur le jour, le mois et l'année. Gratuit, sans pub, aucune donnée collectée.
- **Bouton** : Télécharger sur l'App Store
- **Fonction 1 — Moyenne requise** : Vois combien de pas par jour il te reste à faire pour finir le mois à temps, avec ou sans aujourd'hui.
- **Fonction 2 — Avance ou retard** : Ton écart cumulé sur le rythme idéal, avec une barre de progression qui change de couleur.
- **Fonction 3 — Historique** : Tes pas jour par jour, mois par mois, année par année. Touche pour voir le total exact, le pourcentage de l'objectif et la moyenne.
- **Vie privée** : Lecture directe de l'app Santé d'Apple. Tes données restent sur ton iPhone.
- **FAQ**
  - *Ça coûte quelque chose ?* Non, l'app est gratuite et sans publicité.
  - *D'où viennent mes pas ?* De l'app Santé d'Apple, aucune saisie manuelle.
  - *Puis-je changer mon objectif ?* Oui, 10 000 pas par défaut ; l'objectif mensuel se calcule tout seul.
  - *Quelles langues ?* Français et anglais.

## Texts (EN)
- **Title**: You already walk. Are you on pace?
- **Subtitle**: Walkever compares your steps to your goal pace by day, month and year. Free, no ads, no data collected.
- **Button**: Download on the App Store
- **Feature 1 — Required average**: See how many steps per day you still need to finish the month on track, with or without today.
- **Feature 2 — Ahead or behind**: Your cumulative gap against the ideal pace, with a progress bar that changes color.
- **Feature 3 — History**: Your steps day by day, month by month, year by year. Tap for the exact total, percentage of goal and average.
- **Privacy**: Reads directly from Apple Health. Your data stays on your iPhone.
- **FAQ**
  - *Does it cost anything?* No, the app is free and ad-free.
  - *Where do my steps come from?* Apple Health, no manual entry.
  - *Can I change my goal?* Yes, 10,000 steps by default; the monthly goal is calculated for you.
  - *Which languages?* English and French.

## Éléments techniques demandés à 10k-steps.dev
- Hébergement gratuit (statique) ; domaine : *hypothèse, à choisir par David*.
- Métadonnées SEO FR/EN (title, description, Open Graph pour les partages).
- **Smart App Banner** iOS : balise `apple-itunes-app` avec l'identifiant App Store 6762572011.
- Badge officiel « Download on the App Store » aux consignes de marque d'Apple.
- Page **confidentialité** (courte, cohérente avec les déclarations App Store). *Vérifier si une URL existe déjà dans App Store Connect.*
- Liens App Store avec paramètre de campagne par canal (voir [suivi-resultats.md](suivi-resultats.md)).
- Accessibilité de base (contrastes, alt des captures) et performance mobile d'abord.

## Hors périmètre / à décider
- Blog ou page « Journal » : seulement si le calendrier de contenus fonctionne (sinon inutile).
- Mentions légales : à vérifier par David selon son statut.

## Renommage « Walkever » (2026-11-09) — local, rien publié
- Titres/meta/Open Graph, textes et politiques de confidentialité (`site/`, `docs/privacy-policy.html`) : « Objectif 10K Pas » → « Walkever ». Éditeur inchangé (BELLASOR).
- **Domaine : walkever.app** (acheté par David via Vercel, connecté au projet ; walkever.com pris). Aucune URL en dur dans `site/`, donc rien à changer côté code. L'ancienne URL objectif-10k-pas.vercel.app doit rediriger vers walkever.app (à vérifier dans Vercel). Si l'URL de politique de confidentialité enregistrée dans App Store Connect change, la mettre à jour en même temps que la fiche.
- Le calendrier de contenus pointe maintenant vers https://walkever.app (content-calendar.md:15).
- `<title>` FR/EN avec « Walkever » seul en tête ; ajouter « Podomètre » (FR) / « Step Goal Tracker » (EN) dans les `<title>` serait bénéfique au SEO web : à valider.

## Refonte animée (2026-11-10) — en ligne sur walkever.app
Fichiers : `site/fr/index.html`, `site/en/index.html`, `site/style.css`, `site/main.js` (HTML/CSS/JS statiques, aucune dépendance ni traceur).

Structure réelle de la page (remplace la liste « Structure » ci-dessus pour les animations) :
1. **Hero** : titre animé mot par mot, téléphone flottant qui s'incline avec la souris, deux pastilles (« 134 pas/j de retard », « 73 % de l'objectif », issues de la capture), trame de points en dérive, bouton App Store avec reflet.
2. **Bandeau défilant** : Jour · Mois · Année · Avance · Retard · Rythme idéal · Objectif.
3. **Le rythme** : courbe « Rythme idéal vs Toi » tracée au scroll.
4. **3 cartes** : moyenne requise (10 370, compteur), avance/retard (barre qui cycle rouge → bleu → vert → or, couleurs de `getPaceState`), historique (barres qui poussent).
5. **Aperçu** : 4 captures dans des cadres de téléphone, parallaxe au scroll.
6. **Vie privée** : « 0 pub · 0 donnée collectée · 1 source ».
7. **FAQ** animée, puis **CTA final** (barre de 10 segments qui se remplit, dernier segment or).
- Barre de progression de scroll en haut, en 10 segments comme l'app.
- `prefers-reduced-motion` coupe toutes les animations.
- Honnêteté : les chiffres viennent des captures réelles ; les libellés de la carte avance/retard (« 3 600 pas de retard », « +1 200 pas d'avance ») sont des **illustrations**, pas des mesures.
- Les HTML FR/EN ont été générés par un script temporaire : toute évolution se fait directement dans `site/`.
- Reste à faire : ajouter le badge officiel « Download on the App Store » (le bouton est aujourd'hui textuel), valider « Podomètre » / « Step Goal Tracker » dans les `<title>` (déjà présent).
