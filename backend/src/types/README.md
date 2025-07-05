# Types Supabase

## Génération des types

### 1. Installer Supabase CLI

```bash
brew install supabase/tap/supabase
```

### 2. Se connecter

```bash
supabase login
```

### 3. Générer les types
Id du projet visible dans l'url du dashboard supabase

```bash
supabase gen types typescript --project-id <id du projet> > src/types/supabase.types.ts
```

## Utilisation

### Types complexes (générés automatiquement)

```typescript
import type { Database } from '@/types/supabase.types';

type User = Database['public']['Tables']['user']['Row'];
```


## Workflow

1. **Modifier la base de données** dans Supabase
2. **Régénérer les types** : `supabase gen types typescript --project-id qjvmdelpwiqlomrsbvmv > src/types/supabase.types.ts`
3. **Mettre à jour les alias** dans `db.types.ts` si nécessaire

## Notes

- Le fichier `supabase.types.ts` est **automatiquement généré** - ne pas modifier
- Le fichier `db.types.ts` contient des **alias manuels** pour faciliter l'utilisation
- Les types sont **toujours synchronisés** avec votre base de données
