# Application de Gestion Financière Simplifiée & Intelligente

Solution web pour PME, TPE, commerçants et entrepreneurs : suivi des finances en temps réel, tableau de bord, rapports et alertes intelligentes.

## Stack technique
- **Backend** : Django + Django REST Framework
- **Frontend** : React.js
- **Base de données** : MySQL

## Démarrage rapide

### Backend (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
# Configurer .env (voir GUIDE_INSTALLATION.md)
python manage.py migrate
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

Voir **GUIDE_INSTALLATION.md** pour les détails complets.

## Déploiement

- **Render** (recommandé) : voir **DEPLOIEMENT_RENDER.md**
- **Railway** : voir **DEPLOIEMENT_RAILWAY.md**
