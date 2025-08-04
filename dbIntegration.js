// Integration script for connecting frontend with MongoDB backend

class MongoDBIntegration {
    constructor() {
        this.apiUrl = '/api';
        this.token = localStorage.getItem('token');
        this.isConnected = !!this.token;
        
        // Check if we're using the MongoDB backend or local IndexedDB
        this.usingMongoDB = window.location.hostname !== 'localhost' || window.location.port === '5000';
        
        if (this.usingMongoDB) {
            console.log('Using MongoDB backend');
            this.setupEventListeners();
        } else {
            console.log('Using local IndexedDB storage');
        }
    }
    
    // Setup event listeners for integration
    setupEventListeners() {
        // Listen for inventory changes to sync with MongoDB
        document.addEventListener('inventoryUpdated', (e) => {
            if (this.isConnected) {
                this.syncInventory();
            }
        });
        
        // Listen for recipe changes to sync with MongoDB
        document.addEventListener('recipesUpdated', (e) => {
            if (this.isConnected) {
                this.syncRecipes();
            }
        });
        
        // Listen for week plan changes to sync with MongoDB
        document.addEventListener('weekPlanUpdated', (e) => {
            if (this.isConnected) {
                this.syncWeekPlan();
            }
        });
        
        // Listen for authentication changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'token') {
                this.token = e.newValue;
                this.isConnected = !!this.token;
                
                if (this.isConnected) {
                    this.loadDataFromMongoDB();
                }
            }
        });
        
        // Initial data load if connected
        if (this.isConnected) {
            this.loadDataFromMongoDB();
        }
    }
    
    // Load all data from MongoDB
    async loadDataFromMongoDB() {
        try {
            await Promise.all([
                this.loadInventoryFromMongoDB(),
                this.loadRecipesFromMongoDB(),
                this.loadWeekPlanFromMongoDB()
            ]);
            
            console.log('All data loaded from MongoDB');
        } catch (error) {
            console.error('Error loading data from MongoDB:', error);
        }
    }
    
    // Load inventory from MongoDB
    async loadInventoryFromMongoDB() {
        try {
            const response = await this.apiRequest('/articles');
            
            if (response.success && response.data) {
                // Convert MongoDB format to local format
                const articles = response.data.map(article => ({
                    id: article._id,
                    nom: article.nom,
                    quantite: article.quantite,
                    unite: article.unite,
                    seuil: article.seuil,
                    date_creation: new Date(article.createdAt)
                }));
                
                // Update local inventory
                if (window.inventoryManager) {
                    window.inventoryManager.articles = articles;
                    window.inventoryManager.renderInventory();
                    window.inventoryManager.updateStats();
                    window.inventoryManager.checkSuggestions();
                }
            }
        } catch (error) {
            console.error('Error loading inventory from MongoDB:', error);
        }
    }
    
    // Load recipes from MongoDB
    async loadRecipesFromMongoDB() {
        try {
            const response = await this.apiRequest('/recipes');
            
            if (response.success && response.data) {
                // Convert MongoDB format to local format
                const recipes = response.data.map(recipe => ({
                    id: recipe._id,
                    name: recipe.name,
                    type: recipe.type,
                    instructions: recipe.instructions,
                    ingredients: recipe.ingredients
                }));
                
                // Update local recipes
                if (window.recipes) {
                    window.recipes = recipes;
                    if (typeof renderRecipes === 'function') {
                        renderRecipes();
                    }
                }
            }
        } catch (error) {
            console.error('Error loading recipes from MongoDB:', error);
        }
    }
    
    // Load week plan from MongoDB
    async loadWeekPlanFromMongoDB() {
        try {
            const response = await this.apiRequest('/weekplan');
            
            if (response.success && response.data) {
                // Convert MongoDB format to local format
                const weekPlan = {
                    monday: {
                        lunch: response.data.monday.lunch ? response.data.monday.lunch._id : null,
                        dinner: response.data.monday.dinner ? response.data.monday.dinner._id : null
                    },
                    tuesday: {
                        lunch: response.data.tuesday.lunch ? response.data.tuesday.lunch._id : null,
                        dinner: response.data.tuesday.dinner ? response.data.tuesday.dinner._id : null
                    },
                    wednesday: {
                        lunch: response.data.wednesday.lunch ? response.data.wednesday.lunch._id : null,
                        dinner: response.data.wednesday.dinner ? response.data.wednesday.dinner._id : null
                    },
                    thursday: {
                        lunch: response.data.thursday.lunch ? response.data.thursday.lunch._id : null,
                        dinner: response.data.thursday.dinner ? response.data.thursday.dinner._id : null
                    },
                    friday: {
                        lunch: response.data.friday.lunch ? response.data.friday.lunch._id : null,
                        dinner: response.data.friday.dinner ? response.data.friday.dinner._id : null
                    },
                    saturday: {
                        lunch: response.data.saturday.lunch ? response.data.saturday.lunch._id : null,
                        dinner: response.data.saturday.dinner ? response.data.saturday.dinner._id : null
                    },
                    sunday: {
                        lunch: response.data.sunday.lunch ? response.data.sunday.lunch._id : null,
                        dinner: response.data.sunday.dinner ? response.data.sunday.dinner._id : null
                    }
                };
                
                // Update local week plan
                if (window.weekPlan) {
                    window.weekPlan = weekPlan;
                    if (typeof renderWeekPlan === 'function') {
                        renderWeekPlan();
                    }
                }
            }
        } catch (error) {
            console.error('Error loading week plan from MongoDB:', error);
        }
    }
    
    // Sync inventory with MongoDB
    async syncInventory() {
        if (!this.isConnected || !window.inventoryManager) return;
        
        try {
            // For each article in local inventory, update or create in MongoDB
            for (const article of window.inventoryManager.articles) {
                const mongoArticle = {
                    nom: article.nom,
                    quantite: article.quantite,
                    unite: article.unite,
                    seuil: article.seuil
                };
                
                if (article.id && article.id.toString().length === 24) {
                    // Update existing article
                    await this.apiRequest(`/articles/${article.id}`, 'PUT', mongoArticle);
                } else {
                    // Create new article
                    const response = await this.apiRequest('/articles', 'POST', mongoArticle);
                    if (response.success && response.data) {
                        article.id = response.data._id;
                    }
                }
            }
            
            console.log('Inventory synced with MongoDB');
        } catch (error) {
            console.error('Error syncing inventory with MongoDB:', error);
        }
    }
    
    // Sync recipes with MongoDB
    async syncRecipes() {
        if (!this.isConnected || !window.recipes) return;
        
        try {
            // For each recipe in local recipes, update or create in MongoDB
            for (const recipe of window.recipes) {
                const mongoRecipe = {
                    name: recipe.name,
                    type: recipe.type,
                    instructions: recipe.instructions,
                    ingredients: recipe.ingredients
                };
                
                if (recipe.id && recipe.id.toString().length === 24) {
                    // Update existing recipe
                    await this.apiRequest(`/recipes/${recipe.id}`, 'PUT', mongoRecipe);
                } else {
                    // Create new recipe
                    const response = await this.apiRequest('/recipes', 'POST', mongoRecipe);
                    if (response.success && response.data) {
                        recipe.id = response.data._id;
                    }
                }
            }
            
            console.log('Recipes synced with MongoDB');
        } catch (error) {
            console.error('Error syncing recipes with MongoDB:', error);
        }
    }
    
    // Sync week plan with MongoDB
    async syncWeekPlan() {
        if (!this.isConnected || !window.weekPlan) return;
        
        try {
            const mongoWeekPlan = {
                monday: window.weekPlan.monday,
                tuesday: window.weekPlan.tuesday,
                wednesday: window.weekPlan.wednesday,
                thursday: window.weekPlan.thursday,
                friday: window.weekPlan.friday,
                saturday: window.weekPlan.saturday,
                sunday: window.weekPlan.sunday
            };
            
            // Update week plan
            await this.apiRequest('/weekplan', 'PUT', mongoWeekPlan);
            
            console.log('Week plan synced with MongoDB');
        } catch (error) {
            console.error('Error syncing week plan with MongoDB:', error);
        }
    }
    
    // Make authenticated API request
    async apiRequest(url, method = 'GET', body = null) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }
            
            const options = {
                method,
                headers
            };
            
            if (body && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(`${this.apiUrl}${url}`, options);
            const data = await response.json();
            
            if (!response.ok) {
                // If unauthorized, redirect to login
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    this.isConnected = false;
                    
                    if (window.location.pathname !== '/login.html') {
                        window.location.href = 'login.html';
                    }
                }
                
                throw new Error(data.message || 'Erreur de requête API');
            }
            
            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
}

// Initialize MongoDB integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mongoDBIntegration = new MongoDBIntegration();
});