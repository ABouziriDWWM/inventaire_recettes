// Configuration de la base de données IndexedDB
const DB_NAME = 'InventaireCourses';
const DB_VERSION = 1;
const STORE_NAME = 'articles';

class InventoryManager {
    constructor() {
        this.db = null;
        this.articles = [];
        this.filteredArticles = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        
        this.initializeDB();
        this.setupEventListeners();
    }

    // Initialisation de la base de données IndexedDB
    async initializeDB() {
        try {
            this.db = await this.openDB();
            await this.loadArticles();
            this.renderInventory();
            this.updateStats();
            this.checkSuggestions();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de la base de données:', error);
            this.showNotification('Erreur lors de l\'initialisation de la base de données', 'error');
        }
    }

    // Ouverture de la connexion IndexedDB
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Index pour la recherche par nom
                    store.createIndex('nom', 'nom', { unique: false });
                    store.createIndex('quantite', 'quantite', { unique: false });
                }
            };
        });
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Formulaire d'ajout
        document.getElementById('add-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addArticle();
        });

        // Recherche
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterArticles();
        });

        // Filtre par statut
        document.getElementById('filter-status').addEventListener('change', (e) => {
            this.filterArticles();
        });

        // Modales
        this.setupModalListeners();
    }

    // Configuration des modales
    setupModalListeners() {
        // Modal d'édition
        const editModal = document.getElementById('edit-modal');
        const deleteModal = document.getElementById('delete-modal');
        
        // Fermeture des modales
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal('edit-modal');
        });
        
        document.getElementById('close-delete-modal').addEventListener('click', () => {
            this.closeModal('delete-modal');
        });
        
        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeModal('edit-modal');
        });
        
        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.closeModal('delete-modal');
        });

        // Formulaire d'édition
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateArticle();
        });

        // Confirmation de suppression
        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.deleteArticle(this.currentDeleteId);
        });

        // Fermeture en cliquant à l'extérieur
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                this.closeModal('edit-modal');
            }
        });
        
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                this.closeModal('delete-modal');
            }
        });
    }

    // Chargement des articles depuis IndexedDB
    async loadArticles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            
            request.onsuccess = () => {
                this.articles = request.result;
                this.filteredArticles = [...this.articles];
                resolve();
            };
            
            request.onerror = () => reject(request.error);
        });
    }

    // Ajout d'un nouvel article
    async addArticle() {
        const nom = document.getElementById('item-name').value.trim();
        const quantite = parseInt(document.getElementById('item-quantity').value);
        const unite = document.getElementById('item-unit').value;
        const seuil = parseInt(document.getElementById('item-threshold').value);

        if (!nom || quantite < 0 || !unite || seuil < 0) {
            this.showNotification('Veuillez remplir tous les champs correctement', 'error');
            return;
        }

        const article = {
            nom,
            quantite,
            unite,
            seuil_alerte: seuil,
            derniere_date_achat: new Date().toISOString(),
            date_creation: new Date().toISOString()
        };

        try {
            await this.saveArticle(article);
            this.clearForm();
            this.showNotification('Article ajouté avec succès', 'success');
            await this.loadArticles();
            this.renderInventory();
            this.updateStats();
            this.checkSuggestions();
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
            this.showNotification('Erreur lors de l\'ajout de l\'article', 'error');
        }
    }

    // Sauvegarde d'un article dans IndexedDB
    saveArticle(article) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(article);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Mise à jour d'un article
    async updateArticle() {
        const id = parseInt(document.getElementById('edit-item-id').value);
        const nom = document.getElementById('edit-item-name').value.trim();
        const quantite = parseInt(document.getElementById('edit-item-quantity').value);
        const unite = document.getElementById('edit-item-unit').value;
        const seuil = parseInt(document.getElementById('edit-item-threshold').value);

        if (!nom || quantite < 0 || !unite || seuil < 0) {
            this.showNotification('Veuillez remplir tous les champs correctement', 'error');
            return;
        }

        const article = {
            id,
            nom,
            quantite,
            unite,
            seuil_alerte: seuil,
            derniere_date_achat: new Date().toISOString()
        };

        try {
            await this.updateArticleInDB(article);
            this.closeModal('edit-modal');
            this.showNotification('Article mis à jour avec succès', 'success');
            await this.loadArticles();
            this.renderInventory();
            this.updateStats();
            this.checkSuggestions();
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            this.showNotification('Erreur lors de la mise à jour de l\'article', 'error');
        }
    }

    // Mise à jour dans IndexedDB
    updateArticleInDB(article) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(article);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Suppression d'un article
    async deleteArticle(id) {
        try {
            await this.deleteArticleFromDB(id);
            this.closeModal('delete-modal');
            this.showNotification('Article supprimé avec succès', 'success');
            await this.loadArticles();
            this.renderInventory();
            this.updateStats();
            this.checkSuggestions();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            this.showNotification('Erreur lors de la suppression de l\'article', 'error');
        }
    }

    // Suppression dans IndexedDB
    deleteArticleFromDB(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Filtrage des articles
    filterArticles() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('filter-status').value;

        this.filteredArticles = this.articles.filter(article => {
            const matchesSearch = article.nom.toLowerCase().includes(searchTerm);
            
            let matchesStatus = true;
            if (statusFilter === 'in-stock') {
                matchesStatus = article.quantite > article.seuil_alerte;
            } else if (statusFilter === 'low-stock') {
                matchesStatus = article.quantite <= article.seuil_alerte && article.quantite > 0;
            } else if (statusFilter === 'out-of-stock') {
                matchesStatus = article.quantite === 0;
            }
            
            return matchesSearch && matchesStatus;
        });

        this.renderInventory();
    }

    // Rendu de l'inventaire
    renderInventory() {
        const container = document.getElementById('inventory-list');
        
        if (this.filteredArticles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-basket"></i>
                    <h3>${this.articles.length === 0 ? 'Votre inventaire est vide' : 'Aucun article trouvé'}</h3>
                    <p>${this.articles.length === 0 ? 'Commencez par ajouter vos premiers articles ci-dessus' : 'Essayez de modifier vos critères de recherche'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredArticles.map(article => {
            const status = this.getArticleStatus(article);
            const statusClass = status === 'out-of-stock' ? 'out-of-stock' : 
                               status === 'low-stock' ? 'low-stock' : '';
            
            return `
                <div class="inventory-item ${statusClass}">
                    <div class="item-info">
                        <h3>${article.nom}</h3>
                        <div class="item-details">
                            <span class="item-quantity ${status === 'out-of-stock' ? 'out' : status === 'low-stock' ? 'low' : ''}">
                                ${article.quantite} ${article.unite}
                            </span>
                            <span>Seuil: ${article.seuil_alerte}</span>
                            <span>Ajouté: ${new Date(article.date_creation || article.derniere_date_achat).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-primary btn-small" onclick="inventoryManager.openEditModal(${article.id})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn btn-danger btn-small" onclick="inventoryManager.openDeleteModal(${article.id}, '${article.nom}')">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Détermination du statut d'un article
    getArticleStatus(article) {
        if (article.quantite === 0) return 'out-of-stock';
        if (article.quantite <= article.seuil_alerte) return 'low-stock';
        return 'in-stock';
    }

    // Mise à jour des statistiques
    updateStats() {
        const totalItems = this.articles.length;
        const alertItems = this.articles.filter(article => 
            article.quantite <= article.seuil_alerte
        ).length;

        document.getElementById('total-items').textContent = totalItems;
        document.getElementById('alert-items').textContent = alertItems;
    }

    // Vérification et affichage des suggestions
    checkSuggestions() {
        const suggestionsSection = document.getElementById('suggestions-section');
        const suggestionsList = document.getElementById('suggestions-list');
        
        const articlesEnRupture = this.articles.filter(article => 
            article.quantite <= article.seuil_alerte
        );

        if (articlesEnRupture.length === 0) {
            suggestionsSection.style.display = 'none';
            return;
        }

        suggestionsSection.style.display = 'block';
        
        suggestionsList.innerHTML = articlesEnRupture.map(article => {
            const quantiteSuggere = Math.max(article.seuil_alerte * 2, 5);
            return `
                <div class="suggestion-item">
                    <div class="suggestion-info">
                        <i class="fas fa-shopping-cart"></i>
                        <span><strong>${article.nom}</strong> - Stock actuel: ${article.quantite} ${article.unite}</span>
                    </div>
                    <div class="suggestion-action">
                        <span>Suggéré: ${quantiteSuggere} ${article.unite}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Ouverture de la modal d'édition
    openEditModal(id) {
        const article = this.articles.find(a => a.id === id);
        if (!article) return;

        this.currentEditId = id;
        
        document.getElementById('edit-item-id').value = article.id;
        document.getElementById('edit-item-name').value = article.nom;
        document.getElementById('edit-item-quantity').value = article.quantite;
        document.getElementById('edit-item-unit').value = article.unite;
        document.getElementById('edit-item-threshold').value = article.seuil_alerte;
        
        this.openModal('edit-modal');
    }

    // Ouverture de la modal de suppression
    openDeleteModal(id, nom) {
        this.currentDeleteId = id;
        document.getElementById('delete-item-name').textContent = nom;
        this.openModal('delete-modal');
    }

    // Ouverture d'une modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Fermeture d'une modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Nettoyage du formulaire
    clearForm() {
        document.getElementById('add-item-form').reset();
    }

    // Affichage des notifications
    showNotification(message, type = 'info') {
        // Création d'une notification temporaire
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Styles pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#2563eb'};
        `;
        
        document.body.appendChild(notification);
        
        // Suppression automatique après 4 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Styles CSS pour les animations des notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialisation de l'application
let inventoryManager;

document.addEventListener('DOMContentLoaded', () => {
    inventoryManager = new InventoryManager();
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée:', event.reason);
});

