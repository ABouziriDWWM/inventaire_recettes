# Application de Recettes - Version Mobile Interactive

## Modifications apportées

Cette version améliore l'application de recettes originale en ajoutant des fonctionnalités d'interactivité mobile pour une meilleure expérience utilisateur sur les appareils mobiles.

## Nouvelles fonctionnalités

### 🔄 Bouton de bascule mobile
- **Bouton "Afficher/Masquer les sections"** : Apparaît automatiquement sur les écrans de moins de 768px de largeur
- **Contrôle total** : Permet d'afficher ou de masquer toutes les sections d'un seul clic
- **Interface intuitive** : Icône et texte qui changent selon l'état (œil ouvert/fermé)
- **Animations fluides** : Transitions douces lors de l'affichage/masquage des sections

### 📱 Optimisation mobile
- **Sections collapsibles** : Toutes les sections principales peuvent être masquées/affichées
- **Gestion intelligente** : Sur desktop, toutes les sections restent visibles
- **Responsive design** : Adaptation automatique selon la taille d'écran
- **Notifications visuelles** : Messages temporaires confirmant les actions

## Sections interactives

Les sections suivantes sont maintenant contrôlables via le bouton mobile :

1. **Section d'ajout de recette** (`add-recipe-section`)
2. **Section des recettes** (`recipes-section`)
3. **Section de planification de la semaine** (`week-section`)
4. **Section des suggestions d'achat** (`suggestions-section`)

## Fonctionnement technique

### HTML
- Ajout d'un conteneur pour le bouton de bascule mobile
- Attribution de la classe `collapsible-section` à toutes les sections principales
- Structure sémantique préservée

### CSS
- Media queries pour détecter les écrans mobiles (≤ 768px)
- Styles spécifiques pour le bouton de bascule
- Animations CSS pour les transitions fluides
- Classes d'état pour gérer la visibilité des sections

### JavaScript
- Classe `MobileToggleManager` pour gérer l'état des sections
- Détection automatique de la taille d'écran
- Gestion des événements de redimensionnement
- Notifications temporaires pour le feedback utilisateur
- API publique pour contrôler les sections individuellement

## Utilisation

### Sur mobile (≤ 768px)
1. Le bouton "Afficher/Masquer les sections" apparaît automatiquement
2. Par défaut, toutes les sections sont masquées pour économiser l'espace
3. Cliquer sur le bouton pour afficher toutes les sections avec un effet en cascade
4. Cliquer à nouveau pour masquer toutes les sections

### Sur desktop (> 768px)
- Toutes les sections restent visibles en permanence
- Le bouton de bascule est automatiquement masqué
- Comportement normal de l'application

## Personnalisation

### Modifier le seuil de détection mobile
```css
@media (max-width: 768px) { /* Changer cette valeur */ }
```

### Contrôler les sections via JavaScript
```javascript
// Afficher toutes les sections
window.mobileToggleManager.showAllSections();

// Masquer toutes les sections
window.mobileToggleManager.hideAllSections();

// Basculer une section spécifique
window.mobileToggleManager.toggleSection('add-recipe-section');
```

## Compatibilité

- **Navigateurs modernes** : Chrome, Firefox, Safari, Edge
- **Appareils mobiles** : iOS, Android
- **Responsive** : Tablettes et smartphones
- **Accessibilité** : Support du clavier et lecteurs d'écran

## Améliorations futures possibles

1. **Contrôle individuel** : Boutons pour chaque section
2. **Mémorisation** : Sauvegarder l'état des sections dans localStorage
3. **Animations avancées** : Effets de transition plus sophistiqués
4. **Thèmes** : Mode sombre/clair pour le bouton
5. **Gestes tactiles** : Support du swipe pour masquer/afficher

## Structure des fichiers

```
recettes-mobile/
├── recettes.html     # Structure HTML avec bouton mobile
├── style.css         # Styles CSS avec media queries
├── recettes.js       # Logique JavaScript et gestionnaire mobile
└── README.md         # Cette documentation
```

## Installation

1. Copier tous les fichiers dans un répertoire
2. Ouvrir `recettes.html` dans un navigateur
3. Redimensionner la fenêtre ou utiliser les outils de développement pour simuler un mobile
4. Tester le bouton de bascule

L'application est maintenant optimisée pour une utilisation mobile avec un contrôle total sur l'affichage des sections !

