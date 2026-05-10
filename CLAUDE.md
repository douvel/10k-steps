# 10k — Notes pour Claude

## Conventions

### Formatage des pas
- Les pas ne doivent **jamais** afficher de décimales (pas de `9321.13`, uniquement `9321` ou `9.3k`).
- Utiliser `Math.round()` avant tout `toLocaleString('fr-FR')`.
- La fonction `fmtK` (définie dans chaque écran) gère l'affichage : `>= 1000` → format `k` (ex. `9.3k`), sinon entier localisé.

### Jours restants dans le mois
- `daysRemaining` **inclut aujourd'hui** : `daysInMonth - dayOfMonth + 1`.
- La carte "MOYENNE REQUISE" affiche `sur X jours (incluant aujourd'hui)`.
- Toggle "exclure aujourd'hui" disponible sur la carte : utilise `daysRemaining - 1`.
- Le toggle est **masqué le dernier jour du mois** (`daysRemaining === 1`), car exclure aujourd'hui ne laisserait aucun jour.

### Locale
- Tous les nombres sont formatés en `fr-FR`.

## Architecture UI (Dashboard)

### Barre de progression mensuelle (`MonthlyProgressBar`)
- Affichée entre le hero et la grille de cartes.
- Encapsulée dans une carte avec titre "PROGRESSION DU MOIS".
- Contient : total/objectif en labels, % centré, barre orange, repère "rythme idéal" (trait blanc = `dayOfMonth / daysInMonth`).
- Couleur dynamique via `getPaceState` (voir ci-dessous).

### Système de couleurs / états (`getPaceState`)
Calcule couleur + emoji + label en fonction de `(dailyAverage - dailyGoal) / dailyGoal` :

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

## Bug connu — Lag HealthKit après minuit
`getDailyStepCountSamples` peut mettre plusieurs heures à finaliser les données du jour qui vient de se terminer. Fix dans `useHealthData.ts` : on appelle aussi `getStepCount` sur **hier** (endpoint temps réel) et on patche `monthHistory` si la valeur historique est inférieure à la valeur live.
