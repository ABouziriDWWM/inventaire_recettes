// Vérifier si l'intégration MongoDB est disponible
const useMongoDBIntegration = typeof MongoDBIntegration !== "undefined";

// Données de démonstration
const sampleRecipes = [
  {
    id: 1,
    name: "Pâtes Carbonara",
    type: "diner",
    instructions:
      "1. Cuire les pâtes al dente\n2. Faire revenir les lardons\n3. Mélanger les œufs et le parmesan\n4. Tout mélanger hors du feu",
    ingredients: [
      { name: "Pâtes", quantity: 250, unit: "g" },
      { name: "Lardons", quantity: 150, unit: "g" },
      { name: "Œufs", quantity: 2, unit: "pièces" },
      { name: "Parmesan", quantity: 50, unit: "g" },
    ],
  },
  {
    id: 2,
    name: "Salade César",
    type: "dejeuner",
    instructions:
      "1. Laver et couper la salade\n2. Préparer la vinaigrette\n3. Griller les croûtons\n4. Ajouter le poulet et le parmesan",
    ingredients: [
      { name: "Laitue", quantity: 1, unit: "pièces" },
      { name: "Poulet", quantity: 200, unit: "g" },
      { name: "Croûtons", quantity: 50, unit: "g" },
      { name: "Parmesan", quantity: 30, unit: "g" },
    ],
  },
  {
    id: 3,
    name: "Omelette aux légumes",
    type: "dejeuner",
    instructions:
      "1. Battre les œufs\n2. Couper les légumes\n3. Faire revenir les légumes\n4. Ajouter les œufs et cuire",
    ingredients: [
      { name: "Œufs", quantity: 3, unit: "pièces" },
      { name: "Poivron", quantity: 1, unit: "pièces" },
      { name: "Oignon", quantity: 1, unit: "pièces" },
      { name: "Tomate", quantity: 1, unit: "pièces" },
    ],
  },
  {
    id: 4,
    name: "Poulet rôti",
    type: "diner",
    instructions:
      "1. Préchauffer le four à 200°C\n2. Assaisonner le poulet\n3. Enfourner pendant 1h\n4. Servir avec des légumes",
    ingredients: [
      { name: "Poulet", quantity: 1, unit: "pièces" },
      { name: "Pommes de terre", quantity: 500, unit: "g" },
      { name: "Carottes", quantity: 4, unit: "pièces" },
    ],
  },
];

// Planification de la semaine
let weekPlan = {
  monday: { lunch: null, dinner: 1 },
  tuesday: { lunch: 2, dinner: null },
  wednesday: { lunch: null, dinner: null },
  thursday: { lunch: null, dinner: null },
  friday: { lunch: null, dinner: null },
  saturday: { lunch: null, dinner: null },
  sunday: { lunch: null, dinner: null },
};

// Gestion des recettes
let recipes = [...sampleRecipes];
let currentDay = "";
let currentMeal = "";
let mongoIntegration = null;

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Check authentication before initializing recipes
  if (typeof AuthManager !== "undefined") {
    const authManager = new AuthManager();
    authManager.checkAuthStatus().then((isAuthenticated) => {
      if (isAuthenticated) {
        initializeRecipesApp();
      }
      // If not authenticated, AuthManager.checkAuthStatus() will redirect to login.html
    });
  } else {
    // Initialize directly without auth (fallback)
    initializeRecipesApp();
  }
});

// Extract current initialization logic into a separate function
function initializeRecipesApp() {
  renderRecipes();
  renderWeekPlan();
  generateShoppingSuggestions();

  // Setup event listeners
  document
    .getElementById("add-recipe-form")
    .addEventListener("submit", addRecipe);
  document
    .getElementById("edit-recipe-form")
    .addEventListener("submit", updateRecipe);
  // ... all other event listeners
}

