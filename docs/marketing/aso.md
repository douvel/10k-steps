# ASO — Objectif 10K Pas

Base : textes actuels dans `docs/store/{fr-FR,en-US}/`. Aucune donnée de classement ou de volume de recherche n'a été mesurée : tout ce qui suit est **hypothèse à tester**, à ajuster avec les stats App Store Connect.

## 1. État actuel
| Champ | FR | EN | Limite |
|---|---|---|---|
| Nom | Objectif 10K Pas | Objectif 10K Pas | 30 |
| Sous-titre | Pas par jour, mois et année (27) | Steps by day, month and year (28) | 30 |
| Mots-clés | podomètre,marche,santé,compteur,rythme,moyenne,healthkit,activité,habitude,suivi,mensuel,annuel | pedometer,walking,health,counter,pace,average,healthkit,activity,habit,tracker,monthly,yearly | 100 |

## 2. Constats
1. **Le nom est identique en EN** et en français (« Objectif 10K Pas ») : un anglophone qui cherche « step counter » ne voit aucun mot anglais dans le nom ; seul le sous-titre porte l'anglais. C'est la limite principale de l'ASO EN.
2. Le sous-titre FR décrit un *contenu* (« pas par jour, mois, année ») mais pas le *bénéfice* différenciant (le rythme).
3. Apple indexe nom + sous-titre + mots-clés : **ne pas répéter** dans les mots-clés un mot déjà présent dans le nom/sous-titre (ex. « pas », « steps », « jour », « mois »).
4. « healthkit » est un terme technique peu cherché par le grand public (hypothèse) ; l'emplacement peut servir à un mot plus recherché.

## 3. Propositions (à tester, **un changement à la fois**, ~2 semaines entre deux)
### Sous-titre
| | FR (≤30) | EN (≤30) |
|---|---|---|
| Actuel | Pas par jour, mois et année | Steps by day, month and year |
| A — bénéfice | Es-tu dans le rythme ? | Are you on pace to your goal? *(à raccourcir si > 30)* |
| B — mixte | Ton rythme de pas, au mois | Step goal pace tracker |
| C — avance/retard | Ton avance ou retard en pas | Steps ahead or behind goal |

Recommandation de départ : **B EN (« Step goal pace tracker », 22) et A FR**, car ils injectent « tracker » / « rythme » côté recherche et le bénéfice côté lecture. Vérifier la longueur exacte avant soumission.

### Mots-clés (100 caractères max, séparés par des virgules, sans espaces)
- **FR** (piste) : `podomètre,marche,santé,compteur,moyenne,objectif,habitude,suivi,mensuel,annuel,10000,activité,défi`
  - retire `healthkit` et `rythme` (si utilisé dans le sous-titre) ; ajoute `10000`, `défi`.
- **EN** (piste) : `pedometer,walking,health,counter,average,goal,habit,tracker,monthly,yearly,10000,activity,challenge`
  - même logique.
- Vérifier le nombre de caractères avant soumission.

### Description / texte promo
- La description actuelle est cohérente et factuelle : la garder.
- Texte promotionnel (modifiable sans nouvelle version) : bon terrain d'essai, par exemple pour l'angle saisonnier :
  - **Décembre** (FR) : « Il reste X jours : vois la moyenne qu'il te faut pour finir l'année dans le rythme. Gratuit, sans pub. » *(ne pas écrire de chiffre figé ; reformuler sans X)*
  - **Janvier** (FR) : « Nouvelle année, nouvel objectif. Vois chaque jour si tu es dans le rythme. Gratuit, sans pub, aucune donnée collectée. »
  - **Janvier** (EN) : « New year, new goal. See every day whether you're on pace. Free, no ads, no data collected. »

### Localisations supplémentaires (gratuit)
Une même langue peut couvrir plusieurs territoires. Piste : renseigner aussi **en-GB, en-CA, en-AU** avec les mêmes textes EN, ce qui multiplie les champs de mots-clés indexés (à vérifier selon la documentation Apple en vigueur au moment de la mise en œuvre). *Cela relève d'une soumission : feu vert David + 10k-steps.dev.*

## 4. Captures d'écran (pistes)
Message principal = **le rythme**, une idée par capture, légende courte en haut. À partir de captures réelles de l'app uniquement.
1. **Dashboard** — « Dans le rythme ou pas ? Réponse en un coup d'œil » / « On pace or not? Answered at a glance »
2. **Moyenne requise** — « Combien de pas par jour pour finir le mois »
3. **Barre de progression colorée** — « Avance ou retard cumulé, en couleur »
4. **Historique – Jours (calendrier)** — « Chaque jour, d'un coup d'œil »
5. **Historique – Mois / Années** — « Mois par mois, année par année »
6. **Confidentialité** — « Gratuit. Sans pub. Aucune donnée collectée. »
- Prévoir FR et EN (légendes localisées). Si vidéo d'aperçu : 15–20 s, parcours dashboard → historique.
- **Mode sombre/clair** : suivre le rendu réel de l'app.

