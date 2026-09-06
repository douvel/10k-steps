# 10k — Notes pour Claude

## Conventions

### Formatage des pas
- Les pas ne doivent **jamais** afficher de décimales (pas de `9321.13`, uniquement `9321` ou `9.3k`).
- Utiliser `Math.round()` avant tout `toLocaleString(localeTag)`.
- La fonction `fmtK` (`utils/format.ts`, partagée par tous les écrans — ne pas la redéfinir localement) gère l'affichage : `>= 1_000_000` → format `M` (ex. `3.1M`), `>= 1000` → format `k` (ex. `9.3k`), sinon entier localisé.

### Jours restants dans le mois
- `daysRemaining` **inclut aujourd'hui** : `daysInMonth - dayOfMonth + 1`.
- La carte "MOYENNE REQUISE" affiche `sur X jours (incluant aujourd'hui)`.
- Toggle "exclure aujourd'hui" disponible sur la carte : utilise `daysRemaining - 1`.
- Le toggle est **masqué le dernier jour du mois** (`daysRemaining === 1`), car exclure aujourd'hui ne laisserait aucun jour.

### Locale et traductions (`i18n/`)
- Anglais par défaut ; passe en français si la langue de l'appareil (`expo-localization`) est `fr`. Voir `i18n/index.ts` (résolution de la locale) et `i18n/locales/{en,fr}.ts` (textes).
- Pour ajouter une langue : créer `i18n/locales/<code>.ts` (même forme que `en.ts`, typé via `Translations`), puis l'ajouter à `translations` dans `i18n/index.ts`.
- Tous les textes UI passent par `t.<namespace>.<clé>` (import `{ t, localeTag } from '../../i18n'`) — ne jamais hardcoder de chaîne visible à l'écran.
- Tous les nombres/dates sont formatés via `localeTag` (ex. `toLocaleString(localeTag)`, `toLocaleDateString(localeTag, ...)`), jamais `'fr-FR'` en dur.
- `expo-localization` nécessite un rebuild natif (`pod install` + rebuild Xcode) après installation — un `patch-package` (`patches/expo-localization+16.0.1.patch`) corrige un `switch` Swift non exhaustif dans le module sur les toolchains iOS récents (26.x) ; `npm install` l'applique automatiquement via `postinstall`.
- Les descriptions HealthKit (`NSHealthShareUsageDescription`/`NSHealthUpdateUsageDescription`) sont en anglais dans `app.json` (langue par défaut) ; elles ne suivent pas automatiquement la langue de l'app côté iOS natif (nécessiterait des `.lproj`/`InfoPlist.strings`, non mis en place).

## Architecture UI (Dashboard)

### Barre de progression mensuelle (`MonthlyProgressBar`)
- Affichée entre le hero et la grille de cartes.
- Encapsulée dans une carte avec titre "PROGRESSION DU MOIS".
- Contient : total/objectif en labels, % centré, barre orange, repère "rythme idéal" (trait blanc = `dayOfMonth / daysInMonth`).
- Couleur dynamique via `getPaceState` (voir ci-dessous).

### Système de couleurs / états (`getPaceState`)
Définie dans `utils/pace.ts` (testée dans `utils/__tests__/pace.test.ts`), importée par `index.tsx`. Calcule couleur + emoji + label en fonction de `(dailyAverage - dailyGoal) / dailyGoal` :

| Ratio | Couleur | Emoji | Label |
|---|---|---|---|
| Objectif mensuel atteint | `#F59E0B` or | 👏 | Objectif du mois atteint ! |
| < −10% | `#DC2626` rouge vif | 😰 | X pas/j de retard |
| −10% à −4% | `#EF4444` rouge | 😥 | X pas/j de retard |
| −4% à −1% | `#3B82F6` bleu | 😯 | X pas/j de retard |
| ±1% | `#3B82F6` bleu | 🫡 | Dans les temps |
| +1% à +4% | `#3B82F6` bleu | 👍 | +X pas/j d'avance |
| +4% à +10% | `#4ADE80` vert clair | 💪 | +X pas/j d'avance |
| > +10% | `#16A34A` vert foncé | 🤩 | +X pas/j d'avance |

- Cette couleur s'applique à la barre, au %, au label sous la barre.
- Le badge PaceBadge (hero) a été supprimé — l'info est uniquement sous la barre mensuelle.
- Le label sous la barre affiche par défaut le **retard/avance total cumulé** (`monthlyTotal − dailyGoal × daysElapsed`), ex. `3 600 pas de retard`. **Tap** sur le label → bascule vers la version journalière (`X pas/j de retard`). State local au composant, pas de persistence.

### Carte "MOYENNE REQUISE"
- Toggle Switch (sans texte) en bas à droite du sous-titre pour exclure aujourd'hui.
- Le sous-titre change : "sur X jours (incluant aujourd'hui)" ↔ "sur X jours (à partir de demain)".

## Données santé (HealthKit / Health Connect)

