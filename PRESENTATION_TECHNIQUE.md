# Document de présentation technique – Gestion Financière

## 1. Architecture globale

- **Backend** : API REST Django (Python)
- **Frontend** : React (Vite), SPA
- **Base de données** : MySQL
- **Authentification** : JWT (Simple JWT)
- **CORS** : autorisation du frontend (localhost:3000)

Schéma : Navigateur ↔ Frontend React (:3000) ↔ API Django (:8000) ↔ MySQL

## 2. Technologies

- Backend : Django 4.x, Django REST Framework, Simple JWT, django-cors-headers, django-filter, MySQL (mysqlclient)
- Frontend : React 18, React Router 6, Axios, Vite 5

## 3. Choix techniques

- Django + DRF pour rapidité, ORM, auth, API REST
- React + Vite pour interface réactive et build rapide
- JWT pour auth sans session serveur ; refresh token géré par intercepteur Axios
- Alertes : module `services_alertes.py` + commande `generer_alertes`

## 4. Modèles (résumé)

- **Categorie** : nom, type (entrée/sortie), user
- **Transaction** : type, montant, libellé, catégorie, date, notes
- **Budget** : catégorie, montant prévu, période, année, mois
- **Dette** : type (à recevoir/à payer), libellé, montant, date_echance, partiellement_paye
- **Facture** : numéro, libellé, montant, type, dates, payee
- **Alerte** : type, titre, message, sévérité, lue

## 5. API principale

- `POST /api/auth/inscription/` – Inscription
- `POST /api/auth/token/` – Connexion
- `GET /api/tableau-bord/` – Trésorerie + alertes
- `GET /api/rapports/?periode=mois&annee=2026&mois=3` – Rapports
- CRUD : `/api/transactions/`, `/api/categories/`, `/api/budgets/`, `/api/dettes/`, `/api/factures/`, `/api/alertes/`

## 6. Sécurité

- Mots de passe hashés (Django)
- JWT avec expiration
- CORS restreint
- Données filtrées par utilisateur
