import Category from "../models/category.model.js";
import { connectDB } from "./db.js";

await connectDB();

await Category.insertMany([
  {
    name: "Atta",
    slug: "atta",
    description: "Healthy flours including multigrain, whole wheat and millet-based atta.",
    isActive: true
  },
  {
    name: "Rice",
    slug: "rice",
    description: "Unpolished and organic rice varieties rich in nutrients.",
    isActive: true
  },
  {
    name: "Cooking Oils",
    slug: "oils",
    description: "Cold-pressed and traditional oils for healthy cooking.",
    isActive: true
  },
  {
    name: "Oats",
    slug: "oats",
    description: "High-fiber oats suitable for breakfast and healthy meals.",
    isActive: true
  },
  {
    name: "Flours",
    slug: "flours",
    description: "Gluten-free and traditional flours like ragi, rajgira and jowar.",
    isActive: true
  },
  {
    name: "Pulses & Dals",
    slug: "pulses",
    description: "Protein-rich pulses and dals essential for Indian diets.",
    isActive: true
  },
  {
    name: "Honey",
    slug: "honey",
    description: "Natural and raw honey sourced from forests and farms.",
    isActive: true
  },
  {
    name: "Sweeteners",
    slug: "sweeteners",
    description: "Natural sugar alternatives like jaggery and palm sugar.",
    isActive: true
  },
  {
    name: "Grains",
    slug: "grains",
    description: "Whole grains and super grains like quinoa and barley.",
    isActive: true
  },
  {
    name: "Seeds",
    slug: "seeds",
    description: "Nutrient-dense seeds such as chia, flax and pumpkin seeds.",
    isActive: true
  },
  {
    name: "Superfoods",
    slug: "superfoods",
    description: "High nutrition foods like moringa, spirulina and herbal powders.",
    isActive: true
  },
  {
    name: "Nut Butters",
    slug: "nutbutters",
    description: "Unsweetened and protein-rich nut spreads.",
    isActive: true
  },
  {
    name: "Millets",
    slug: "millets",
    description: "Traditional Indian millets with low glycemic index.",
    isActive: true
  },
  {
    name: "Beverages",
    slug: "beverages",
    description: "Healthy drinks including green tea and herbal infusions.",
    isActive: true
  }
]);

console.log("done");