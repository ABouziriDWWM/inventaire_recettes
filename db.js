// MongoDB Database Configuration for Inventaire de Courses et Recettes

// Required dependencies
// Note: You'll need to install these packages using npm:
// npm install express mongoose bcrypt jsonwebtoken cors dotenv

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// In your main server file (app.js or server.js)
const express = require("express");
const authController = require("./authController");

const app = express();

// ✅ Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Registration route
app.post("/api/register", authController.register);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// MongoDB Connection
const connectDB = async () => {
  try {
    // Use environment variables for sensitive information in production
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/inventaire_recettes",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, // Don't return password in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || "your_jwt_secret_key",
    {
      expiresIn: "30d",
    }
  );
};

// Article Schema (for inventory items)
const articleSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom de l'article est requis"],
    trim: true,
  },
  quantite: {
    type: Number,
    required: [true, "La quantité est requise"],
    min: [0, "La quantité ne peut pas être négative"],
  },
  unite: {
    type: String,
    required: [true, "L'unité est requise"],
    enum: ["pièces", "kg", "g", "L", "mL", "boîtes", "paquets"],
  },
  seuil: {
    type: Number,
    required: [true, "Le seuil d'alerte est requis"],
    min: [0, "Le seuil ne peut pas être négatif"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Recipe Schema
const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom de la recette est requis"],
    trim: true,
  },
  type: {
    type: String,
    required: [true, "Le type de recette est requis"],
    enum: ["dejeuner", "diner"],
  },
  instructions: {
    type: String,
    required: [true, "Les instructions sont requises"],
  },
  ingredients: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Week Plan Schema
const weekPlanSchema = new mongoose.Schema({
  monday: {
    lunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    dinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
  },
  tuesday: {
    lunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    dinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
  },
  wednesday: {
    lunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    dinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
  },
  thursday: {
    lunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    dinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
  },
  friday: {
    lunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    dinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
  },
  saturday: {
    lunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    dinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
  },
  sunday: {
    lunch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
    dinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create models
const User = mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);
const Recipe = mongoose.model("Recipe", recipeSchema);
const WeekPlan = mongoose.model("WeekPlan", weekPlanSchema);

module.exports = {
  connectDB,
  User,
  Article,
  Recipe,
  WeekPlan,
};
