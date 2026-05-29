# ✅ Guide de Connexion Admin - Flux Complet Fonctionnel

## Problème Résolu

**Erreur initiale:** `AxiosError: Network Error` lors du login via le frontend

**Cause:** La configuration d'API utilisait un proxy Next.js qui n'était pas fonctionnel en mode développement. Le frontend tentait de rediriger via `/api/` mais rencontrait des erreurs de réécriture (308 redirects).

## Solution Implémentée

### 1. **Configuration Modifiée: API Client (`frontend/src/services/api.ts`)**

La configuration utilise maintenant une URL directe au backend en développement:

```typescript
// En développement: http://localhost:8000/api/
// En production: /api/ (via proxy Next.js)
const baseURL = (process.env.NODE_ENV === 'development') 
  ? 'http://localhost:8000/api/'
  : process.env.NEXT_PUBLIC_API_BASE_URL || '/api/';
```

### 2. **Configuration du Proxy (`frontend/next.config.ts`)**

Gardée pour la production, mais contournée en développement.

### 3. **Backend Configuration (`backend/core/settings.py`)**

- ✅ `CORS_ALLOW_ALL_ORIGINS = True` (accepte les requêtes cross-origin)
- ✅ JWT Authentication configurée
- ✅ Custom TokenObtainPairSerializer pour accepter email comme username

## Comment Utiliser

### Démarrer les serveurs:

```bash
# Terminal 1: Backend Django
cd backend
python manage.py runserver 127.0.0.1:8000

# Terminal 2: Frontend Next.js
cd frontend
npm run dev
```

### Accéder au frontend:
- **URL:** http://localhost:3000
- **Page de login:** http://localhost:3000/login

### Identifiants Admin:
- **Email:** `julientsila@gmail.com`
- **Mot de passe:** `silentehacking`

## Flux de Connexion Validé ✅

```
1. Frontend (http://localhost:3000/login)
   ↓
2. POST http://localhost:8000/api/token/
   Body: { username: "julientsila@gmail.com", password: "silentehacking" }
   ↓
3. Backend retourne JWT tokens
   Response: { access: "eyJ...", refresh: "eyJ..." }
   ↓
4. Frontend stocke tokens dans localStorage
   AFRIMARKET_ACCESS_TOKEN
   AFRIMARKET_REFRESH_TOKEN
   ↓
5. Frontend redirige vers la page d'accueil
   ↓
6. Les tokens sont utilisés pour accéder aux routes protégées
   Header: Authorization: Bearer eyJ...
```

## Tests Effectués ✅

| Test | Résultat |
|------|----------|
| Login direct au backend (curl) | ✅ PASS |
| Login via API client (simulated) | ✅ PASS |
| Accès aux routes protégées | ✅ PASS |
| Token refresh | ✅ PASS |
| CORS headers | ✅ PASS |

## Fichiers Modifiés

1. **`frontend/src/services/api.ts`** - Configuration directe de l'API en développement
2. **`backend/apps/users/serializers.py`** - Custom TokenObtainPairSerializer
3. **`backend/apps/users/views.py`** - Custom TokenObtainPairView
4. **`backend/core/urls.py`** - Route pointant vers CustomTokenObtainPairView

## Migration de la Base de Données

La migration du modèle Cart (avec guest_token) a été appliquée:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Points d'Attention

⚠️ **Mode Développement:**
- L'API utilise `http://localhost:8000/api/`
- Assurez-vous que le backend écoute sur `127.0.0.1:8000`
- Assurez-vous que le frontend écoute sur `127.0.0.1:3000`

⚠️ **Mode Production:**
- Modifiez `NEXT_PUBLIC_API_BASE_URL` pour pointer vers le backend production
- Le proxy Next.js sera utilisé si `NEXT_PUBLIC_API_BASE_URL` n'est pas défini
- Mettez à jour `CORS_ALLOW_ALL_ORIGINS` pour être plus restrictif

## Prochaines Étapes Recommandées

1. **Tester le flux guest checkout** (panier sans connexion)
2. **Implémenter les routes de profil utilisateur** (GET, PUT)
3. **Tester l'intégration PayPal** pour les paiements
4. **Implémenter la déconnexion** (suppression des tokens localStorage)
5. **Ajouter la protection des routes** (redirection vers login si non authentifié)

## Support

Pour déboguer les problèmes de connexion:

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet Network
3. Faites un login et inspectez les requêtes
4. Vérifiez que les headers Authorization sont envoyés correctement
5. Vérifiez les logs du backend Django
