# Petites Routines — SPEC.md

## 1. Objectif

Créer une application web plein écran affichée sur l’écran du salon pour aider Jade (CP) et Hugo (petite section de maternelle) à comprendre :

1. ce qu’ils doivent faire maintenant ;
2. ce qui vient ensuite ;
3. le passage d’une étape à une autre ;
4. le temps disponible sans dépendre uniquement d’une horloge abstraite.

L’interface doit être compréhensible de loin, très visuelle et utilisable sans interaction constante.

---

## 2. Utilisateurs

### Hugo
- Environ 3 ans.
- Ne sait pas lire.
- La notion de durée est encore abstraite.
- Comprend surtout :
  - les illustrations ;
  - les routines répétées ;
  - « maintenant / après » ;
  - de petites quantités visuelles.

### Jade
- En CP.
- Peut commencer à relier :
  - activité ;
  - heure ;
  - durée ;
  - ordre des étapes.

L’application doit fonctionner pour les deux simultanément.

---

## 3. Principe UX principal

L’écran répond en permanence à trois questions :

- **Qu’est-ce qu’on fait maintenant ?**
- **Combien de petits temps reste-t-il ?**
- **Qu’est-ce qu’on fait après ?**

L’interface principale est en plein écran.

Une seule étape est dominante à la fois.

---

## 4. Routines

### Routine du soir

Ordre :

1. Devoirs
2. Douche
3. Repas
4. Toilettes
5. Dents
6. Dodo

### Routine du matin

Ordre :

1. Réveil
2. Petit-déjeuner
3. Habillage
4. Dents
5. Cartable / départ

---

## 5. Horaires configurables

Les horaires NE DOIVENT PAS être codés en dur.

Il faut une page de paramètres permettant de modifier les horaires de chaque routine.

Exemple :

```ts
type RoutineStep = {
  id: string
  label: string
  image: string
  color: string

  // heure à laquelle cette étape devient active
  startTime: string // "HH:mm"
}

type Routine = {
  id: "morning" | "evening"
  label: string
  enabled: boolean
  steps: RoutineStep[]
}
```

Exemple de configuration :

```ts
const eveningRoutine = {
  id: "evening",
  label: "Routine du soir",
  steps: [
    { id: "homework", label: "Devoirs", startTime: "18:10" },
    { id: "shower", label: "Douche", startTime: "18:35" },
    { id: "dinner", label: "Repas", startTime: "19:05" },
    { id: "toilet", label: "Toilettes", startTime: "19:50" },
    { id: "teeth", label: "Dents", startTime: "20:00" },
    { id: "sleep", label: "Dodo", startTime: "20:15" }
  ]
}
```

Les horaires ci-dessus ne sont que des exemples.

Ils doivent être modifiables dans l’interface.

---

## 6. Détermination automatique de l’étape active

L’application compare l’heure actuelle avec les horaires configurés.

Exemple :

- Devoirs : 18:10
- Douche : 18:35
- Repas : 19:05

À 18:22 :

```txt
étape active = Devoirs
étape suivante = Douche
```

À 18:42 :

```txt
étape active = Douche
étape suivante = Repas
```

Pseudo-code :

```ts
function getCurrentStep(steps, now) {
  return steps
    .filter(step => timeToMinutes(step.startTime) <= timeToMinutes(now))
    .at(-1)
}
```

À chaque changement d’heure configuré, l’écran passe automatiquement à l’étape suivante.

---

## 7. Override manuel

Très important : la vie réelle ne suit pas exactement le planning.

Il faut donc pouvoir :

- passer manuellement à l’étape suivante ;
- revenir à l’étape précédente ;
- éventuellement reprendre le mode automatique.

Exemple de contrôles réservés aux parents :

```txt
← Étape précédente
Mode auto
Étape suivante →
```

Ces contrôles ne doivent pas prendre de place dans l’interface enfant.

Ils peuvent être accessibles :
- via un bouton discret ;
- via un appui long ;
- via une route `/settings`.

---

## 8. Affichage enfant

Exemple :

```txt
┌─────────────────────────────────┐
│                                 │
│            [IMAGE]              │
│                                 │
│             DOUCHE              │
│                                 │
│             ● ● ●               │
│                                 │
│       Ensuite : 🍽 Repas         │
│                                 │
└─────────────────────────────────┘
```

Priorité visuelle :

1. illustration ;
2. nom de l’étape ;
3. petits temps restants ;
4. étape suivante.

---

## 9. Unités visuelles de temps

Une unité représente par défaut 5 minutes.

Exemple :

```txt
● ● ●
```

= environ 15 minutes.

Pour Hugo, ces unités restent simplement des objets qui disparaissent progressivement.

Pour Jade, on peut éventuellement afficher en complément :

```txt
● ● ●
15 min
```

La durée doit être calculée automatiquement à partir de :

```txt
heure de début de l’étape suivante
-
heure de début de l’étape actuelle
```

Exemple :

```txt
Douche 18:35
Repas 19:05
```

Durée disponible :

```txt
30 minutes = 6 unités
```

---

## 10. Comportement des unités de temps

Si une étape commence à 18:35 et la suivante à 19:05 :

```txt
18:35 → ● ● ● ● ● ●
18:40 → ● ● ● ● ●
18:45 → ● ● ● ●
...
19:00 → ●
19:05 → changement automatique
```

Ne pas afficher de pourcentage ni de progress bar.

---

## 11. Couleurs des étapes

Les mêmes catégories doivent conserver les mêmes couleurs.

Palette proposée :

