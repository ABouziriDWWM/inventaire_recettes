// Configuration de base de données - Mode mémoire (sans MongoDB)
// Les modèles en mémoire remplacent MongoDB pour un fonctionnement sans base de données

// Import des modèles en mémoire
const { connectDB, User, Article, Recipe, WeekPlan } = require('./memoryModels');

// Les schémas et modèles sont maintenant définis dans memoryModels.js
// Ce fichier sert maintenant de point d'entrée unifié pour l'accès aux données

module.exports = {
  connectDB,
  User,
  Article,
  Recipe,
  WeekPlan,
};
