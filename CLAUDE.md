# 10k — Notes pour Claude

## Conventions

### Formatage des pas
- Les pas ne doivent **jamais** afficher de décimales (pas de `9321.13`, uniquement `9321` ou `9.3k`).
- Utiliser `Math.round()` avant tout `toLocaleString('fr-FR')`.
- La fonction `fmtK` (définie dans chaque écran) gère l'affichage : `>= 1000` → format `k` (ex. `9.3k`), sinon entier localisé.

### Jours restants dans le mois
- `daysRemaining` **inclut aujourd'hui** : `daysInMonth - dayOfMonth + 1`.
- La carte "MOYENNE REQUISE" affiche `sur X jours (incluant aujourd'hui)`.

### Locale
- Tous les nombres sont formatés en `fr-FR`.
