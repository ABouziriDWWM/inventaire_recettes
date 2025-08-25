class AuthManager {
  constructor() {
    // Utiliser l'URL complète avec le port pour les requêtes API
    this.apiUrl = "http://localhost:5000/api";
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user"));

    this.setupEventListeners();
    
    // Simple UI update without any automatic redirection logic
    this.updateUIOnly();
  }

  // Update UI elements only - NO redirection logic
  updateUIOnly() {
    const authContainer = document.getElementById('auth-container');
    const userInfoContainer = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const currentPage = window.location.pathname.split("/").pop();

    if (this.isLoggedIn()) {
      // User is logged in - show user info
      if (authContainer) authContainer.classList.add('hidden');
      if (userInfoContainer) {
        userInfoContainer.classList.remove('hidden');
        
        // Different content based on current page
        if (currentPage === "login.html") {
          userInfoContainer.innerHTML = `
            <div class="auth-header">
              <h2><i class="fas fa-check-circle"></i> Déjà connecté</h2>
              <p>Bonjour, ${this.user.username} ! Vous êtes déjà connecté.</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="index.html" class="btn btn-primary">
                <i class="fas fa-home"></i> Aller à l'accueil
              </a>
            </div>
          `;
        } else {
          userInfoContainer.innerHTML = `
            <span class="user-greeting">Bonjour, ${this.user.username}</span>
          `;
        }
      }
      if (logoutBtn) logoutBtn.classList.remove('hidden');

      // Show protected content
      document.querySelectorAll('.protected-content').forEach((el) => {
        el.classList.remove('hidden');
      });
    } else {
      // User is not logged in - show login form
      if (authContainer) authContainer.classList.remove('hidden');
      if (userInfoContainer) userInfoContainer.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');

      // Hide protected content
      document.querySelectorAll('.protected-content').forEach((el) => {
        el.classList.add('hidden');
      });
    }
  }

  setupEventListeners() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const logoutBtn = document.getElementById("logout-btn");
    const toggleToRegister = document.getElementById("toggle-to-register");
    const toggleToLogin = document.getElementById("toggle-to-login");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.login();
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.register();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.logout();
      });
    }

    if (toggleToRegister) {
      toggleToRegister.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleAuthForms();
      });
    }

    if (toggleToLogin) {
      toggleToLogin.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleAuthForms();
      });
    }
  }

  toggleAuthForms() {
    const loginContainer = document.getElementById("login-container");
    const registerContainer = document.getElementById("register-container");

    if (loginContainer && registerContainer) {
      loginContainer.classList.toggle("hidden");
      registerContainer.classList.toggle("hidden");
    }
  }

  async login() {
    try {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      // Validate inputs
      if (!email || !password) {
        this.showNotification("Veuillez remplir tous les champs", "error");
        return;
      }

      console.log(`Tentative de connexion à ${this.apiUrl}/auth/login`);

      // Send login request
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Réponse reçue:", response.status, response.statusText);

      // Vérifier si la réponse contient du contenu JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Réponse non-JSON reçue:", textResponse);
        throw new Error("Le serveur n'a pas renvoyé de JSON valide");
      }

      const data = await response.json();
      console.log("Données reçues:", data);

      if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      // Save token and user data
      this.token = data.token;
      this.user = data.user;

      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      this.showNotification("Connexion réussie", "success");

      // Manual redirect only after successful login
      setTimeout(() => {
        console.log("Redirection manuelle vers index.html...");
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      this.showNotification(error.message, "error");
    }
  }

  // Register new user
  async register() {
    try {
      const username = document.getElementById("register-username").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const confirmPassword = document.getElementById("register-confirm-password").value;

      // Validate inputs
      if (!username || !email || !password || !confirmPassword) {
        this.showNotification("Veuillez remplir tous les champs", "error");
        return;
      }

      if (password !== confirmPassword) {
        this.showNotification("Les mots de passe ne correspondent pas", "error");
        return;
      }

      if (password.length < 6) {
        this.showNotification("Le mot de passe doit contenir au moins 6 caractères", "error");
        return;
      }

      console.log(`Tentative d'inscription à ${this.apiUrl}/auth/register`);

      // Send register request
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log("Réponse reçue:", response.status, response.statusText);

      // Vérifier si la réponse contient du contenu JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Réponse non-JSON reçue:", textResponse);
        throw new Error("Le serveur n'a pas renvoyé de JSON valide");
      }

      const data = await response.json();
      console.log("Données reçues:", data);

      if (!response.ok) {
        throw new Error(data.message || "Erreur d'inscription");
      }

      // Save token and user data
      this.token = data.token;
      this.user = data.user;

      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      this.showNotification("Inscription réussie", "success");

      // Manual redirect only after successful registration
      setTimeout(() => {
        console.log("Redirection manuelle vers index.html...");
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error("Register error:", error);
      this.showNotification(error.message, "error");
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    this.showNotification("Déconnexion réussie", "info");

    // Manual redirect to login page
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }

  isLoggedIn() {
    return this.token && this.user;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  // Show notification
  showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => {
      notification.remove();
    });

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  getNotificationIcon(type) {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  }

  // Generic API request method
  async apiRequest(url, method = "GET", body = null) {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (this.token) {
      options.headers.Authorization = `Bearer ${this.token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.apiUrl}${url}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur API");
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }
}

// Initialize AuthManager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.authManager = new AuthManager();
});
