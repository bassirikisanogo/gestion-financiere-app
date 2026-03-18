# Déploiement sur Render

Ce guide décrit comment déployer l’application **Gestion Financière** (Django + React + MySQL) sur [Render](https://render.com). Le backend et le frontend sont hébergés sur Render ; la base MySQL doit être externe (Render propose PostgreSQL, pas MySQL en natif).

---

## 1. Prérequis

- Un compte **Render** (gratuit) : https://render.com
- Le projet sur **GitHub**
- Une base **MySQL** accessible en ligne (ex. [Aiven](https://aiven.io) gratuit, [FreeDB](https://freedb.tech), ou autre)

---

## 2. Base de données MySQL (externe)

Render ne fournit pas MySQL. Utilisez un hébergeur externe. Voici des options **gratuites** :

### Option A : Aiven (tier gratuit)

1. Créez un compte sur https://aiven.io
2. **Create service** → **MySQL** → choisir le plan **Free** (1 CPU, 1 GB RAM).
3. Récupérez les infos de connexion : **Host**, **Port**, **User**, **Password**, **Database**.

### Option B : FreeDB.tech (gratuit)

1. Allez sur https://freedb.tech
2. Créez un compte et une base MySQL (limite ~25 Mo en gratuit).
3. Notez **host**, **user**, **password**, **database**, **port**.

### Option C : Autre hébergeur MySQL

Tout hébergeur MySQL (Scaleway, OVH, etc.) convient. Notez **host**, **port**, **user**, **password**, **database**.

*Note : PlanetScale a supprimé son offre gratuite ; les plans affichés sont payants.*

---

## 3. Backend Django sur Render

1. Sur https://dashboard.render.com → **New +** → **Web Service**
2. Connectez votre dépôt GitHub et sélectionnez le projet
3. Configuration :
   - **Name** : `gestion-financiere-backend` (ou autre)
   - **Region** : choisir la plus proche
   - **Root Directory** : `backend`
   - **Runtime** : `Python 3`
   - **Build Command** :
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command** :
     ```bash
     python manage.py migrate --noinput && gunicorn config.wsgi --bind 0.0.0.0:$PORT
     ```
   - **Instance Type** : Free (ou paid si besoin)

4. **Environment Variables** (bouton **Add Environment Variable**) :

   | Key | Value |
   |-----|--------|
   | `DJANGO_SECRET_KEY` | Une clé secrète longue et aléatoire |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `.onrender.com` |
   | `DB_NAME` | Nom de la base MySQL |
   | `DB_USER` | Utilisateur MySQL |
   | `DB_PASSWORD` | Mot de passe MySQL |
   | `DB_HOST` | Hôte MySQL (ex. `xxx.connect.psdb.cloud`) |
   | `DB_PORT` | `3306` (ou le port fourni) |
   | `CORS_ORIGINS` | À remplir après création du frontend (ex. `https://gestion-financiere-frontend.onrender.com`) |

5. Cliquez sur **Create Web Service**. Attendez le premier déploiement.
6. Une fois en ligne, notez l’URL du service (ex. `https://gestion-financiere-backend.onrender.com`). L’API est à : `https://votre-backend.onrender.com/api/`.

---

## 4. Frontend React sur Render

1. **New +** → **Static Site**
2. Connectez le même dépôt GitHub
3. Configuration :
   - **Name** : `gestion-financiere-frontend`
   - **Root Directory** : `frontend`
   - **Build Command** :
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory** : `dist`

4. **Environment Variables** (à définir **avant** le premier build) :

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | `https://votre-backend.onrender.com/api` (remplacer par l’URL réelle du backend) |

   Sans cette variable, le frontend appellera `/api` (relatif) et ne fonctionnera pas en production.

5. **Create Static Site**. Le premier build peut prendre quelques minutes.
6. Notez l’URL du site (ex. `https://gestion-financiere-frontend.onrender.com`).

---

## 5. CORS (après déploiement du frontend)

1. Dans le **Web Service** backend sur Render → **Environment**
2. Modifiez ou ajoutez **CORS_ORIGINS** avec l’URL exacte du frontend (sans slash final) :
   - Ex. `https://gestion-financiere-frontend.onrender.com`
3. Sauvegardez. Render redéploie automatiquement.

---

## 6. Vérification

- Ouvrez l’URL du **frontend**. Inscrivez-vous ou connectez-vous.
- Si erreur CORS ou 401 : vérifier `CORS_ORIGINS` et que `VITE_API_URL` pointe bien vers le backend avec `/api`.

---

## 7. Résumé des variables

| Composant | Variable | Exemple |
|-----------|----------|---------|
| Backend | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` | Valeurs Aiven, FreeDB ou autre MySQL |
| Backend | `CORS_ORIGINS` | `https://gestion-financiere-frontend.onrender.com` |
| Frontend | `VITE_API_URL` | `https://gestion-financiere-backend.onrender.com/api` |

---

## 8. Note sur le plan gratuit Render

- Le **Web Service** gratuit peut se mettre en veille après 15 min d’inactivité ; le premier chargement après veille peut prendre 30–60 secondes.
- Le **Static Site** est servi par un CDN, pas de veille.
- Pour éviter la veille du backend, vous pouvez utiliser un service de « ping » (ex. UptimeRobot) qui appelle l’URL du backend toutes les 10–14 minutes, ou passer sur un plan payant.

---

## 9. Dépannage

- **502 Bad Gateway** : vérifier les logs du Web Service (onglet **Logs**). Souvent une erreur de variables (DB_*, SECRET_KEY) ou une exception Django au démarrage.
- **CORS / blocage des requêtes** : vérifier que `CORS_ORIGINS` contient exactement l’URL du frontend (https, pas de slash final).
- **Frontend ne contacte pas l’API** : vérifier que `VITE_API_URL` a été défini **avant** le build et que le frontend a été redéployé après l’ajout de la variable.
- **MySQL connection refused** : vérifier que les connexions externes sont autorisées (paramètres de votre hébergeur MySQL : autoriser les IPs publiques ou « from anywhere » si disponible).

---

*Projet : Application de Gestion Financière – Déploiement Render.*
