// Système de stockage en mémoire pour remplacer MongoDB
const bcrypt = require('bcryptjs');

// Stockage en mémoire des utilisateurs
let users = [];
let nextId = 1;

// Simuler un modèle User
class User {
    constructor(userData) {
        this.id = nextId++;
        this.username = userData.username;
        this.email = userData.email;
        this.password = userData.password;
        this.createdAt = new Date();
    }

    // Méthode pour sauvegarder l'utilisateur
    async save() {
        // Hasher le mot de passe avant de sauvegarder
        if (this.password && !this.password.startsWith('$2a$')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        
        users.push(this);
        return this;
    }

    // Méthode statique pour trouver un utilisateur par email
    static async findOne(query) {
        if (query.email) {
            return users.find(user => user.email === query.email) || null;
        }
        if (query.username) {
            return users.find(user => user.username === query.username) || null;
        }
        return null;
    }

    // Méthode statique pour trouver tous les utilisateurs
    static async find() {
        return users;
    }

    // Méthode pour comparer les mots de passe
    async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    // Méthode pour obtenir l'utilisateur sans le mot de passe
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

// Ajouter quelques utilisateurs de test
const initializeTestUsers = async () => {
    if (users.length === 0) {
        const testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        await testUser.save();
        
        console.log('✅ Utilisateur de test créé: test@example.com / password123');
    }
};

// Initialiser les utilisateurs de test au démarrage
initializeTestUsers();

module.exports = {
    User,
    getUsers: () => users,
    clearUsers: () => { users = []; nextId = 1; },
    initializeTestUsers
};