// Initialisation de l'application
async function initializeApp() {
  // Initialiser l'intégration MongoDB si disponible
  if (useMongoDBIntegration) {
    mongoIntegration = new MongoDBIntegration();

    // Si l'utilisateur est authentifié, charger les recettes depuis MongoDB
    if (mongoIntegration.isAuthenticated()) {
      try {
        // Charger les recettes et le plan de la semaine depuis MongoDB
        recipes = await mongoIntegration.getRecipes();
        const weekPlanData = await mongoIntegration.getWeekPlan();
        if (weekPlanData) {
          weekPlan = weekPlanData;
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données depuis MongoDB:",
          error
        );
        showNotification("Erreur lors du chargement des données", "error");
      }
    }
  }

  // Initialisation
  renderRecipes();
  renderWeekPlan();
  generateShoppingSuggestions();

  // Gestion des formulaires
  document
    .getElementById("add-recipe-form")
    .addEventListener("submit", addRecipe);
  document
    .getElementById("edit-recipe-form")
    .addEventListener("submit", updateRecipe);

  // Bouton pour ajouter un ingrédient
  document
    .getElementById("add-ingredient")
    .addEventListener("click", addIngredientRow);
  document
    .getElementById("add-edit-ingredient")
    .addEventListener("click", addEditIngredientRow);

  // Recherche et filtres
  document
    .getElementById("search-recipe")
    .addEventListener("input", filterRecipes);
  document
    .getElementById("filter-type")
    .addEventListener("change", filterRecipes);

  // Fermeture des modales
  document
    .getElementById("close-selector-modal")
    .addEventListener("click", closeSelectorModal);
  document
    .getElementById("cancel-selector")
    .addEventListener("click", closeSelectorModal);
  document
    .getElementById("close-edit-modal")
    .addEventListener("click", closeEditModal);
  document
    .getElementById("cancel-edit")
    .addEventListener("click", closeEditModal);
}

// Rendu des recettes
function renderRecipes() {
  const container = document.getElementById("recipes-grid");
  container.innerHTML = "";

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const typeLabel = recipe.type === "dejeuner" ? "Déjeuner" : "Dîner";

    card.innerHTML = `
                    <div class="recipe-header">
                        <h3>${recipe.name}</h3>
                        <span class="recipe-type">${typeLabel}</span>
                    </div>
                    <div class="recipe-body">
                        <div class="recipe-ingredients">
                            <h4><i class="fas fa-carrot"></i> Ingrédients</h4>
                            <ul class="ingredient-list">
                                ${recipe.ingredients
                                  .map(
                                    (ing) =>
                                      `<li class="ingredient-item">
                                        <span>${ing.name}</span>
                                        <span>${ing.quantity} ${ing.unit}</span>
                                    </li>`
                                  )
                                  .join("")}
                            </ul>
                        </div>
                        ${
                          recipe.instructions
                            ? `
                        <div class="recipe-instructions">
                            <h4><i class="fas fa-list-ol"></i> Instructions</h4>
                            <p>${recipe.instructions.replace(/\n/g, "<br>")}</p>
                        </div>
                        `
                            : ""
                        }
                    </div>
                    <div class="recipe-actions">
                        <button class="btn btn-small btn-primary" onclick="editRecipe(${
                          recipe.id
                        })">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteRecipe(${
                          recipe.id
                        })">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                `;

    container.appendChild(card);
    addToggleButtons();
  });
}

