import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { recipes, users } from "@/db/schema";
import type { CreateRecipeInput } from "@/schema/recipe-schema";

// Seed starter accounts and sample recipes. Run with: npm run db:seed
const accounts = [
  { name: "Admin", email: "admin@example.com", password: "Password123", role: "ADMIN" as const },
  { name: "User", email: "user@example.com", password: "Password123", role: "USER" as const },
];

// Sample recipes so the recipe book has content. Fields match the recipe schema.
const sampleRecipes: CreateRecipeInput[] = [
  {
    name: "Classic Margherita Pizza",
    cuisine: "Italian",
    mealType: ["Dinner"],
    difficulty: "Easy",
    cookTimeMinutes: 15,
    tags: ["Pizza", "Italian"],
    image: "https://cdn.dummyjson.com/recipe-images/1.webp",
    ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella cheese", "Fresh basil leaves", "Olive oil", "Salt and pepper to taste"],
    instructions: [
      "Preheat the oven to 475°F (245°C).",
      "Roll out the pizza dough and spread tomato sauce evenly.",
      "Top with slices of fresh mozzarella and fresh basil leaves.",
      "Drizzle with olive oil and season with salt and pepper.",
      "Bake in the preheated oven for 12-15 minutes or until the crust is golden brown.",
      "Slice and serve hot.",
    ],
  },
  {
    name: "Vegetarian Stir-Fry",
    cuisine: "Asian",
    mealType: ["Lunch"],
    difficulty: "Medium",
    cookTimeMinutes: 20,
    tags: ["Vegetarian", "Stir-fry", "Asian"],
    image: "https://cdn.dummyjson.com/recipe-images/2.webp",
    ingredients: ["Tofu, cubed", "Broccoli florets", "Carrots, sliced", "Bell peppers, sliced", "Soy sauce", "Ginger, minced", "Garlic, minced", "Sesame oil", "Cooked rice for serving"],
    instructions: [
      "In a wok, heat sesame oil over medium-high heat.",
      "Add minced ginger and garlic, sauté until fragrant.",
      "Add cubed tofu and stir-fry until golden brown.",
      "Add broccoli, carrots, and bell peppers. Cook until vegetables are tender-crisp.",
      "Pour soy sauce over the stir-fry and toss to combine.",
      "Serve over cooked rice.",
    ],
  },
  {
    name: "Chocolate Chip Cookies",
    cuisine: "American",
    mealType: ["Snack", "Dessert"],
    difficulty: "Easy",
    cookTimeMinutes: 10,
    tags: ["Cookies", "Dessert", "Baking"],
    image: "https://cdn.dummyjson.com/recipe-images/3.webp",
    ingredients: ["All-purpose flour", "Butter, softened", "Brown sugar", "White sugar", "Eggs", "Vanilla extract", "Baking soda", "Salt", "Chocolate chips"],
    instructions: [
      "Preheat the oven to 350°F (175°C).",
      "In a bowl, cream together softened butter, brown sugar, and white sugar.",
      "Beat in eggs one at a time, then stir in vanilla extract.",
      "Combine flour, baking soda, and salt. Gradually add to the wet ingredients.",
      "Fold in chocolate chips.",
      "Drop rounded tablespoons of dough onto ungreased baking sheets.",
      "Bake for 10-12 minutes or until edges are golden brown.",
      "Allow cookies to cool on the baking sheet for a few minutes before transferring to a wire rack.",
    ],
  },
  {
    name: "Chicken Alfredo Pasta",
    cuisine: "Italian",
    mealType: ["Lunch", "Dinner"],
    difficulty: "Medium",
    cookTimeMinutes: 20,
    tags: ["Pasta", "Chicken"],
    image: "https://cdn.dummyjson.com/recipe-images/4.webp",
    ingredients: ["Fettuccine pasta", "Chicken breast, sliced", "Heavy cream", "Parmesan cheese, grated", "Garlic, minced", "Butter", "Salt and pepper to taste", "Fresh parsley for garnish"],
    instructions: [
      "Cook fettuccine pasta according to package instructions.",
      "In a pan, sauté sliced chicken in butter until fully cooked.",
      "Add minced garlic and cook until fragrant.",
      "Pour in heavy cream and grated Parmesan cheese. Stir until the cheese is melted.",
      "Season with salt and pepper to taste.",
      "Combine the Alfredo sauce with cooked pasta.",
      "Garnish with fresh parsley before serving.",
    ],
  },
  {
    name: "Mango Salsa Chicken",
    cuisine: "Mexican",
    mealType: ["Dinner"],
    difficulty: "Easy",
    cookTimeMinutes: 25,
    tags: ["Chicken", "Salsa"],
    image: "https://cdn.dummyjson.com/recipe-images/5.webp",
    ingredients: ["Chicken thighs", "Mango, diced", "Red onion, finely chopped", "Cilantro, chopped", "Lime juice", "Jalapeño, minced", "Salt and pepper to taste", "Cooked rice for serving"],
    instructions: [
      "Season chicken thighs with salt and pepper.",
      "Grill or bake chicken until fully cooked.",
      "In a bowl, combine diced mango, chopped red onion, cilantro, minced jalapeño, and lime juice.",
      "Dice the cooked chicken and mix it with the mango salsa.",
      "Serve over cooked rice.",
    ],
  },
  {
    name: "Quinoa Salad with Avocado",
    cuisine: "Mediterranean",
    mealType: ["Lunch", "Side Dish"],
    difficulty: "Easy",
    cookTimeMinutes: 15,
    tags: ["Salad", "Quinoa"],
    image: "https://cdn.dummyjson.com/recipe-images/6.webp",
    ingredients: ["Quinoa, cooked", "Avocado, diced", "Cherry tomatoes, halved", "Cucumber, diced", "Red bell pepper, diced", "Feta cheese, crumbled", "Lemon vinaigrette dressing", "Salt and pepper to taste"],
    instructions: [
      "In a large bowl, combine cooked quinoa, diced avocado, halved cherry tomatoes, diced cucumber, diced red bell pepper, and crumbled feta cheese.",
      "Drizzle with lemon vinaigrette dressing and toss to combine.",
      "Season with salt and pepper to taste.",
      "Chill in the refrigerator before serving.",
    ],
  },
  {
    name: "Tomato Basil Bruschetta",
    cuisine: "Italian",
    mealType: ["Appetizer"],
    difficulty: "Easy",
    cookTimeMinutes: 10,
    tags: ["Bruschetta", "Italian"],
    image: "https://cdn.dummyjson.com/recipe-images/7.webp",
    ingredients: ["Baguette, sliced", "Tomatoes, diced", "Fresh basil, chopped", "Garlic cloves, minced", "Balsamic glaze", "Olive oil", "Salt and pepper to taste"],
    instructions: [
      "Preheat the oven to 375°F (190°C).",
      "Place baguette slices on a baking sheet and toast in the oven until golden brown.",
      "In a bowl, combine diced tomatoes, chopped fresh basil, minced garlic, and a drizzle of olive oil.",
      "Season with salt and pepper to taste.",
      "Top each toasted baguette slice with the tomato-basil mixture.",
      "Drizzle with balsamic glaze before serving.",
    ],
  },
  {
    name: "Beef and Broccoli Stir-Fry",
    cuisine: "Asian",
    mealType: ["Dinner"],
    difficulty: "Medium",
    cookTimeMinutes: 15,
    tags: ["Beef", "Stir-fry", "Asian"],
    image: "https://cdn.dummyjson.com/recipe-images/8.webp",
    ingredients: ["Beef sirloin, thinly sliced", "Broccoli florets", "Soy sauce", "Oyster sauce", "Sesame oil", "Garlic, minced", "Ginger, minced", "Cornstarch", "Cooked white rice for serving"],
    instructions: [
      "In a bowl, mix soy sauce, oyster sauce, sesame oil, and cornstarch to create the sauce.",
      "In a wok, stir-fry thinly sliced beef until browned. Remove from the wok.",
      "Stir-fry broccoli florets, minced garlic, and minced ginger in the same wok.",
      "Add the cooked beef back to the wok and pour the sauce over the mixture.",
      "Stir until everything is coated and heated through.",
      "Serve over cooked white rice.",
    ],
  },
  {
    name: "Caprese Salad",
    cuisine: "Italian",
    mealType: ["Lunch"],
    difficulty: "Easy",
    cookTimeMinutes: 0,
    tags: ["Salad", "Caprese"],
    image: "https://cdn.dummyjson.com/recipe-images/9.webp",
    ingredients: ["Tomatoes, sliced", "Fresh mozzarella cheese, sliced", "Fresh basil leaves", "Balsamic glaze", "Extra virgin olive oil", "Salt and pepper to taste"],
    instructions: [
      "Arrange alternating slices of tomatoes and fresh mozzarella on a serving platter.",
      "Tuck fresh basil leaves between the slices.",
      "Drizzle with balsamic glaze and extra virgin olive oil.",
      "Season with salt and pepper to taste.",
      "Serve immediately as a refreshing salad.",
    ],
  },
  {
    name: "Shrimp Scampi Pasta",
    cuisine: "Italian",
    mealType: ["Dinner"],
    difficulty: "Medium",
    cookTimeMinutes: 20,
    tags: ["Pasta", "Shrimp"],
    image: "https://cdn.dummyjson.com/recipe-images/10.webp",
    ingredients: ["Linguine pasta", "Shrimp, peeled and deveined", "Garlic, minced", "White wine", "Lemon juice", "Red pepper flakes", "Fresh parsley, chopped", "Salt and pepper to taste"],
    instructions: [
      "Cook linguine pasta according to package instructions.",
      "In a skillet, sauté minced garlic in olive oil until fragrant.",
      "Add shrimp and cook until pink and opaque.",
      "Pour in white wine and lemon juice. Simmer until the sauce slightly thickens.",
      "Season with red pepper flakes, salt, and pepper.",
      "Toss cooked linguine in the shrimp scampi sauce.",
      "Garnish with chopped fresh parsley before serving.",
    ],
  },
  {
    name: "Chicken Biryani",
    cuisine: "Pakistani",
    mealType: ["Lunch", "Dinner"],
    difficulty: "Medium",
    cookTimeMinutes: 45,
    tags: ["Biryani", "Chicken", "Main course", "Indian", "Pakistani", "Asian"],
    image: "https://cdn.dummyjson.com/recipe-images/11.webp",
    ingredients: ["Basmati rice", "Chicken, cut into pieces", "Onions, thinly sliced", "Tomatoes, chopped", "Yogurt", "Ginger-garlic paste", "Biryani masala", "Green chilies, sliced", "Fresh coriander leaves", "Mint leaves", "Ghee", "Salt to taste"],
    instructions: [
      "Marinate chicken with yogurt, ginger-garlic paste, biryani masala, and salt.",
      "In a pot, sauté sliced onions until golden brown. Remove half for later use.",
      "Layer marinated chicken, chopped tomatoes, half of the fried onions, and rice in the pot.",
      "Top with ghee, green chilies, fresh coriander leaves, mint leaves, and the remaining fried onions.",
      "Cover and cook on low heat until the rice is fully cooked and aromatic.",
      "Serve hot, garnished with additional coriander and mint leaves.",
    ],
  },
  {
    name: "Chicken Karahi",
    cuisine: "Pakistani",
    mealType: ["Lunch", "Dinner"],
    difficulty: "Easy",
    cookTimeMinutes: 30,
    tags: ["Chicken", "Karahi", "Main course", "Indian", "Pakistani", "Asian"],
    image: "https://cdn.dummyjson.com/recipe-images/12.webp",
    ingredients: ["Chicken, cut into pieces", "Tomatoes, chopped", "Green chilies, sliced", "Ginger, julienned", "Garlic, minced", "Coriander powder", "Cumin powder", "Red chili powder", "Garam masala", "Cooking oil", "Fresh coriander leaves", "Salt to taste"],
    instructions: [
      "In a wok (karahi), heat cooking oil and sauté minced garlic until golden brown.",
      "Add chicken pieces and cook until browned on all sides.",
      "Add chopped tomatoes, green chilies, ginger, and spices. Cook until tomatoes are soft.",
      "Cover and simmer until the chicken is tender and the oil separates from the masala.",
      "Garnish with fresh coriander leaves and serve hot with naan or rice.",
    ],
  },
];

