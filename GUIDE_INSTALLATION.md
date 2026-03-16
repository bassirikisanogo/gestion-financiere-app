# Guide d’installation et d’exécution – Gestion Financière

## Prérequis techniques

- **Python** 3.10 ou 3.11 (recommandé)
- **Node.js** 18+ et **npm**
- **MySQL** 8 (ou 5.7) installé et démarré
- Un terminal (PowerShell, CMD, ou bash)

## 1. Base de données MySQL

1. Ouvrir MySQL (client en ligne de commande ou outil type MySQL Workbench, phpMyAdmin).
2. Créer une base et un utilisateur si besoin :

```sql
CREATE DATABASE gestion_financiere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gestion_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON gestion_financiere.* TO 'gestion_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Noter : nom de la base, utilisateur, mot de passe, hôte (souvent `localhost`), port (souvent `3306`).

## 2. Backend (Django)

### 2.1 Environnement virtuel et dépendances

```bash
cd backend
python -m venv venv
```

- **Windows (PowerShell)** :
  ```bash
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD)** :
  ```bash
  venv\Scripts\activate.bat
  ```
- **Linux / macOS** :
  ```bash
  source venv/bin/activate
  ```

Puis :

```bash
pip install -r requirements.txt
```

### 2.2 Configuration (variables d’environnement)

Créer un fichier `.env` à la racine du dossier `backend` (vous pouvez vous inspirer de `.env.example`) :

```env
DEBUG=True
DJANGO_SECRET_KEY=changez-moi-en-production
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=gestion_financiere
DB_USER=gestion_user
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=3306
```

Adapter `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT` selon votre MySQL.

Pour charger le `.env` dans Django, vous pouvez utiliser `python-dotenv` en début de `config/settings.py` :

```python
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv(BASE_DIR / '.env')  # ou load_dotenv() si .env à la racine backend
```

(Voir section « Option dotenv » ci-dessous si besoin.)

### 2.3 Migrations et lancement

Depuis le dossier `backend` (avec le venv activé) :

```bash
python manage.py migrate
python manage.py runserver
```

Le serveur API tourne sur **http://127.0.0.1:8000**.

- **Créer un superutilisateur (optionnel, pour l’admin Django)** :
  ```bash
  python manage.py createsuperuser
  ```
  Puis accéder à **http://127.0.0.1:8000/admin/**.

### Option : charger les variables .env avec python-dotenv

Dans `backend/config/settings.py`, tout en haut après les premiers imports :

```python
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
from dotenv import load_dotenv
load_dotenv(BASE_DIR / '.env')
```

Et dans `requirements.txt` la ligne `python-dotenv>=1.0` est déjà présente.

## 3. Frontend (React / Vite)

Dans un **second terminal** :

```bash
cd frontend
npm install
npm run dev
```

L’application web est servie sur **http://localhost:3000** (ou le port indiqué par Vite).

Le proxy Vite est configuré pour que les appels vers `/api` soient redirigés vers `http://127.0.0.1:8000`. Aucune modification n’est nécessaire si backend et frontend tournent en local comme ci-dessus.

## 4. Commandes de lancement récapitulatives

**Terminal 1 – Backend :**

```bash
cd backend
.\venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Terminal 2 – Frontend :**

```bash
cd frontend
npm install
npm run dev
```

Puis ouvrir **http://localhost:3000** dans le navigateur. Vous pouvez vous inscrire via l’interface puis vous connecter.

## 5. Script SQL de la base de données

Un **script SQL** est fourni à la racine du projet : **`script_bdd.sql`**. Il contient la création de la base `gestion_financiere` et de l’utilisateur MySQL. Les tables sont créées par **Django** via `python manage.py migrate` (fichiers dans `backend/core/migrations/`).

Pour générer le script SQL des tables (optionnel, pour référence ou déploiement manuel) :

```bash
cd backend
python manage.py sqlmigrate core 0001
```

(En remplaçant `0001` par le numéro de la migration initiale si différent.) Vous pouvez rediriger la sortie vers un fichier :

```bash
python manage.py sqlmigrate core 0001 > script_bdd.sql
```

Pour une base vierge, l’usage recommandé reste :

```bash
python manage.py migrate
```

## 6. Génération des alertes (optionnel)

Pour générer les alertes (dépassement de budget, trésorerie basse, dettes en retard) pour tous les utilisateurs :

```bash
cd backend
python manage.py generer_alertes
```

Option : `--seuil=500` pour définir le seuil de trésorerie basse en F CFA (défaut 1000).

Cette commande peut être planifiée (cron, Task Scheduler) pour exécution régulière.

## 7. Build de production (frontend)

Pour générer les fichiers statiques du frontend :

```bash
cd frontend
npm run build
```

Les fichiers sont produits dans `frontend/dist/`. Ils peuvent être servis par un serveur web (Nginx, Apache) ou par Django en mode production (configuration `STATIC_ROOT` et `whitenoise` si souhaité).

## 8. Dépannage rapide

- **Erreur MySQL (accès refusé)** : vérifier utilisateur, mot de passe, hôte, port et que le service MySQL est démarré.
- **Module MySQL non trouvé (Python)** : sur Windows, installer éventuellement un build précompilé de `mysqlclient` ou utiliser les wheels fournis par des tiers.
- **CORS / 401** : s’assurer que le backend tourne sur le port 8000 et que le frontend utilise bien le proxy (requêtes vers `/api`).
- **Page blanche** : ouvrir la console du navigateur (F12) et vérifier les erreurs JavaScript ou réseau.

---

*Projet : Application de Gestion Financière Simplifiée & Intelligente.*