// Ajout d'une recette
async function addRecipe(e) {
  e.preventDefault();

  const name = document.getElementById("recipe-name").value.trim();
  const type = document.getElementById("recipe-type").value;
  const instructions = document.getElementById("recipe-instructions").value;

  if (!name || !type) {
    showNotification("Veuillez remplir le nom et le type de recette", "error");
    return;
  }

  // Récupération des ingrédients
  const ingredients = [];
  const ingredientRows = document.querySelectorAll(
    "#ingredients-container .ingredient-row"
  );

  ingredientRows.forEach((row) => {
    const nameInput = row.querySelector(".ingredient-name");
    const quantityInput = row.querySelector(".ingredient-quantity");
    const unitSelect = row.querySelector(".ingredient-unit");

    if (nameInput.value && quantityInput.value && unitSelect.value) {
      ingredients.push({
        name: nameInput.value.trim(),
        quantity: parseFloat(quantityInput.value),
        unit: unitSelect.value,
      });
    }
  });

  if (ingredients.length === 0) {
    showNotification("Veuillez ajouter au moins un ingrédient", "error");
    return;
  }

  // Création de la recette
  const newRecipe = {
    id: Date.now().toString(), // ID unique en string pour compatibilité MongoDB
    name,
    type,
    instructions,
    ingredients,
  };

  try {
    // Si l'utilisateur est connecté et que l'intégration MongoDB est disponible
    if (mongoIntegration && mongoIntegration.isAuthenticated()) {
      // Sauvegarder dans MongoDB
      await mongoIntegration.addRecipe(newRecipe);
      // Recharger les recettes depuis MongoDB
      recipes = await mongoIntegration.getRecipes();
    } else {
      // Ajouter localement
      recipes.push(newRecipe);
    }

    renderRecipes();
    showNotification("Recette ajoutée avec succès", "success");

    // Réinitialisation du formulaire
    document.getElementById("add-recipe-form").reset();
    document.getElementById("ingredients-container").innerHTML = `
                <div class="ingredient-row">
                    <div class="form-row">
                        <div class="form-group">
                            <input type="text" class="ingredient-name" placeholder="Nom (ex: Pâtes)" required>
                        </div>
                        <div class="form-group">
                            <input type="number" class="ingredient-quantity" min="0" placeholder="Quantité" required>
                        </div>
                        <div class="form-group">
                            <select class="ingredient-unit" required>
                                <option value="">Unité</option>
                                <option value="pièces">Pièces</option>
                                <option value="kg">Kilogrammes</option>
                                <option value="g">Grammes</option>
                                <option value="L">Litres</option>
                                <option value="mL">Millilitres</option>
                                <option value="boîtes">Boîtes</option>
                                <option value="paquets">Paquets</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la recette:", error);
    showNotification("Erreur lors de l'ajout de la recette", "error");
  }
}

// Ajout d'une ligne d'ingrédient
function addIngredientRow() {
  const container = document.getElementById("ingredients-container");
  const newRow = document.createElement("div");
  newRow.className = "ingredient-row";
  newRow.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <input type="text" class="ingredient-name" placeholder="Nom (ex: Pâtes)" required>
                    </div>
                    <div class="form-group">
                        <input type="number" class="ingredient-quantity" min="0" placeholder="Quantité" required>
                    </div>
                    <div class="form-group">
                        <select class="ingredient-unit" required>
                            <option value="">Unité</option>
                            <option value="pièces">Pièces</option>
                            <option value="kg">Kilogrammes</option>
                            <option value="g">Grammes</option>
                            <option value="L">Litres</option>
                            <option value="mL">Millilitres</option>
                            <option value="boîtes">Boîtes</option>
                            <option value="paquets">Paquets</option>
                        </select>
                    </div>
                </div>
            `;
  container.appendChild(newRow);
}

// Ouverture de la modal d'édition
function editRecipe(id) {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) return;

  document.getElementById("edit-recipe-id").value = recipe.id;
  document.getElementById("edit-recipe-name").value = recipe.name;
  document.getElementById("edit-recipe-type").value = recipe.type;
  document.getElementById("edit-recipe-instructions").value =
    recipe.instructions;

  // Remplissage des ingrédients
  const container = document.getElementById("edit-ingredients-container");
  container.innerHTML = "";

  recipe.ingredients.forEach((ing) => {
    const row = document.createElement("div");
    row.className = "ingredient-row";
    row.innerHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <input type="text" class="ingredient-name" value="${
                              ing.name
                            }" required>
                        </div>
                        <div class="form-group">
                            <input type="number" class="ingredient-quantity" min="0" value="${
                              ing.quantity
                            }" required>
                        </div>
                        <div class="form-group">
                            <select class="ingredient-unit" required>
                                <option value="">Unité</option>
                                <option value="pièces" ${
                                  ing.unit === "pièces" ? "selected" : ""
                                }>Pièces</option>
                                <option value="kg" ${
                                  ing.unit === "kg" ? "selected" : ""
                                }>Kilogrammes</option>
                                <option value="g" ${
                                  ing.unit === "g" ? "selected" : ""
                                }>Grammes</option>
                                <option value="L" ${
                                  ing.unit === "L" ? "selected" : ""
                                }>Litres</option>
                                <option value="mL" ${
                                  ing.unit === "mL" ? "selected" : ""
                                }>Millilitres</option>
                                <option value="boîtes" ${
                                  ing.unit === "boîtes" ? "selected" : ""
                                }>Boîtes</option>
                                <option value="paquets" ${
                                  ing.unit === "paquets" ? "selected" : ""
                                }>Paquets</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
    container.appendChild(row);
  });

  openModal("edit-recipe-modal");
}