```ts
const colors = {
  sleep: "#404066",
  water: "#85C7F9",
  hygiene: "#8FC8A9",
  food: "#FFB16F",
  dressing: "#E2793B",
  school: "#A4A4BD",
  toilet: "#F6D77A",
  background: "#FEF9D9",
  ink: "#443329"
}
```

Correspondances :

### Soir

```txt
Devoirs   → school
Douche    → water
Repas     → food
Toilettes → toilet
Dents     → hygiene
Dodo      → sleep
```

### Matin

```txt
Réveil          → sleep
Petit-déjeuner  → food
Habillage       → dressing
Dents           → hygiene
Cartable        → school
```

---

## 12. Illustrations

Les illustrations des routines doivent être stockées dans :

```txt
/public/routines/
```

Noms recommandés :

```txt
homework.png
shower.png
dinner.png
toilet.png
teeth.png
sleep.png
breakfast.png
dressing.png
schoolbag.png
```

Les illustrations doivent être prioritaires sur le texte.

---

## 13. Page Settings

Créer une route :

```txt
/settings
```

Elle permet de :

### Modifier la routine du matin

Exemple :

```txt
Réveil           07:00
Petit-déjeuner   07:10
Habillage        07:30
Dents            07:45
Cartable         07:50
Départ           08:00
```

### Modifier la routine du soir

Exemple :

```txt
Devoirs      18:10
Douche       18:35
Repas        19:05
Toilettes    19:50
Dents        20:00
Dodo         20:15
```

Les valeurs doivent être sauvegardées.

Pour le MVP :

```txt
localStorage
```

est suffisant.

Pas de backend nécessaire.

---

## 14. Sélection automatique matin / soir

L’application doit pouvoir déterminer automatiquement quelle routine afficher.

Exemple simple :

```txt
05:00 → 12:00 : routine du matin
16:00 → 23:00 : routine du soir
```

Les plages pourront être configurables plus tard.

Il doit également être possible de forcer manuellement :

```txt
Routine du matin
Routine du soir
```

---

## 15. Mode hors routine

Quand aucune routine n’est active, éviter un écran vide.

Afficher quelque chose de très calme :

```txt
☀️ Bonne journée
```

ou

```txt
🏡 Temps libre
```

L’écran ne doit pas devenir une source de stimulation permanente.

---

## 16. Contraintes UI

- Plein écran.
- Pensé pour un écran de salon.
- Compréhensible à plusieurs mètres.
- Très peu de texte.
- Gros caractères.
- Pas de dashboard complexe.
- Pas de navigation visible pendant la routine.
- Pas de score.
- Pas de classement entre les enfants.
- Pas de message « en retard » associé à un enfant.
- Transitions douces.
- Les illustrations restent l’élément principal.

---

## 17. Stack recommandée

```txt
Next.js
React
TypeScript
CSS / Tailwind ou système UI léger
localStorage
PWA optionnelle
```

Le MVP ne nécessite :

- ni compte ;
- ni authentification ;
- ni base de données ;
- ni backend.

---

## 18. Architecture proposée

```txt
app/
├── page.tsx
├── settings/
│   └── page.tsx
├── components/
│   ├── RoutineScreen.tsx
│   ├── CurrentStep.tsx
│   ├── TimeTokens.tsx
│   ├── NextStep.tsx
│   └── ParentControls.tsx
├── hooks/
│   ├── useCurrentRoutine.ts
│   └── useRoutineSettings.ts
├── lib/
│   ├── routines.ts
│   └── time.ts
└── public/
    └── routines/
```

---

## 19. Première version à implémenter

Priorité absolue :

1. configuration des horaires ;
2. sauvegarde localStorage ;
3. détection automatique de l’étape active ;
4. écran full screen ;
5. illustration de l’étape ;
6. couleur de fond liée à l’étape ;
7. affichage de l’étape suivante ;
8. unités visuelles de 5 minutes ;
9. contrôles parent suivant / précédent ;
10. sélection matin / soir.

Ne pas commencer par de la gamification, des statistiques ou un backend.

---

## 20. Critère de succès

Le MVP est réussi si Jade et Hugo peuvent regarder l’écran du salon et comprendre rapidement :

```txt
ce qu’on fait maintenant
+
ce qu’on fera ensuite
```

et si les parents ont moins besoin de répéter :

```txt
« Allez, dépêchez-vous »
```

L’application doit aider les transitions, pas ajouter une contrainte supplémentaire.

---

## 21. Évolution : flows par jour et catalogue d’activités

La configuration ne se limite plus à deux routines fixes. Un parent peut créer, nommer, activer et supprimer autant de flows que nécessaire. Chaque flow choisit ses jours de la semaine et contient une liste d’étapes avec une activité et une heure de début. Les étapes peuvent être ajoutées et supprimées ; elles sont affichées dans l’ordre des horaires.

Les activités sont définies dans un catalogue commun. Le parent peut en créer, renommer ou supprimer, choisir leur illustration parmi les images fournies ou importer une image locale, et choisir leur couleur dans la palette autorisée. Une modification d’activité s’applique à toutes ses occurrences dans les flows.

L’écran enfant choisit automatiquement un flow actif pour le jour courant autour de ses horaires. Si plusieurs flows correspondent, celui dont la première étape commence le plus tard est affiché. Le parent peut toujours sélectionner manuellement un autre flow actif puis revenir au mode automatique. Quand aucun flow ne correspond, l’écran reste calme.

La configuration reste locale au navigateur dans `localStorage`. Les horaires enregistrés dans la première version sont récupérés lors de la migration vers ce modèle.
