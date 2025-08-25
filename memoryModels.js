// Modèles en mémoire pour remplacer MongoDB
const { User } = require('./memoryStorage');

// Stockage en mémoire pour les autres entités
let articles = [];
let recipes = [];
let weekPlans = [];
let nextArticleId = 1;
let nextRecipeId = 1;
let nextWeekPlanId = 1;

// Modèle Article
class Article {
    constructor(data) {
        this.id = nextArticleId++;
        this.nom = data.nom;
        this.quantite = data.quantite;
        this.unite = data.unite;
        this.seuil = data.seuil;
        this.user = data.user;
        this.createdAt = new Date();
    }

    async save() {
        articles.push(this);
        return this;
    }

    static async find(query = {}) {
        if (query.user) {
            return articles.filter(article => article.user.toString() === query.user.toString());
        }
        return articles;
    }

    static async findById(id) {
        return articles.find(article => article.id.toString() === id.toString()) || null;
    }

    static async findByIdAndUpdate(id, update) {
        const article = articles.find(a => a.id.toString() === id.toString());
        if (article) {
            Object.assign(article, update);
        }
        return article;
    }

    static async findByIdAndDelete(id) {
        const index = articles.findIndex(a => a.id.toString() === id.toString());
        if (index !== -1) {
            return articles.splice(index, 1)[0];
        }
        return null;
    }
}

// Modèle Recipe
class Recipe {
    constructor(data) {
        this.id = nextRecipeId++;
        this.name = data.name;
        this.type = data.type;
        this.instructions = data.instructions;
        this.ingredients = data.ingredients || [];
        this.user = data.user;
        this.createdAt = new Date();
    }

    async save() {
        recipes.push(this);
        return this;
    }

    static async find(query = {}) {
        if (query.user) {
            return recipes.filter(recipe => recipe.user.toString() === query.user.toString());
        }
        return recipes;
    }

    static async findById(id) {
        return recipes.find(recipe => recipe.id.toString() === id.toString()) || null;
    }

    static async findByIdAndUpdate(id, update) {
        const recipe = recipes.find(r => r.id.toString() === id.toString());
        if (recipe) {
            Object.assign(recipe, update);
        }
        return recipe;
    }

    static async findByIdAndDelete(id) {
        const index = recipes.findIndex(r => r.id.toString() === id.toString());
        if (index !== -1) {
            return recipes.splice(index, 1)[0];
        }
        return null;
    }
}

// Modèle WeekPlan
class WeekPlan {
    constructor(data) {
        this.id = nextWeekPlanId++;
        this.monday = data.monday || { lunch: null, dinner: null };
        this.tuesday = data.tuesday || { lunch: null, dinner: null };
        this.wednesday = data.wednesday || { lunch: null, dinner: null };
        this.thursday = data.thursday || { lunch: null, dinner: null };
        this.friday = data.friday || { lunch: null, dinner: null };
        this.saturday = data.saturday || { lunch: null, dinner: null };
        this.sunday = data.sunday || { lunch: null, dinner: null };
        this.user = data.user;
        this.createdAt = new Date();
    }

    async save() {
        weekPlans.push(this);
        return this;
    }

    static async find(query = {}) {
        if (query.user) {
            return weekPlans.filter(plan => plan.user.toString() === query.user.toString());
        }
        return weekPlans;
    }

    static async findById(id) {
        return weekPlans.find(plan => plan.id.toString() === id.toString()) || null;
    }

    static async findOne(query) {
        if (query.user) {
            return weekPlans.find(plan => plan.user.toString() === query.user.toString()) || null;
        }
        return weekPlans[0] || null;
    }

    static async findByIdAndUpdate(id, update) {
        const plan = weekPlans.find(p => p.id.toString() === id.toString());
        if (plan) {
            Object.assign(plan, update);
        }
        return plan;
    }

    static async findByIdAndDelete(id) {
        const index = weekPlans.findIndex(p => p.id.toString() === id.toString());
        if (index !== -1) {
            return weekPlans.splice(index, 1)[0];
        }
        return null;
    }
}

// Fonction de connexion factice
const connectDB = async () => {
    console.log('✅ Système de stockage en mémoire initialisé');
    console.log('📝 Mode sans base de données - Les données seront perdues au redémarrage');
    return Promise.resolve();
};

module.exports = {
    connectDB,
    User,
    Article,
    Recipe,
    WeekPlan,
    // Fonctions utilitaires pour les tests
    clearAllData: () => {
        articles.length = 0;
        recipes.length = 0;
        weekPlans.length = 0;
        nextArticleId = 1;
        nextRecipeId = 1;
        nextWeekPlanId = 1;
    },
    getAllData: () => ({ articles, recipes, weekPlans })
};