## 5. Vérifications avant toute soumission
- Aucune promesse hors fonctionnalités réelles (ex. pas de « widget », « Apple Watch », « notifications » : non mentionnés dans la fiche ; à ne dire que si vérifié dans le code).
- Cohérence FR/EN, longueurs, absence de répétition mots-clés.
- Feu vert David ; soumission par 10k-steps.dev.

## 6. Mesure
Voir [suivi-resultats.md](suivi-resultats.md) : impressions, vues de page produit, téléchargements, taux de conversion (App Store Connect → Analytics), avant/après chaque changement.

## 6. Choix du nom (nom App Store, par langue) — ajout du 2026-11-09
Aucun volume de recherche mesuré : choix = raisonnement ASO, à valider par test (un changement à la fois, ~2 semaines).

### EN (≤30) — candidats
| Nom | Car. | Mots indexés | Commentaire |
|---|---|---|---|
| **10K Steps: Goal Pace Tracker** | 28 | steps, goal, pace, tracker | **Recommandé** : « 10K steps » (requête connue) + « pace » (différenciateur) + « tracker » |
| 10K Steps Pace Tracker | 22 | steps, pace, tracker | Plus court, laisse 8 car. libres, perd « goal » |
| Step Goal Tracker: 10K Pace | 27 | step, goal, tracker, pace | Très descriptif, moins mémorisable |
| 10K Steps Goal Tracker | 22 | steps, goal, tracker | Sûr mais générique (pas de « pace ») |

### FR (≤30)
Garder **Objectif 10K Pas** (marque, déjà compris). Variante à tester plus tard : « Objectif 10K Pas : Rythme » (25) pour indexer « rythme ».

### Sous-titres associés (pas de répétition avec le nom)
- EN : « Daily, monthly, yearly goals » (28) ou « Ahead or behind, at a glance » — éviter « pace/steps/goal/tracker » déjà dans le nom.
- FR : « Es-tu dans le rythme ? » (proposition A).
- Mots-clés EN : retirer `pace`, `tracker`, `goal`, `steps` s'ils sont dans le nom ; garder pedometer, walking, health, counter, average, habit, monthly, yearly, activity, challenge.

### Décision proposée
EN = « 10K Steps: Goal Pace Tracker » ; FR inchangé. À soumettre via 10k-steps.dev, **après feu vert de David**. Mesurer impressions / téléchargements dans App Store Connect avant et après.

## 7. Données Astro (relevées par David le 2026-11-09) — popularité / difficulté
Échelle Astro (estimations relatives, pas des volumes Apple). « Position » = rang de notre app, supposé (hypothèse).

| Mot-clé | Store | Pop. | Diff. | Position |
|---|---|---|---|---|
| walk 10k | US | 5 | 43 | – |
| 10k steps | US | 5 | 52 | – |
| steps count | US | 5 | 65 | – |
| walking tracker | US | 24 | 76 | – |
| steps | US | 59 | 81 | – |
| step counter | US | 62 | 81 | – |
| walk 10k | FR | 5 | 49 | 22 |
| 10000 pas | FR | 27 | 62 | 150 |
| compteur de pas | FR | 54 | 68 | – |
| podomètre (podometre) | FR | 55 | 56 | – |

Constats : (1) les requêtes « 10K » ont une popularité minimale (5) → « 10K » ne doit pas être le pilier du nom ni de l'ASO ; (2) le volume est sur « step counter / steps / podomètre / compteur de pas » ; (3) FR est plus accessible que US (podomètre 55/56 = meilleur rapport) ; (4) US « step counter » / « steps » = difficulté 81, hors de portée sans avis → viser des longues traînes ; (5) les résultats « walk 10k » sont dominés par des apps de running (10K = course de 10 km).
Piste : marque commune sans « 10K » + suffixe localisé portant « Podomètre » (FR) / « Step Counter » ou « Step Tracker » (EN). À confirmer par une 2e série de relevés (pedometer, step tracker, step goal, daily steps, pace tracker).

### 7bis. 2e série Astro (2026-11-09)
| Mot-clé | Store | Pop. | Diff. | Position |
|---|---|---|---|---|
| step tracker | US | 20 | 83 | – |
| daily steps | US | 5 | 40 | – |
| step goal | US | 22 | 42 | – |
| pace tracker | US | 29 | 61 | – |
| pedometer | US | 57 | 77 | – |
| objectif pas | FR | 5 | 38 | 3 |
| pas quotidien | FR | 5 | 34 | 4 |
| suivi de pas | FR | 5 | 48 | 21 |
| pas par jour | FR | 40 | 66 | 144 |
| 10 000 pas par jour | FR | 5 | 59 | – |

