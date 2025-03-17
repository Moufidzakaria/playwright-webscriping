import { test, expect, firefox } from "@playwright/test";
import mongoose from "mongoose";

// Définir le modèle de données pour les produits
const productSchema = new mongoose.Schema({
  title: String,
  link: String,
  price: String,
  rating: String,
  condition: String,
});
const Product = mongoose.model("Product", productSchema);

// Connexion à MongoDB
async function connectToDatabase() {
  await mongoose.connect("mongodb://localhost:27017/ebayData", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connecté à MongoDB !");
}

// Sauvegarder les données dans la base de données
async function saveProductData(productData: any) {
  const product = new Product(productData);
  await product.save();
  console.log("Produit sauvegardé dans la base de données !");
}

// Test Playwright
test.describe("Navigation", () => {
  test("navigating to the home page", async ({}) => {
    // Créer le navigateur
    const browser = await firefox.launch();
    // Créer le contexte
    const context = await browser.newContext();
    // Créer la page
    const page = await context.newPage();
    
    // Aller sur le site
    await page.goto("https://www.ebay.com");
    
    // Remplir la barre de recherche
    await page.getByPlaceholder("Search for anything").fill("sneakers");
    
    // Cliquer sur le bouton de recherche
    await page.getByRole("button", { name: "Search" }).click();
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState("load");
    
    // Récupérer les données des produits
    const products = await page.evaluate(() => {
      const elements = document.querySelectorAll(".s-item__info");
      
      // Récupérer les liens
      const links = Array.from(elements).map(
        (el) => el.querySelector("a")?.href || ""
      );
      
      // Récupérer les titres
      const titles = Array.from(elements).map(
        (el) => el.querySelector(".s-item__title")?.textContent || ""
      );
      
      // Récupérer les prix
      const prices = Array.from(elements).map(
        (el) => el.querySelector(".s-item__price")?.textContent || ""
      );
      
      // Récupérer les évaluations
      const ratings = Array.from(elements).map(
        (el) => el.querySelector(".x-star-rating")?.textContent || "No rating"
      );
      
      let productArray = [];
      for (let i = 0; i < titles.length; i++) {
        productArray.push({
          title: titles[i],
          link: links[i],
          price: prices[i],
          rating: ratings[i],
        });
      }
      return productArray;
    });

    // Connexion à la base de données
    await connectToDatabase();

    // Sauvegarder les produits dans la base de données
    for (const product of products) {
      await saveProductData(product);
    }

    // Afficher les produits sauvegardés dans la base de données
    console.log("Données des produits extraites et sauvegardées :");
    console.log(products);

    // Fermer le navigateur
    await browser.close();
  });
});