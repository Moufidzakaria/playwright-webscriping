const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ebayData', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connecté !");
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error);
    process.exit(1);
  }
};

// Modèle MongoDB
const ProductSchema = new mongoose.Schema({
  title: String,
  link: String,
  price: String,
  rating: String,
});
const Product = mongoose.model("Product", ProductSchema);

// Route pour récupérer les produits
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
