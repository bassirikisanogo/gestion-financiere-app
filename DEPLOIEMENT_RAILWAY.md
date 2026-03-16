# Déploiement sur Railway

Ce guide décrit comment déployer l’application **Gestion Financière** (Django + React + MySQL) sur [Railway](https://railway.app).

---

## 1. Prérequis

- Un compte **Railway** (gratuit) : https://railway.app
- Le projet poussé sur **GitHub** (ou GitLab) pour connecter le dépôt

---

## 2. Créer un projet Railway

1. Allez sur https://railway.app et connectez-vous.
2. **New Project** → **Deploy from GitHub repo** (ou **Empty Project** puis lien au repo).
3. Choisissez le dépôt du projet.

Vous allez créer **3 services** dans ce projet :
- **MySQL** (base de données)
- **Backend** (Django)
- **Frontend** (React)

---

## 3. Service MySQL

1. Dans le projet, cliquez sur **+ New** → **Database** → **Add MySQL**.
2. Une fois créé, ouvrez le service MySQL → onglet **Variables** (ou **Connect**).
3. Notez (ou copiez) : **MYSQLHOST**, **MYSQLPORT**, **MYSQLUSER**, **MYSQLPASSWORD**, **MYSQLDATABASE** (souvent `railway`). Vous en aurez besoin pour le backend.

---

## 4. Service Backend (Django)

1. **+ New** → **GitHub Repo** (ou **Empty Service** puis connectez le repo).
2. Sélectionnez le **même dépôt**.
3. Dans les paramètres du service :
   - **Root Directory** : `backend`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : laisser vide (le `Procfile` sera utilisé) ou mettre :
     ```bash
     python manage.py migrate --noinput && gunicorn config.wsgi --bind 0.0.0.0:$PORT
     ```
   - **Watch Paths** : `backend/**` (optionnel)

4. **Variables** (onglet **Variables** du service backend) : ajoutez les variables suivantes.

   Utilisez les valeurs du service MySQL (préfixe `MYSQL` → `DB_` pour Django) :

   | Variable          | Valeur (exemple / à adapter) |
   |-------------------|------------------------------|
   | `DJANGO_SECRET_KEY` | Une clé secrète longue et aléatoire |
   | `DEBUG`           | `False` |
   | `ALLOWED_HOSTS`   | `.railway.app,.up.railway.app` (ou après déploiement, ajoutez l’URL réelle du backend) |
   | `DB_NAME`         | Valeur de **MYSQLDATABASE** (ex. `railway`) |
   | `DB_USER`         | Valeur de **MYSQLUSER** |
   | `DB_PASSWORD`     | Valeur de **MYSQLPASSWORD** |
   | `DB_HOST`         | Valeur de **MYSQLHOST** (ex. `containers-us-west-xxx.railway.app`) |
   | `DB_PORT`         | Valeur de **MYSQLPORT** (ex. `6543`) |
   | `CORS_ORIGINS`    | À remplir **après** le déploiement du frontend (URL publique du frontend, ex. `https://votre-front.up.railway.app`) |

   **Option** : si Railway propose de **référencer** les variables du service MySQL (ex. `${{MySQL.MYSQLHOST}}`), vous pouvez l’utiliser pour `DB_HOST`, `DB_USER`, etc.

5. Déployez : **Deploy** (ou push sur GitHub si le déploiement automatique est activé).
6. Une fois le déploiement réussi, ouvrez **Settings** → **Networking** → **Generate Domain**. Notez l’URL du backend (ex. `https://backend-xxx.up.railway.app`). L’API sera accessible à `https://votre-backend.up.railway.app/api/`.

---

## 5. Service Frontend (React)

1. **+ New** → **GitHub Repo** (même dépôt).
2. Paramètres du service :
   - **Root Directory** : `frontend`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npx serve -s dist -l $PORT`
   - **Install Command** : (laisser par défaut ou `npm install`)

3. **Variables** : ajoutez **avant le build** (obligatoire pour que l’API soit utilisée en production) :

   | Variable         | Valeur |
   |------------------|--------|
   | `VITE_API_URL`   | URL du backend + `/api` (ex. `https://backend-xxx.up.railway.app/api`) |

   Remplacez par l’URL réelle de votre service backend (celle notée à l’étape 4).

4. Déployez. Puis **Settings** → **Networking** → **Generate Domain**. Notez l’URL du frontend (ex. `https://frontend-xxx.up.railway.app`).

---

## 6. CORS et ALLOWED_HOSTS (après premier déploiement)

1. **Backend** : dans les variables du service backend, mettez à jour :
   - **CORS_ORIGINS** : `https://frontend-xxx.up.railway.app` (votre URL frontend, sans slash final).
   - **ALLOWED_HOSTS** : vous pouvez ajouter l’URL exacte du backend (ex. `votre-backend.up.railway.app`) si besoin.

2. Redéployez le backend (ou sauvegardez les variables pour déclencher un redéploiement).

---

## 7. Vérification

- **Frontend** : ouvrez l’URL du frontend. Inscription / connexion et utilisation de l’app doivent fonctionner.
- **API** : `https://votre-backend.up.railway.app/api/` doit renvoyer la racine de l’API (ou une redirection / 401 si non connecté).

---

## 8. Résumé des URLs et variables

| Rôle        | Où ça se configure | Exemple |
|------------|---------------------|--------|
| Backend API | URL générée par Railway (backend) | `https://gestion-financiere-backend.up.railway.app` |
| Frontend   | URL générée par Railway (frontend) | `https://gestion-financiere-frontend.up.railway.app` |
| `VITE_API_URL` (frontend) | Variables du service frontend | `https://gestion-financiere-backend.up.railway.app/api` |
| `CORS_ORIGINS` (backend) | Variables du service backend | `https://gestion-financiere-frontend.up.railway.app` |

---

## 9. Dépannage

- **502 / Backend ne démarre pas** : vérifier les variables (surtout `DB_*`), les logs Railway (onglet **Deployments** → log du service).
- **CORS / 401 sur le frontend** : vérifier que `CORS_ORIGINS` contient exactement l’URL du frontend (sans slash final).
- **Frontend appelle encore `/api`** : vérifier que `VITE_API_URL` est défini **avant** le build (variable dans Railway, puis redéployer).
- **MySQL refus de connexion** : vérifier que `DB_HOST` / `DB_PORT` sont bien ceux du service MySQL Railway (souvent un host public Railway, pas `localhost`).

---

*Projet : Application de Gestion Financière – Déploiement Railway.*