### Fetch partagé (`contexts/HealthDataContext.tsx`)
- `useHealthData()` et `useHealthHistory()` (dans `hooks/`) ne doivent **jamais** être appelés directement depuis un écran — toujours passer par `useSharedHealthData()` / `useSharedHealthHistory()` (`contexts/HealthDataContext.tsx`).
- `HealthDataProvider` est monté une seule fois dans `app/(tabs)/_layout.tsx` et fait le fetch une seule fois pour toute la session ; sans ça, changer d'onglet (Dashboard ↔ Historique ↔ sous-onglets Jours/Mois/Années) redéclenche un fetch HealthKit complet à chaque montage.
- Le provider écoute aussi `AppState` : au retour au premier plan (background → active), il relance `refresh()` sur les deux hooks pour ne pas afficher des données figées.
- Les deux hooks ont chacun besoin d'initialiser HealthKit/Health Connect ; `hooks/nativeHealthInit.ts` (`initHealthKitOnce`/`initHealthConnectOnce`) met en cache la promesse d'init en cours pour qu'un montage simultané des deux hooks ne déclenche **qu'un seul** round-trip natif au lieu de deux. Le cache se vide une fois la promesse réglée, donc un `refresh()` ultérieur relance bien un init frais.

### Erreurs typées (`HealthErrorKind`)
Les deux hooks classifient toute erreur de fetch en trois catégories (voir le type `HealthErrorKind` dans `hooks/useHealthData.ts`/`useHealthHistory.ts`) :
- `'unavailable'` — module natif absent (Expo Go) ou timeout simulateur : **seul** ce cas affiche des données factices (`isMockData: true`), utile en dev.
- `'permission-denied'` — accès santé explicitement refusé (détectable seulement sur Android/Health Connect ; iOS ne renseigne jamais l'état de permission par design HealthKit).
- `'unknown'` — vraie erreur inattendue sur un appareil réel.
- Pour `'permission-denied'` et `'unknown'`, ne **jamais** fabriquer de pas : l'état retourné est honnête (zéros + `error`/`errorKind`). Seul `'unavailable'` mock des données.
- La bannière du Dashboard (`index.tsx`) distingue les trois textes (`mockBannerText` / `permissionDeniedBannerText` / `errorBannerText` dans `i18n/`).

## Bug connu — Lag HealthKit après minuit
`getDailyStepCountSamples` peut mettre plusieurs heures à finaliser les données du jour qui vient de se terminer. Fix appliqué dans **les deux** hooks (`useHealthData.ts` pour `monthHistory`, `useHealthHistory.ts` pour les totaux du mois/année en cours) : on appelle aussi `getStepCount` sur **hier** (endpoint temps réel) et on patche la valeur historique si elle est inférieure à la valeur live. Si une nouvelle vue agrège des pas côté iOS, penser à répliquer ce patch — sinon son total peut diverger du Dashboard pendant les quelques heures qui suivent minuit.

## Tests
- Jest (`jest-expo`) est configuré (`npm test`), mais uniquement pour les fonctions **pures** extraites dans `utils/` (`format.ts`, `pace.ts`, `monthProgress.ts`, `historyStats.ts`) — pas de rendu de composants pour l'instant.
- Toute nouvelle logique de calcul (dates, pas, moyennes, états) doit être écrite comme fonction pure dans `utils/` plutôt qu'inline dans un écran, pour rester testable. Voir `utils/__tests__/` pour les exemples et les cas limites déjà couverts (arrondis autour du seuil `k`, `daysRemaining` le dernier jour du mois, seuils exacts de `getPaceState`, etc.).
- `historyStats.ts` (`computeMonthlyStats`/`computeYearlyStats`) porte les agrégations de l'écran Historique (meilleur mois/année, total, mois au-dessus de l'objectif) ; utilisées via `useMemo` dans `history.tsx` (`MoisView`/`AnneesView`) plutôt que recalculées à chaque render.

## Accessibilité — graphiques de l'écran Historique
- `BarChart` (SVG, `history.tsx`) prend un `accessibilityLabel` **obligatoire** : chaque vue (Jours/Mois/Années) le compose à partir de fragments déjà traduits (`t.history.*`, `t.common.average`/`total`) plutôt que d'ajouter une chaîne en dur.
- `CalendarHeatmap` : chaque cellule de jour est individuellement accessible (`accessibilityRole="text"`), via les clés `t.history.dayCellA11yLabel`/`dayCellFutureA11yLabel`.

## Dépendances natives
- `react-native-reanimated` est une **peer dependency d'`expo-router`** (utilisée en interne par `@react-navigation/native-stack`/`bottom-tabs`) même si aucun écran ne l'importe directement — ne pas la retirer en la croyant inutilisée.
- `react-native-gesture-handler` a été retirée (aucun usage, ni direct ni transitif). Après toute modification des dépendances natives, lancer `cd ios && pod install` (avec `LANG=en_US.UTF-8` si CocoaPods râle sur l'encodage) avant le prochain build iOS.