// Ajout d'une ligne d'ingrédient dans la modal d'édition
function addEditIngredientRow() {
  const container = document.getElementById("edit-ingredients-container");
  const newRow = document.createElement("div");
  newRow.className = "ingredient-row";
  newRow.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <input type="text" class="ingredient-name" placeholder="Nom (ex: Pâtes)" required>
                    </div>
                    <div class="form-group">
                        <input type="number" class="ingredient-quantity" min="0" placeholder="Quantité" required>
                    </div>
                    <div class="form-group">
                        <select class="ingredient-unit" required>
                            <option value="">Unité</option>
                            <option value="pièces">Pièces</option>
                            <option value="kg">Kilogrammes</option>
                            <option value="g">Grammes</option>
                            <option value="L">Litres</option>
                            <option value="mL">Millilitres</option>
                            <option value="boîtes">Boîtes</option>
                            <option value="paquets">Paquets</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
  container.appendChild(newRow);
}

// Mise à jour d'une recette
async function updateRecipe(e) {
  e.preventDefault();

  const id = document.getElementById("edit-recipe-id").value;
  const name = document.getElementById("edit-recipe-name").value.trim();
  const type = document.getElementById("edit-recipe-type").value;
  const instructions = document.getElementById(
    "edit-recipe-instructions"
  ).value;

  if (!name || !type) {
    showNotification("Veuillez remplir le nom et le type de recette", "error");
    return;
  }

  // Récupération des ingrédients
  const ingredients = [];
  const ingredientRows = document.querySelectorAll(
    "#edit-ingredients-container .ingredient-row"
  );

  ingredientRows.forEach((row) => {
    const nameInput = row.querySelector(".ingredient-name");
    const quantityInput = row.querySelector(".ingredient-quantity");
    const unitSelect = row.querySelector(".ingredient-unit");

    if (nameInput.value && quantityInput.value && unitSelect.value) {
      ingredients.push({
        name: nameInput.value.trim(),
        quantity: parseFloat(quantityInput.value),
        unit: unitSelect.value,
      });
    }
  });

  if (ingredients.length === 0) {
    showNotification("Veuillez ajouter au moins un ingrédient", "error");
    return;
  }

  // Création de l'objet recette mis à jour
  const updatedRecipe = {
    id,
    name,
    type,
    instructions,
    ingredients,
  };

  try {
    // Si l'utilisateur est connecté et que l'intégration MongoDB est disponible
    if (mongoIntegration && mongoIntegration.isAuthenticated()) {
      // Mettre à jour dans MongoDB
      await mongoIntegration.updateRecipe(updatedRecipe);
      // Recharger les recettes depuis MongoDB
      recipes = await mongoIntegration.getRecipes();
    } else {
      // Mise à jour locale
      const recipeIndex = recipes.findIndex(
        (r) => r.id.toString() === id.toString()
      );
      if (recipeIndex !== -1) {
        recipes[recipeIndex] = updatedRecipe;
      }
    }

    renderRecipes();
    renderWeekPlan();
    generateShoppingSuggestions();
    showNotification("Recette mise à jour avec succès", "success");
    closeEditModal();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la recette:", error);
    showNotification("Erreur lors de la mise à jour de la recette", "error");
  }
}

// Suppression d'une recette
async function deleteRecipe(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
    try {
      // Si l'utilisateur est connecté et que l'intégration MongoDB est disponible
      if (mongoIntegration && mongoIntegration.isAuthenticated()) {
        // Supprimer de MongoDB
        await mongoIntegration.deleteRecipe(id);
        // Recharger les recettes depuis MongoDB
        recipes = await mongoIntegration.getRecipes();
      } else {
        // Suppression locale
        recipes = recipes.filter((r) => r.id.toString() !== id.toString());
      }

      // Retirer la recette de la planification
      for (const day in weekPlan) {
        for (const meal in weekPlan[day]) {
          if (
            weekPlan[day][meal] &&
            weekPlan[day][meal].toString() === id.toString()
          ) {
            weekPlan[day][meal] = null;
          }
        }
      }

      // Si l'utilisateur est connecté, mettre à jour le plan de la semaine dans MongoDB
      if (mongoIntegration && mongoIntegration.isAuthenticated()) {
        await mongoIntegration.updateWeekPlan(weekPlan);
      }

      renderRecipes();
      renderWeekPlan();
      generateShoppingSuggestions();
      showNotification("Recette supprimée avec succès", "success");
    } catch (error) {
      console.error("Erreur lors de la suppression de la recette:", error);
      showNotification("Erreur lors de la suppression de la recette", "error");
    }
  }
}