async function seedUsers() {
  for (const account of accounts) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, account.email))
      .limit(1);

    if (existing) {
      console.log(`⏭  ${account.email} already exists`);
      continue;
    }

    await db.insert(users).values({
      name: account.name,
      email: account.email,
      password: await bcrypt.hash(account.password, 10),
      role: account.role,
      emailVerified: new Date().toISOString(),
    });

    console.log(`✅ Created ${account.role} ${account.email}`);
  }
}

async function seedRecipes() {
  // Resolve owners after the accounts exist.
  const ownerIds: string[] = [];
  for (const account of accounts) {
    const [owner] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, account.email))
      .limit(1);

    if (owner) ownerIds.push(owner.id);
  }

  // Only add recipes that are not already present, matching by name.
  const existingRows = await db.select({ name: recipes.name }).from(recipes);
  const existingNames = new Set(existingRows.map((row) => row.name));

  const missing = sampleRecipes.filter((recipe) => !existingNames.has(recipe.name));
  if (missing.length === 0) {
    console.log("⏭  Recipes already exist");
    return;
  }

  const values = missing.map((recipe, index) => ({
    ...recipe,
    userId: ownerIds[index % ownerIds.length],
  }));

  await db.insert(recipes).values(values);
  console.log(`✅ Created ${values.length} recipes`);
}

async function seed() {
  await seedUsers();
  await seedRecipes();

  console.log("🌱 Seed complete");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
