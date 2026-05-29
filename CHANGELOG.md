# Compte rendu des modifications

Ce fichier liste les ajustements appliqués au projet et sera mis à jour à chaque nouvelle intervention.

## 2026-05-28

- Correction de la configuration des apps locales dans `backend/apps/*/apps.py` pour utiliser `apps.<nom_app>`.
- Ajout de `backend/apps/__init__.py` afin de déclarer le package `apps`.
- Amélioration des vues et de la sécurité DRF :
  - `apps/orders/views.py` : utilisation de `get_object_or_404` pour la récupération de produit.
  - `apps/orders/views.py` : restriction de `RemoveCartItemView` aux éléments du panier de l’utilisateur connecté.
  - `apps/products/views.py` : optimisation des requêtes avec `select_related('vendor', 'category')`.
  - `apps/products/views.py` : activation des filtres `SearchFilter` et `OrderingFilter`.
  - `apps/products/views.py` : utilisation de `get_object_or_404` pour récupérer le vendor du produit.
  - `apps/vendors/views.py` : récupération du vendor connecté avec `get_object_or_404`.
  - `apps/vendors/views.py` : optimisation des querysets avec `select_related('user')`.
  - `backend/core/settings.py` : ajout de `DEFAULT_PERMISSION_CLASSES = IsAuthenticatedOrReadOnly`.
- Ajout d’un `UserManager` personnalisé dans `backend/apps/users/models.py` pour un meilleur support de l’authentification par email.
- Inclusion de `apps.orders.urls` dans `backend/core/urls.py`.

> À chaque nouvel ajustement, je mettrai à jour ce fichier avec un résumé clair des modifications.