// Filtrage des recettes
function filterRecipes() {
  const searchTerm = document
    .getElementById("search-recipe")
    .value.toLowerCase();
  const typeFilter = document.getElementById("filter-type").value;

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm);
    const matchesType = typeFilter === "all" || recipe.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const container = document.getElementById("recipes-grid");
  container.innerHTML = "";

  if (filteredRecipes.length === 0) {
    container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-utensils"></i>
                        <h3>Aucune recette trouvée</h3>
                        <p>Essayez de modifier vos critères de recherche</p>
                    </div>
                `;
    return;
  }

  filteredRecipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const typeLabel = recipe.type === "dejeuner" ? "Déjeuner" : "Dîner";

    card.innerHTML = `
                    <div class="recipe-header">
                        <h3>${recipe.name}</h3>
                        <span class="recipe-type">${typeLabel}</span>
                    </div>
                    <div class="recipe-body">
                        <div class="recipe-ingredients">
                            <h4><i class="fas fa-carrot"></i> Ingrédients</h4>
                            <ul class="ingredient-list">
                                ${recipe.ingredients
                                  .map(
                                    (ing) =>
                                      `<li class="ingredient-item">
                                        <span>${ing.name}</span>
                                        <span>${ing.quantity} ${ing.unit}</span>
                                    </li>`
                                  )
                                  .join("")}
                            </ul>
                        </div>
                        ${
                          recipe.instructions
                            ? `
                        <div class="recipe-instructions">
                            <h4><i class="fas fa-list-ol"></i> Instructions</h4>
                            <p>${recipe.instructions.replace(/\n/g, "<br>")}</p>
                        </div>
                        `
                            : ""
                        }
                    </div>
                    <div class="recipe-actions">
                        <button class="btn btn-small btn-primary" onclick="editRecipe(${
                          recipe.id
                        })">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteRecipe(${
                          recipe.id
                        })">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                `;

    container.appendChild(card);
  });
}

// Rendu de la planification de la semaine
function renderWeekPlan() {
  for (const day in weekPlan) {
    for (const meal in weekPlan[day]) {
      const container = document.getElementById(`${day}-${meal}`);
      const recipeId = weekPlan[day][meal];

      if (recipeId) {
        const recipe = recipes.find((r) => r.id === recipeId);
        if (recipe) {
          container.innerHTML = `
                                <h4>${recipe.name}</h4>
                                <p><small>${recipe.ingredients.length} ingrédients</small></p>
                                <button class="btn btn-small btn-danger" onclick="removeRecipeFromPlan('${day}', '${meal}')">
                                    <i class="fas fa-times"></i> Retirer
                                </button>
                            `;
        } else {
          container.innerHTML = "";
          weekPlan[day][meal] = null;
        }
      } else {
        container.innerHTML = "";
      }
    }
  }
  addToggleButtons();
}

