-- Script SQL – Application de Gestion Financière
-- Création de la base et de l'utilisateur MySQL.
-- Les tables sont créées par Django (python manage.py migrate).

CREATE DATABASE IF NOT EXISTS gestion_financiere
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'gestion_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON gestion_financiere.* TO 'gestion_user'@'localhost';
FLUSH PRIVILEGES;

-- Pour obtenir le script SQL des tables (généré par Django) :
-- cd backend && python manage.py sqlmigrate core 0001
-- (et idem pour les autres apps : auth, admin, contenttypes, sessions)
