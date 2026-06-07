# Render deployment guide

## 1) Préparer le backend

1. `backend/requirements.txt` doit contenir au moins :
   - `Django==6.0.5`
   - `djangorestframework`
   - `djangorestframework-simplejwt`
   - `django-cors-headers`
   - `gunicorn`
   - `dj-database-url`

2. Vérifier que `backend/core/settings.py` utilise `DATABASE_URL` et lit `ALLOWED_HOSTS` / CORS depuis l'environnement.

3. Ajouter un `backend/Dockerfile` si nécessaire :

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
ENV PYTHONUNBUFFERED=1
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
```

4. Ajouter `backend/.dockerignore` pour exclure les fichiers de build et les secrets.

## 2) Préparer le frontend

1. Vérifier `frontend/package.json` et `frontend/next.config.ts`.
2. Ajouter un `frontend/Dockerfile` :

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

3. Ajouter `frontend/.dockerignore` pour exclure `node_modules`, `.next`, `out`, etc.

## 3) Variables d'environnement Render

Pour le backend :
- `SECRET_KEY`
- `DJANGO_DEBUG=False`
- `DATABASE_URL` (PostgreSQL, par exemple `postgres://user:pass@host:port/dbname`)
- `ALLOWED_HOSTS` (Render host ou `*` pour tests)
- `CORS_ALLOW_ALL_ORIGINS=True` ou `CORS_ALLOWED_ORIGINS=https://mon-frontend-render.app` 
- `FRONTEND_BASE_URL=https://<mon-frontend-render>.onrender.com`
- `PAYPAL_MODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` si utilisé

Pour le frontend :
- `NEXT_PUBLIC_API_BASE_URL=https://<mon-backend-render>.onrender.com/api`
- `NODE_ENV=production`

> Important : avec deux services Render séparés, le frontend doit appeler le backend via `NEXT_PUBLIC_API_BASE_URL`, pas via `/api/`.

## 4) Déploiement Render de A à Z

1. Créer un dépôt Git et pousser sur GitHub.
2. Se connecter à Render et créer deux services `Web Service` basés sur Docker :
   - backend : `backend/Dockerfile`
   - frontend : `frontend/Dockerfile`
3. Configurer les branches et les variables d'environnement.
4. Déployer.
5. Vérifier les logs Render pour les erreurs de build ou démarrage.

## 5) Tests après déploiement

1. Ouvrir le frontend Render.
2. Vérifier que la page charge et que les requêtes API vont bien vers le backend.
3. Tester `POST /api/token/` et `GET /api/home/`.
4. Vérifier que le backend redirige `/` vers `FRONTEND_BASE_URL` si nécessaire.

## 6) Notes supplémentaires

- Si vous utilisez PostgreSQL Render Database, définissez `DATABASE_URL` dans Render.
- Si le frontend doit appeler le backend, `api.ts` doit utiliser `NEXT_PUBLIC_API_BASE_URL` en production.
- Pour le déploiement Render, privilégier Docker pour isoler les environnements.