// Ouverture du sélecteur de recettes
function openRecipeSelector(day, meal) {
  currentDay = day;
  currentMeal = meal;

  const container = document.getElementById("selector-recipes-list");
  container.innerHTML = "";

  const filteredRecipes = recipes.filter(
    (r) => r.type === (meal === "lunch" ? "dejeuner" : "diner")
  );

  if (filteredRecipes.length === 0) {
    container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-utensils"></i>
                        <h3>Aucune recette disponible</h3>
                        <p>Créez d'abord des recettes pour ${
                          meal === "lunch" ? "déjeuner" : "dîner"
                        }</p>
                    </div>
                `;
  } else {
    filteredRecipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "recipe-card";

      card.innerHTML = `
                        <div class="recipe-header">
                            <h3>${recipe.name}</h3>
                        </div>
                        <div class="recipe-body">
                            <div class="recipe-ingredients">
                                <h4><i class="fas fa-carrot"></i> Ingrédients</h4>
                                <ul class="ingredient-list">
                                    ${recipe.ingredients
                                      .slice(0, 3)
                                      .map(
                                        (ing) =>
                                          `<li class="ingredient-item">
                                            <span>${ing.name}</span>
                                            <span>${ing.quantity} ${ing.unit}</span>
                                        </li>`
                                      )
                                      .join("")}
                                    ${
                                      recipe.ingredients.length > 3
                                        ? `<li>... et ${
                                            recipe.ingredients.length - 3
                                          } de plus</li>`
                                        : ""
                                    }
                                </ul>
                            </div>
                        </div>
                        <div class="recipe-actions">
                            <button class="btn btn-small btn-primary" onclick="selectRecipe(${
                              recipe.id
                            })">
                                <i class="fas fa-check"></i> Sélectionner
                            </button>
                        </div>
                    `;

      container.appendChild(card);
    });
  }

  openModal("recipe-selector-modal");
}

// Sélection d'une recette pour la planification
async function selectRecipe(id) {
  weekPlan[currentDay][currentMeal] = id;

  // Si l'utilisateur est connecté et que l'intégration MongoDB est disponible
  if (mongoIntegration && mongoIntegration.isAuthenticated()) {
    try {
      // Mettre à jour le plan de la semaine dans MongoDB
      await mongoIntegration.updateWeekPlan(weekPlan);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du plan de la semaine:",
        error
      );
      showNotification("Erreur lors de la mise à jour du plan", "error");
    }
  }

  renderWeekPlan();
  generateShoppingSuggestions();
  closeSelectorModal();
  showNotification("Recette ajoutée à la planification", "success");
}

// Retrait d'une recette de la planification
async function removeRecipeFromPlan(day, meal) {
  weekPlan[day][meal] = null;

  // Si l'utilisateur est connecté et que l'intégration MongoDB est disponible
  if (mongoIntegration && mongoIntegration.isAuthenticated()) {
    try {
      // Mettre à jour le plan de la semaine dans MongoDB
      await mongoIntegration.updateWeekPlan(weekPlan);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du plan de la semaine:",
        error
      );
      showNotification("Erreur lors de la mise à jour du plan", "error");
    }
  }

  renderWeekPlan();
  generateShoppingSuggestions();
  showNotification("Recette retirée de la planification", "success");
}

// Génération des suggestions d'achat
function generateShoppingSuggestions() {
  const shoppingList = {};

  // Parcourir tous les jours et repas planifiés
  for (const day in weekPlan) {
    for (const meal in weekPlan[day]) {
      const recipeId = weekPlan[day][meal];
      if (recipeId) {
        const recipe = recipes.find((r) => r.id === recipeId);
        if (recipe) {
          // Ajouter chaque ingrédient à la liste de courses
          recipe.ingredients.forEach((ing) => {
            const key = `${ing.name}|${ing.unit}`;
            if (shoppingList[key]) {
              shoppingList[key].quantity += ing.quantity;
            } else {
              shoppingList[key] = {
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
              };
            }
          });
        }
      }
    }
  }

  // Convertir l'objet en tableau
  const suggestions = Object.values(shoppingList);

  // Afficher les suggestions
  const container = document.getElementById("suggestions-list");

  if (suggestions.length === 0) {
    container.innerHTML = `
                    <div class="suggestion-item">
                        <div class="suggestion-info">
                            <i class="fas fa-shopping-basket"></i>
                            <span>Planifiez vos recettes pour voir les suggestions d'achat</span>
                        </div>
                    </div>
                `;
  } else {
    container.innerHTML = suggestions
      .map(
        (item) => `
                    <div class="suggestion-item">
                        <div class="suggestion-info">
                            <i class="fas fa-shopping-cart"></i>
                            <span><strong>${item.name}</strong> - ${item.quantity} ${item.unit}</span>
                        </div>
                    </div>
                `
      )
      .join("");
  }
}

// Ouverture d'une modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Fermeture du sélecteur de recettes
function closeSelectorModal() {
  document.getElementById("recipe-selector-modal").classList.remove("active");
  document.body.style.overflow = "auto";
}

// Fermeture de la modal d'édition
function closeEditModal() {
  document.getElementById("edit-recipe-modal").classList.remove("active");
  document.body.style.overflow = "auto";
}

// Affichage des notifications
function showNotification(message, type = "info") {
  // Création d'une notification temporaire
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
                <i class="fas fa-${
                  type === "success"
                    ? "check-circle"
                    : type === "error"
                    ? "exclamation-circle"
                    : "info-circle"
                }"></i>
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
                background: ${
                  type === "success"
                    ? "#059669"
                    : type === "error"
                    ? "#dc2626"
                    : "#2563eb"
                };
            `;

  document.body.appendChild(notification);

  // Suppression automatique après 4 secondes
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-in forwards";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Gestion de la bascule mobile pour les sections
class MobileToggleManager {
  constructor() {
    this.isVisible = false;
    this.sections = [];
    this.toggleBtn = null;
    this.init();
  }

