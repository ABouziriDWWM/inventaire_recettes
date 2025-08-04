// API Routes for Inventaire de Courses et Recettes

const express = require('express');
const router = express.Router();
const { Article, Recipe, WeekPlan } = require('./db');
const authController = require('./authController');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authController.protect, authController.getMe);

// Article routes
router.route('/articles')
    .get(authController.protect, async (req, res) => {
        try {
            const articles = await Article.find({ user: req.user.id });
            res.status(200).json({
                success: true,
                count: articles.length,
                data: articles
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des articles',
                error: error.message
            });
        }
    })
    .post(authController.protect, async (req, res) => {
        try {
            // Add user to request body
            req.body.user = req.user.id;
            
            const article = await Article.create(req.body);
            res.status(201).json({
                success: true,
                data: article
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la création de l\'article',
                error: error.message
            });
        }
    });

router.route('/articles/:id')
    .get(authController.protect, async (req, res) => {
        try {
            const article = await Article.findById(req.params.id);
            
            if (!article) {
                return res.status(404).json({
                    success: false,
                    message: 'Article non trouvé'
                });
            }
            
            // Make sure user owns the article
            if (article.user.toString() !== req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Non autorisé à accéder à cet article'
                });
            }
            
            res.status(200).json({
                success: true,
                data: article
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de l\'article',
                error: error.message
            });
        }
    })
    .put(authController.protect, async (req, res) => {
        try {
            let article = await Article.findById(req.params.id);
            
            if (!article) {
                return res.status(404).json({
                    success: false,
                    message: 'Article non trouvé'
                });
            }
            
            // Make sure user owns the article
            if (article.user.toString() !== req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Non autorisé à modifier cet article'
                });
            }
            
            article = await Article.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            
            res.status(200).json({
                success: true,
                data: article
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'article',
                error: error.message
            });
        }
    })
    .delete(authController.protect, async (req, res) => {
        try {
            const article = await Article.findById(req.params.id);
            
            if (!article) {
                return res.status(404).json({
                    success: false,
                    message: 'Article non trouvé'
                });
            }
            
            // Make sure user owns the article
            if (article.user.toString() !== req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Non autorisé à supprimer cet article'
                });
            }
            
            await article.remove();
            
            res.status(200).json({
                success: true,
                data: {}
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'article',
                error: error.message
            });
        }
    });

// Recipe routes
router.route('/recipes')
    .get(authController.protect, async (req, res) => {
        try {
            const recipes = await Recipe.find({ user: req.user.id });
            res.status(200).json({
                success: true,
                count: recipes.length,
                data: recipes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des recettes',
                error: error.message
            });
        }
    })
    .post(authController.protect, async (req, res) => {
        try {
            // Add user to request body
            req.body.user = req.user.id;
            
            const recipe = await Recipe.create(req.body);
            res.status(201).json({
                success: true,
                data: recipe
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la création de la recette',
                error: error.message
            });
        }
    });

router.route('/recipes/:id')
    .get(authController.protect, async (req, res) => {
        try {
            const recipe = await Recipe.findById(req.params.id);
            
            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    message: 'Recette non trouvée'
                });
            }
            
            // Make sure user owns the recipe
            if (recipe.user.toString() !== req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Non autorisé à accéder à cette recette'
                });
            }
            
            res.status(200).json({
                success: true,
                data: recipe
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la recette',
                error: error.message
            });
        }
    })
    .put(authController.protect, async (req, res) => {
        try {
            let recipe = await Recipe.findById(req.params.id);
            
            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    message: 'Recette non trouvée'
                });
            }
            
            // Make sure user owns the recipe
            if (recipe.user.toString() !== req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Non autorisé à modifier cette recette'
                });
            }
            
            recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            });
            
            res.status(200).json({
                success: true,
                data: recipe
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la recette',
                error: error.message
            });
        }
    })
    .delete(authController.protect, async (req, res) => {
        try {
            const recipe = await Recipe.findById(req.params.id);
            
            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    message: 'Recette non trouvée'
                });
            }
            
            // Make sure user owns the recipe
            if (recipe.user.toString() !== req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Non autorisé à supprimer cette recette'
                });
            }
            
            await recipe.remove();
            
            res.status(200).json({
                success: true,
                data: {}
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la recette',
                error: error.message
            });
        }
    });

// Week Plan routes
router.route('/weekplan')
    .get(authController.protect, async (req, res) => {
        try {
            // Find user's week plan or create a new one if it doesn't exist
            let weekPlan = await WeekPlan.findOne({ user: req.user.id })
                .populate('monday.lunch monday.dinner')
                .populate('tuesday.lunch tuesday.dinner')
                .populate('wednesday.lunch wednesday.dinner')
                .populate('thursday.lunch thursday.dinner')
                .populate('friday.lunch friday.dinner')
                .populate('saturday.lunch saturday.dinner')
                .populate('sunday.lunch sunday.dinner');
            
            if (!weekPlan) {
                weekPlan = await WeekPlan.create({
                    user: req.user.id,
                    monday: { lunch: null, dinner: null },
                    tuesday: { lunch: null, dinner: null },
                    wednesday: { lunch: null, dinner: null },
                    thursday: { lunch: null, dinner: null },
                    friday: { lunch: null, dinner: null },
                    saturday: { lunch: null, dinner: null },
                    sunday: { lunch: null, dinner: null }
                });
            }
            
            res.status(200).json({
                success: true,
                data: weekPlan
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du plan de la semaine',
                error: error.message
            });
        }
    })
    .put(authController.protect, async (req, res) => {
        try {
            // Find user's week plan or create a new one if it doesn't exist
            let weekPlan = await WeekPlan.findOne({ user: req.user.id });
            
            if (!weekPlan) {
                weekPlan = await WeekPlan.create({
                    ...req.body,
                    user: req.user.id
                });
            } else {
                weekPlan = await WeekPlan.findOneAndUpdate(
                    { user: req.user.id },
                    req.body,
                    { new: true, runValidators: true }
                );
            }
            
            res.status(200).json({
                success: true,
                data: weekPlan
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la mise à jour du plan de la semaine',
                error: error.message
            });
        }
    });

module.exports = router;