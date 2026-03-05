

## Correction : Shazam Coran → /find-ayah

Le bouton "Shazam Coran" sur l'accueil pointe actuellement vers `/listen-test`. Il faut le rediriger vers `/find-ayah`.

### Modification

**`src/components/dashboard/FeatureBubbles.tsx`** — Changer le `path` de l'entrée `listenTest` de `"/listen-test"` à `"/find-ayah"`.

