# Git Hooks Configuration

## Pre-commit Hook

Un hook pre-commit a été configuré pour automatiquement vérifier le code avant chaque commit.

### Fonctionnement

Le hook `pre-commit` :

1. Se déclenche automatiquement avant chaque commit
2. Exécute `npm run lint` dans le dossier `frontend/`
3. Empêche le commit si des erreurs ESLint sont détectées
4. Ignore les warnings pnpm non critiques

### Messages

- ✅ **"Lint check passed!"** : Le commit peut continuer
- ⚠️ **"Warning: pnpm not found"** : Warning ignoré, le commit continue
- ❌ **"Lint check failed!"** : Le commit est bloqué, corrigez les erreurs

### Comment corriger les erreurs

Si le commit est bloqué par des erreurs ESLint :

```bash
cd frontend
npm run lint
```

Puis corrigez les erreurs affichées et recommittez.

### Désactiver temporairement le hook

Pour désactiver temporairement le hook (non recommandé) :

```bash
git commit --no-verify -m "votre message"
```

### Fichier du hook

Le hook se trouve dans : `.git/hooks/pre-commit`