  init() {
    // Attendre que le DOM soit chargé
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  toggleSections() {
    this.isVisible = !this.isVisible;

    this.sections.forEach((section, index) => {
      if (this.isVisible) {
        // Afficher avec un délai progressif pour un effet en cascade
        setTimeout(() => {
          section.classList.add("active");
        }, index * 100);
      } else {
        // Masquer immédiatement
        section.classList.remove("active");
      }
    });

    this.updateButtonState();
    this.showToggleNotification();
  }

  updateButtonState() {
    if (!this.toggleBtn) return;

    const icon = this.toggleBtn.querySelector("i");
    const text = this.toggleBtn.querySelector("span");

    if (this.isVisible) {
      this.toggleBtn.classList.add("active");
      icon.className = "fas fa-eye-slash";
      text.textContent = "Masquer les sections";
    } else {
      this.toggleBtn.classList.remove("active");
      icon.className = "fas fa-eye";
      text.textContent = "Afficher les sections";
    }
  }

  showToggleNotification() {
    // Créer une notification temporaire
    const notification = document.createElement("div");
    notification.className = "toggle-notification";
    notification.innerHTML = `
            <i class="fas fa-${this.isVisible ? "eye" : "eye-slash"}"></i>
            <span>Sections ${this.isVisible ? "affichées" : "masquées"}</span>
        `;

    // Styles pour la notification
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${
              this.isVisible ? "var(--success-color)" : "var(--warning-color)"
            };
            color: white;
            border-radius: var(--border-radius);
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: var(--shadow-lg);
            animation: slideInRight 0.3s ease-out;
            font-size: 0.9rem;
        `;

    document.body.appendChild(notification);

    // Suppression automatique après 2 secondes
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-in forwards";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  handleResize() {
    // Réinitialiser l'état lors du changement de taille d'écran
    if (!this.isMobile()) {
      // Sur desktop, toujours afficher les sections
      this.sections.forEach((section) => {
        section.classList.add("active");
      });
      this.isVisible = true;
    } else {
      // Sur mobile, maintenir l'état actuel
      this.updateButtonState();
    }
  }

  isMobile() {
    return window.innerWidth <= 768;
  }

  // Méthode publique pour basculer une section spécifique
  toggleSection(sectionClass) {
    const section = document.querySelector(`.${sectionClass}`);
    if (section) {
      section.classList.toggle("active");
    }
  }

  // Méthode publique pour afficher toutes les sections
  showAllSections() {
    this.isVisible = true;
    this.sections.forEach((section) => {
      section.classList.add("active");
    });
    this.updateButtonState();
  }

  // Méthode publique pour masquer toutes les sections
  hideAllSections() {
    this.isVisible = false;
    this.sections.forEach((section) => {
      section.classList.remove("active");
    });
    this.updateButtonState();
  }
}

// Styles CSS pour les animations des notifications
const toggleNotificationStyles = document.createElement("style");
toggleNotificationStyles.textContent = `
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
document.head.appendChild(toggleNotificationStyles);

// Initialiser le gestionnaire de bascule mobile
let mobileToggleManager;

// S'assurer que le gestionnaire est initialisé après le DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    mobileToggleManager = new MobileToggleManager();
  });
} else {
  mobileToggleManager = new MobileToggleManager();
}

// Exposer le gestionnaire globalement pour un accès facile
window.mobileToggleManager = mobileToggleManager;

// @@
// bouttons d'affichage pour mobile

function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}

// Replace the existing addToggleButtons and resize event listener with this improved version:

let resizeTimeout;
// Function to add toggle buttons to the page
function addToggleButtons() {
  // Clean up existing buttons and events first
  document.querySelectorAll(".mobile-toggle-btn").forEach((btn) => {
    btn.removeEventListener("click", handleToggleClick);
    btn.remove();
  });

  // Check if the device is mobile
  if (isMobile()) {
    // For each day-card
    document.querySelectorAll(".day-card").forEach((card) => {
      // Set up the toggle button for the day-card
      setupToggleButton(card, getDayName(card));
    });

    // For each recipe-card
    document.querySelectorAll(".recipe-card").forEach((card) => {
      // Get the body of the recipe-card
      const body = card.querySelector(".recipe-body");
      // If the body exists, set up the toggle button for the recipe-card
      if (body) {
        setupRecipeToggleButton(card, body);
      }
    });
  } else {
    // On desktop, ensure all content is visible
    document.querySelectorAll(".day-card, .recipe-body").forEach((el) => {
      // Set the display style to empty string
      el.style.display = "";
      // Add the active class to the element
      el.classList.add("active");
    });
  }
}