Constats : (1) US — meilleures cibles réalistes : **step goal (22/42)** et **pace tracker (29/61)**, qui collent à notre différenciateur ; « step counter », « pedometer », « step tracker » (77–83) restent hors de portée sans avis. (2) FR — cibles : **podomètre (55/56)**, **pas par jour (40/66, nous : 144)**, compteur de pas (54/68). (3) Nos bons rangs actuels (« objectif pas » 3, « pas quotidien » 4) sont sur des mots-clés de popularité 5 : **changer le nom ne fait perdre aucun trafic réel**.

### Structure de nom proposée (à valider)
- Marque commune courte, **sans « 10K »** (à choisir) ; suffixe localisé :
  - EN : `<Marque>: Step Goal Pace Tracker` (suffixe 22 car. → marque ≤ 6 car.) ; sous-titre à choisir sans répéter les mots du nom.
  - FR : `<Marque> : Podomètre` ; sous-titre « Pas par jour et rythme » (22).
- Apple combine les mots de nom + sous-titre + mots-clés : on couvre « step goal », « pace tracker », « podomètre », « pas par jour » sans répétition.

### 7ter. Candidats de marque (sans « 10K », ≤6 car., sans accent) — 2026-11-09
Aucune disponibilité vérifiée (App Store, domaine, réseaux, marque) : **à faire avant tout choix**.
| Marque | Car. | Angle | Risque |
|---|---|---|---|
| Walkly | 6 | « walk » + diminutif amical | proche de « Little Walks », « Walkr » |
| OnPace | 6 | « dans le rythme » = la promesse | « pace » compris en FR surtout par les sportifs |
| Pacely | 6 | rythme, ton léger | proche de « Pacer » (app connue) |
| Steply | 6 | « step » + ly | générique, probablement pris |
| Tempo | 5 | rythme, FR/EN/IT | très courant, probablement pris |
| Stridy | 6 | « stride » (foulée) | peu clair en FR |
| Pasito | 6 | « petit pas » (ES) | évoque l'espagnol |
| Pasly | 5 | « pas » + ly | moins lisible en EN |
Nom EN complet = marque + `: Step Goal Pace Tracker` (≤30 si marque ≤6).
Vérifs : recherche App Store (FR+US), Astro (popularité du nom), domaine .com/.app, handle Instagram/TikTok, base EUIPO/INPI, prononciation FR/EN.

## 8. Décision de nom : **Walkever** (choix de David, 2026-11-09) — PROPOSITION, rien soumis
Vérifs faites : aucune app « Walkever » sur l'App Store FR/US/GB ; aucune marque trouvée par recherche web (non officiel) ; walkever.com pris (parqué), .app/.fr/.io sans DNS (probablement libres, à confirmer chez un registrar).
**À faire avant soumission** : EUIPO eSearch/TMview, INPI, USPTO (classes 9 et 42) ; Google Play ; handles Instagram/TikTok ; réservation du domaine.

| Champ | EN | car. | FR | car. |
|---|---|---|---|---|
| Nom (≤30) | Walkever: Step Goal Tracker | 27 | Walkever : Podomètre | 20 |
| Sous-titre (≤30) | Pace tracker, ahead or behind | 29 | Pas par jour et rythme | 22 |
| Mots-clés (≤100) | pedometer,walking,counter,health,average,habit,monthly,yearly,activity,10000,daily | 82 | compteur,marche,santé,objectif,habitude,suivi,mensuel,annuel,activité,moyenne,10000,avance,retard | 97 |

Couverture visée : EN « step goal » (22/42), « pace tracker » (29/61), « pedometer » ; FR « podomètre » (55/56), « pas par jour » (40/66), « compteur de pas » (54/68), « 10000 pas ».
Retiré par rapport aux pistes précédentes : « healthkit » (peu cherché), « challenge/défi » (l'app n'a pas de défis : ne pas laisser croire à une fonction inexistante).
Aucun mot du nom/sous-titre n'est répété dans les mots-clés.

### Impacts du renommage (à demander à 10k-steps.dev, après feu vert David)
- Nom App Store par langue (FR/EN) + sous-titre + mots-clés ci-dessus.
- Textes de fiche : remplacer « Objectif 10K Pas » dans docs/store/*/description.txt et promotional_text.txt.
- Nom d'affichage de l'app (app.json) — décision produit à valider ; bundle id inchangé.
- Site vitrine + page-vitrine.md (titres, domaine, politique de confidentialité) ; domaine à choisir/réserver.
- Captures d'écran : prévoir le nom dans les légendes si besoin.
- Mesure : impressions/téléchargements App Store Connect, avant/après (renommer = un seul changement à la fois).
