# Inventaire de Courses et Recettes

Une application web responsive pour gérer votre inventaire de courses avec des fonctionnalités CRUD complètes, des alertes de rupture de stock, des suggestions d'achat intelligentes et une authentification utilisateur.

## URL de déploiement

L'application est déployée et accessible à l'adresse : https://inventaire-recettes.netlify.app/

## Fonctionnalités

### 🔐 Authentification et Sécurité

- **Inscription** : Création de compte utilisateur avec nom d'utilisateur, email et mot de passe
- **Connexion** : Authentification sécurisée avec JWT (JSON Web Tokens)
- **Protection des données** : Chaque utilisateur accède uniquement à ses propres données
- **Hachage des mots de passe** : Sécurité renforcée avec bcrypt

### ✅ Fonctionnalités CRUD

- **Créer** : Ajouter de nouveaux articles avec nom, quantité, unité et seuil d'alerte
- **Lire** : Afficher tous les articles avec leurs détails et statuts
- **Mettre à jour** : Modifier les informations des articles existants
- **Supprimer** : Retirer des articles de l'inventaire avec confirmation

### 🔴 Gestion des ruptures de stock

- Affichage en rouge des articles en rupture de stock (quantité = 0)
- Affichage en orange des articles avec stock faible (quantité ≤ seuil d'alerte)
- Compteur d'alertes en temps réel

### 💡 Suggestions d'achat

- Suggestions automatiques basées sur les articles en rupture ou stock faible
- Quantités suggérées calculées intelligemment
- Section dédiée qui s'affiche uniquement quand nécessaire

### 🔍 Recherche et filtrage

- Recherche par nom d'article en temps réel
- Filtres par statut : Tous, En stock, Stock faible, Rupture de stock
- Interface intuitive et responsive

### 📱 Design responsive

- Interface adaptée aux mobiles, tablettes et ordinateurs
- Design moderne avec animations fluides
- Notifications toast pour les actions utilisateur

## Technologies utilisées

### Frontend

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec variables CSS et animations
- **JavaScript ES6+** : Logique applicative orientée objet

### Backend

- **MongoDB** : Base de données NoSQL pour le stockage persistant
- **Mongoose** : ODM (Object Data Modeling) pour MongoDB

## Structure des données

## MongoDB Database Configuration Analysis

After reviewing the codebase, I can see that the MongoDB integration is well-structured and follows best practices for a full-stack JavaScript application. Here's a breakdown of the key components:

### Database Configuration (db.js)

The db.js file serves as the core database configuration module with:

- Connection Setup : Uses Mongoose to connect to MongoDB with proper error handling
- Schema Definitions : Well-defined schemas for all data models:
  - User : Authentication data with password hashing and JWT token generation
  - Article : Inventory items with user ownership
  - Recipe : Recipe data with ingredients and user ownership
  - WeekPlan : Weekly meal planning with references to recipes
- Model Exports : Exports all models and the connection function for use throughout the application

### Server Configuration (server.js)

The server is set up with Express and includes:

- Environment variable loading with dotenv
- MongoDB connection initialization
- Middleware for JSON parsing and CORS
- API routes mounting
- Static file serving for production
- Error handling middleware
- Configurable port setting

### Authentication (authController.js)

The authentication system provides:

- User registration with duplicate checking
- Secure login with password comparison
- JWT token generation and verification
- Route protection middleware
- User profile retrieval

### API Routes (routes.js)

The API endpoints are organized by resource type:

- Authentication Routes : Register, login, and profile retrieval
- Article Routes : CRUD operations for inventory items with ownership validation
- Recipe Routes : CRUD operations for recipes with ownership validation
- Week Plan Routes : Get and update weekly meal plans with automatic creation if none exists

### Frontend Integration (dbIntegration.js)

The frontend-to-backend integration is handled by the MongoDBIntegration class which:

- Detects whether to use MongoDB or local IndexedDB storage
- Loads data from MongoDB when authenticated
- Syncs local changes to MongoDB
- Handles API requests with authentication tokens
- Manages data format conversion between frontend and backend
- Provides error handling and authentication redirection

### Overall Architecture

The application follows a clean architecture with:

1. 1. Data Models : Well-defined schemas with validation
2. 2. Authentication : Secure user management with JWT
3. 3. API Layer : RESTful endpoints with proper error handling
4. 4. Frontend Integration : Seamless switching between local and server storage
5. 5. Security : Ownership validation for all resources
      This implementation allows the application to work in two modes:

6. 1. Local Mode : Using IndexedDB for offline/local usage
7. 2. Full Stack Mode : Using MongoDB with user authentication for multi-user, persistent storage
      The code is well-structured, includes proper error handling, and follows modern JavaScript practices for both frontend and backend development.

### Utilisateurs (MongoDB)

Chaque utilisateur contient :

- `_id` : Identifiant unique auto-généré par MongoDB
- `username` : Nom d'utilisateur
- `email` : Adresse email (unique)
- `password` : Mot de passe haché avec bcrypt
- `createdAt` : Date de création du compte

### Articles (IndexedDB & MongoDB)

Chaque article contient :

- `id` / `_id` : Identifiant unique auto-généré
- `nom` : Nom de l'article
- `quantite` : Quantité actuelle en stock
- `unite` : Unité de mesure (pièces, kg, L, etc.)
- `seuil` : Quantité minimale avant alerte
- `user` : Référence à l'utilisateur propriétaire (MongoDB uniquement)
- `createdAt` : Date de création de l'article

### Recettes (MongoDB)

Chaque recette contient :

- `_id` : Identifiant unique auto-généré
- `name` : Nom de la recette
- `type` : Type de repas (déjeuner ou dîner)
- `instructions` : Instructions de préparation
- `ingredients` : Liste des ingrédients (nom, quantité, unité)
- `user` : Référence à l'utilisateur propriétaire
- `createdAt` : Date de création de la recette

### Plan de la semaine (MongoDB)

Le plan de la semaine contient :

- `_id` : Identifiant unique auto-généré
- Jours de la semaine (lundi à dimanche) avec :
  - `lunch` : Référence à une recette pour le déjeuner
  - `dinner` : Référence à une recette pour le dîner
- `user` : Référence à l'utilisateur propriétaire
- `createdAt` : Date de création du plan

## Installation et utilisation

### Version locale avec IndexedDB (sans MongoDB)

1. Clonez ou téléchargez les fichiers
2. Ouvrez `index.html` dans un navigateur moderne
3. Commencez à ajouter vos articles !

### Version complète avec MongoDB et authentification

1. Clonez le dépôt

   ```bash
   git clone <url-du-depot>
   cd inventaire_recettes
   ```

2. Installez les dépendances

   ```bash
   npm install
   ```

3. Configurez les variables d'environnement

   ```bash
   cp .env.example .env
   # Modifiez le fichier .env avec vos propres valeurs
   ```

4. Démarrez le serveur

   ```bash
   npm run dev
   ```

5. Accédez à l'application dans votre navigateur à l'adresse `http://localhost:5000`

## Fonctionnalités avancées

- **Persistance des données** :
  - Version locale : Données sauvegardées dans IndexedDB
  - Version complète : Données sauvegardées dans MongoDB
- **Authentification** : Système complet avec JWT pour la sécurité
- **Gestion d'erreurs** : Messages d'erreur informatifs et gestion des cas limites
- **Interface utilisateur** : Modales pour l'édition et la suppression avec confirmations
- **Notifications** : Système de notifications toast pour les actions réussies/échouées
- **Statistiques** : Affichage du nombre total d'articles et d'alertes

## API Endpoints

### Authentification

- `POST /api/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/auth/login` : Connexion d'un utilisateur
- `GET /api/auth/me` : Récupération des informations de l'utilisateur connecté

### Articles

- `GET /api/articles` : Récupération de tous les articles de l'utilisateur
- `POST /api/articles` : Création d'un nouvel article
- `GET /api/articles/:id` : Récupération d'un article spécifique
- `PUT /api/articles/:id` : Mise à jour d'un article
- `DELETE /api/articles/:id` : Suppression d'un article

### Recettes

- `GET /api/recipes` : Récupération de toutes les recettes de l'utilisateur
- `POST /api/recipes` : Création d'une nouvelle recette
- `GET /api/recipes/:id` : Récupération d'une recette spécifique
- `PUT /api/recipes/:id` : Mise à jour d'une recette
- `DELETE /api/recipes/:id` : Suppression d'une recette

### Plan de la semaine

- `GET /api/weekplan` : Récupération du plan de la semaine de l'utilisateur
- `PUT /api/weekplan` : Mise à jour du plan de la semaine

## Compatibilité

### Version locale (Frontend uniquement)

Compatible avec tous les navigateurs modernes supportant :

- IndexedDB
- ES6+ JavaScript
- CSS Grid et Flexbox
- Fetch API

### Version complète (Backend + Frontend)

Requis pour le serveur :

- Node.js v14.x ou supérieur
- MongoDB v4.x ou supérieur
- npm v6.x ou supérieur

Compatible avec tous les navigateurs modernes supportant :

- ES6+ JavaScript
- CSS Grid et Flexbox
- Fetch API