function handleToggleClick(event) {
  const btn = event.currentTarget;
  const isActive = btn.classList.toggle("active");

  // Handle day-card toggle
  if (btn.closest(".day-card")) {
    const content = Array.from(btn.closest(".day-card").children).filter(
      (el) => !el.classList.contains("mobile-toggle-btn")
    );

    // Only toggle display when button is clicked
    content.forEach((el) => {
      el.style.display = isActive ? "" : "none";
    });

    // Update button text and icon
    const dayName = getDayName(btn.closest(".day-card"));
    btn.querySelector("span").textContent = isActive
      ? `Masquer ${dayName}`
      : `Afficher ${dayName}`;
  }

  // Handle recipe-card toggle
  if (btn.closest(".recipe-card")) {
    const body = btn.closest(".recipe-card").querySelector(".recipe-body");
    if (body) {
      body.style.display = isActive ? "" : "none";
    }
    btn.querySelector("span").textContent = isActive ? "Masquer" : "Afficher";
  }

  // Update icon
  btn.querySelector("i").className = isActive
    ? "fas fa-chevron-up"
    : "fas fa-chevron-down";
}

function getDayName(card) {
  const titleEl = card.querySelector(".day-title");
  if (titleEl) return titleEl.textContent.trim();

  const h = card.querySelector("h3,h4");
  return h ? h.textContent.trim() : "";
}

// Function to setup a toggle button for a card element
function setupToggleButton(card, name) {
  // Create a button element
  const btn = document.createElement("button");
  // Set the class name of the button
  btn.className = "mobile-toggle-btn";
  // Set the type of the button
  btn.type = "button";

  // Insert the button before the first child of the card
  card.insertBefore(btn, card.firstChild);

  // Get all children of the card except the button
  const content = Array.from(card.children).filter(
    (el) => !el.classList.contains("mobile-toggle-btn")
  );

  // Function to update button state
  //This function updates the state of the button based on whether it is visible or not
  function updateButtonState(isVisible) {
    //If the button is visible
    if (isVisible) {
      //Set the innerHTML of the button to show the chevron up icon and the text "Masquer" followed by the name of the content
      btn.innerHTML = `<i class="fas fa-chevron-up"></i> <span>Masquer ${name}</span>`;
      //Add the "active" class to the button
      btn.classList.add("active");
      //Set the display of each element in the content array to an empty string, making them visible
      content.forEach((el) => (el.style.display = ""));
      //If the button is not visible
    } else {
      //Set the innerHTML of the button to show the chevron down icon and the text "Afficher" followed by the name of the content
      btn.innerHTML = `<i class="fas fa-chevron-down"></i> <span>Afficher ${name}</span>`;
      //Remove the "active" class from the button
      btn.classList.remove("active");
      //Set the display of each element in the content array to "none", making them invisible
      content.forEach((el) => (el.style.display = "none"));
    }
  }

  // Initialize as visible
  // updateButtonState(true);
  updateButtonState(false);

  btn.addEventListener("click", () => {
    const isCurrentlyVisible = btn.classList.contains("active");
    updateButtonState(!isCurrentlyVisible);
  });
}

function setupRecipeToggleButton(card, body) {
  const btn = document.createElement("button");
  btn.className = "mobile-toggle-btn";
  btn.type = "button";
  btn.innerHTML = '<i class="fas fa-chevron-down"></i> <span>Afficher</span>';
  btn.style.marginBottom = "10px";

  card.insertBefore(btn, body);

  // Hide body immediately
  body.style.display = "none";

  btn.addEventListener("click", handleToggleClick);
}

// Improved resize handler with debouncing
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    addToggleButtons();
  }, 250);
});

// Initialize buttons after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addToggleButtons);
} else {
  addToggleButtons();
}

// Ajoute les boutons au chargement et au resize
window.addEventListener("DOMContentLoaded", addToggleButtons);
window.addEventListener("resize", () => {
  // Nettoie les boutons si desktop
  if (!isMobile()) {
    document
      .querySelectorAll(".mobile-toggle-btn")
      .forEach((btn) => btn.remove());
    document
      .querySelectorAll(".day-card, .recipe-body")
      .forEach((el) => el.classList.add("active"));
  } else {
    addToggleButtons();
  }
});
