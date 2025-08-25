// Authentication Controller for Inventaire de Courses et Recettes

const { User } = require("./memoryStorage");
const jwt = require("jsonwebtoken");

// Helper function to generate JWT token
const generateJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret_key", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation des champs requis
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis (username, email, password)",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    });
    
    await user.save();

    // Generate token
    const token = generateJwtToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    

    
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un email et un mot de passe",
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
      });
    }

    // Generate token
    const token = generateJwtToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    

    
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      error: error.message,
    });
  }
};

// Get current logged in user
exports.getMe = async (req, res) => {
  try {
    const users = await User.find();
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
      error: error.message,
    });
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    // Or check if token exists in cookies
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Non autorisé à accéder à cette ressource",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );

    // Add user to request
    const users = await User.find();
    req.user = users.find(u => u.id === decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Non autorisé à accéder à cette ressource",
    });
  }
};
