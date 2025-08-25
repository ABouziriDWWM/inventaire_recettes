// Server configuration for Inventaire de Courses et Recettes

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const routes = require('./routes');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
// Configuration CORS détaillée pour permettre les requêtes depuis le navigateur
app.use(cors({
    origin: '*', // Permet toutes les origines en développement
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Routes
app.use('/api', routes);

// Serve static assets in both development and production
// Set static folder to serve HTML files
app.use(express.static(path.join(__dirname, '/')));

// In production, use client/build
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});