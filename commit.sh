#!/bin/bash
cd /workspaces/Interne-Presence

# Nettoyer le cache
git reset

# Ajouter uniquement les fichiers pertinents
git add CHANGELOG.md
git add GUIDE_INTEGRATION_FRONTEND.md
git add backend/apps/
git add backend/core/
git add backend/manage.py
git add backend/requirements.txt
git add frontend/

# Vérifier les changements
echo "=== Status Git ==="
git status

# Commiter
git commit -m "Mise à jour du projet - corrections de sécurité et améliorations DRF"

# Pousser
git push origin main

echo "✅ Commit et push terminés avec succès!"
