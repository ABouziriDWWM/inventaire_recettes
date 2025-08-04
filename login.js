// Login and Authentication Management for Inventaire de Courses et Recettes

class AuthManager {
    constructor() {
        this.apiUrl = '/api';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        
        this.setupEventListeners();
        this.updateUI();
    }

    // Setup event listeners for auth forms
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Toggle between login and register forms
        const toggleForms = document.querySelectorAll('.toggle-form');
        toggleForms.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthForms();
            });
        });
    }

    // Toggle between login and register forms
    toggleAuthForms() {
        const loginContainer = document.getElementById('login-container');
        const registerContainer = document.getElementById('register-container');

        if (loginContainer && registerContainer) {
            loginContainer.classList.toggle('hidden');
            registerContainer.classList.toggle('hidden');
        }
    }

    // Login user
    async login() {
        try {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Validate inputs
            if (!email || !password) {
                this.showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }

            // Send login request
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }

            // Save token and user data
            this.token = data.token;
            this.user = data.user;

            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            this.showNotification('Connexion réussie', 'success');
            this.updateUI();

            // Redirect to home page after successful login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // Register new user
    async register() {
        try {
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            // Validate inputs
            if (!username || !email || !password || !confirmPassword) {
                this.showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }

            if (password !== confirmPassword) {
                this.showNotification('Les mots de passe ne correspondent pas', 'error');
                return;
            }

            if (password.length < 6) {
                this.showNotification('Le mot de passe doit contenir au moins 6 caractères', 'error');
                return;
            }

            // Send register request
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur d\'inscription');
            }

            // Save token and user data
            this.token = data.token;
            this.user = data.user;

            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            this.showNotification('Inscription réussie', 'success');
            this.updateUI();

            // Redirect to home page after successful registration
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Register error:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // Logout user
    logout() {
        // Clear token and user data
        this.token = null;
        this.user = null;

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        this.showNotification('Déconnexion réussie', 'success');
        this.updateUI();

        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.token;
    }

    // Get auth token
    getToken() {
        return this.token;
    }

    // Get current user
    getUser() {
        return this.user;
    }

    // Update UI based on auth state
    updateUI() {
        const authContainer = document.getElementById('auth-container');
        const userInfoContainer = document.getElementById('user-info');
        const logoutBtn = document.getElementById('logout-btn');

        if (this.isLoggedIn()) {
            // User is logged in
            if (authContainer) authContainer.classList.add('hidden');
            if (userInfoContainer) {
                userInfoContainer.classList.remove('hidden');
                userInfoContainer.innerHTML = `
                    <span class="user-greeting">Bonjour, ${this.user.username}</span>
                `;
            }
            if (logoutBtn) logoutBtn.classList.remove('hidden');

            // Show protected content
            document.querySelectorAll('.protected-content').forEach(el => {
                el.classList.remove('hidden');
            });
        } else {
            // User is not logged in
            if (authContainer) authContainer.classList.remove('hidden');
            if (userInfoContainer) userInfoContainer.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');

            // Hide protected content
            document.querySelectorAll('.protected-content').forEach(el => {
                el.classList.add('hidden');
            });

            // Redirect to login page if on a protected page
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage !== 'login.html' && document.querySelector('.requires-auth')) {
                window.location.href = 'login.html';
            }
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Add close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'error':
                return 'fa-exclamation-circle';
            case 'warning':
                return 'fa-exclamation-triangle';
            default:
                return 'fa-info-circle';
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
                // If unauthorized, logout user
                if (response.status === 401) {
                    this.logout();
                }
                throw new Error(data.message || 'Erreur de requête API');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});