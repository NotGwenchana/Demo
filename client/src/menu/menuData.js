// menuData.js
import * as FoodImage from "../assets/FoodImage";

export const menuData = {
  chulPan: [
    { id: "sweet-chicken", name: "Sweet Chicken", price: 64, spicy: false, image: FoodImage.food01, category: "Chul Pan" },
    { id: "spicy-chicken", name: "Spicy Chicken", price: 64, spicy: true, image: FoodImage.food02, category: "Chul Pan" },
    { id: "original-beef", name: "Original Beef", price: 64, spicy: false, image: FoodImage.food03, category: "Chul Pan" },
    { id: "woo-sam-beef-belly", name: "Woo Sam Beef Belly", price: 64, spicy: false, image: FoodImage.food04, category: "Chul Pan" },
    { id: "go-choo-pork-belly", name: "Go Choo Pork Belly", price: 64, spicy: true, image: FoodImage.food05, category: "Chul Pan" },
    { id: "spicy-pork", name: "Spicy Pork", price: 64, spicy: true, image: FoodImage.food06, category: "Chul Pan" },
    { id: "kimchi-pork-tofu", name: "Kimchi Pork & Tofu", price: 64, spicy: true, image: FoodImage.food07, category: "Chul Pan" },
    { id: "la-gal-bi", name: "LA Gal Bi", price: 96, spicy: false, image: FoodImage.food08, category: "Chul Pan" },
    { id: "pork-rib-stew", name: "Pork Rib Stew", price: 98, spicy: false, image: FoodImage.food09, category: "Chul Pan" }
  ],
  
  biBimBap: [
    { id: "beef-bibimbap", name: "Beef", price: 54, spicy: false, image: FoodImage.food10a, category: "Bi Bim Bap" },
    { id: "chicken-bibimbap", name: "Chicken", price: 54, spicy: false, image: FoodImage.food10b, category: "Bi Bim Bap" },
    { id: "pork-bibimbap", name: "Pork", price: 54, spicy: true, image: FoodImage.food10c, category: "Bi Bim Bap" },
    { id: "squid-bibimbap", name: "Squid", price: 54, spicy: true, image: FoodImage.food10d, category: "Bi Bim Bap" }
  ],
  
  soups: [
    { id: "soft-tofu-soup", name: "Soft Tofu Soup", price: 54, spicy: true, image: FoodImage.food11, category: "Soups" },
    { id: "kimchi-soup", name: "Kimchi Soup", price: 54, spicy: true, image: FoodImage.food12, category: "Soups" },
    { id: "soy-bean-soup", name: "Soy Bean Soup", price: 54, spicy: false, image: FoodImage.food13, category: "Soups" }
  ],
  
  noodles: [
    { id: "soy-bean-paste-noodle", name: "Hungry Ramyun Soy Bean Paste Noodle", price: 54, spicy: false, image: FoodImage.food14a, category: "Noodles" },
    { id: "spicy-noodle-soup", name: "Hungry Ramyun Spicy Noodle", price: 54, spicy: true, image: FoodImage.food14b, category: "Noodles" },
    { id: "cold-noodle-soup", name: "Neng Myun Cold", price: 64, spicy: false, image: FoodImage.food15a, category: "Noodles" },
    { id: "spicy-cold-noodle", name: "Neng Myun Spicy", price: 64, spicy: true, image: FoodImage.food15b, category: "Noodles" },
    { id: "jja-jang-myun", name: "Jja Jang Myun", price: 64, spicy: false, image: FoodImage.food16, category: "Noodles" },
    { id: "jap-chae", name: "Jap Chae", price: 44, spicy: false, image: FoodImage.food17, category: "Noodles" },
    { id: "ra-bok-gi", name: "Ra Bok Gi", price: 64, spicy: true, image: FoodImage.food20, category: "Noodles" }
  ],
  
  gimBap: {
    basePrice: 44,
    image: FoodImage.food18,
    category: "Gim Bap",
    variations: [
      { id: "gimbap-beef", name: "Beef", spicy: false, price: 44 },
      { id: "gimbap-chicken", name: "Chicken", spicy: false, price: 44 },
      { id: "gimbap-pork", name: "Pork", spicy: true, price: 44 },
      { id: "gimbap-squid", name: "Squid", spicy: true, price: 44 },
      { id: "gimbap-tuna", name: "Tuna", spicy: false, price: 44 },
      { id: "gimbap-cheese", name: "Cheese", spicy: false, price: 44 },
      { id: "gimbap-kimchi", name: "Kimchi", spicy: true, price: 44 },
      { id: "gimbap-prawn", name: "Prawn", spicy: false, price: 44 }
    ]
  },
  
  ddukBokGi: [
    { id: "original-ddukbokgi", name: "Original", price: 44, spicy: true, image: FoodImage.food19a, category: "Dduk Bok Gi" },
    { id: "bolgenese-ddukbokgi", name: "Bolgenese", price: 50, spicy: false, image: FoodImage.food19b, category: "Dduk Bok Gi" },
    { id: "beef-ddukbokgi", name: "Beef", price: 50, spicy: false, image: FoodImage.food19c, category: "Dduk Bok Gi" },
    { id: "chicken-ddukbokgi", name: "Chicken", price: 50, spicy: true, image: FoodImage.food19d, category: "Dduk Bok Gi" },
  ],
  
  chickenWings: [
    { id: "original-wings", name: "Original", price: 48, spicy: false, image: FoodImage.food21a, category: "Chicken Wings" },
    { id: "sweet-spicy-wings", name: "Sweet & Spicy", price: 48, spicy: true, image: FoodImage.food21b, category: "Chicken Wings" },
    { id: "honey-garlic-wings", name: "Honey Garlic", price: 48, spicy: false, image: FoodImage.food21c, category: "Chicken Wings" }
  ],
  
  snacks: [
    { id: "mini-soon-sal", name: "Mini Soon Sal Chicken", price: 54, spicy: false, image: FoodImage.food22, category: "Snacks" },
    { id: "beef-burger", name: "Beef Burger", price: 48, spicy: false, image: FoodImage.food23, category: "Snacks" },
    { id: "dumplings", name: "Dumplings", price: 38, spicy: false, image: FoodImage.food24, category: "Snacks" },
    { id: "extra-rice", name: "Extra Rice", price: 7, spicy: false, image: FoodImage.extraRice, category: "Snacks" },
    { id: "ban-chan", name: "Ban chan", price: 18, spicy: false, image: FoodImage.banchan, category: "Snacks" },
    { id: "laver-roll", name: "Laver Roll", price: 26, spicy: false, image: FoodImage.laverRoll, category: "Snacks" },
    
    { 
      id: "kimchi-side", 
      name: "Kimchi", 
      price: 0, 
      spicy: true, 
      image: FoodImage.kimchi, 
      category: "Snacks",
      hasSize: true,
      sizes: { small: 7, medium: 32, large: 64 }
    },
    { 
      id: "potato-side", 
      name: "Potato", 
      price: 0, 
      spicy: false, 
      image: FoodImage.potato, 
      category: "Snacks",
      hasSize: true,
      sizes: { small: 7, medium: 37, large: 74 }
    },
    { id: "fishcake", name: "Fishcake", price: 7, spicy: false, image: FoodImage.fishcake, category: "Snacks" }
  ],
  
  drinks: [
    { id: "barley-tea", name: "Ice Sweet Barley Malt Tea", price: 12, category: "Drinks" },
    { id: "plum-juice", name: "Ice Plum Juice", price: 12, category: "Drinks" },
    { id: "green-milk-tea", name: "Ice Green Milk Tea", price: 12, category: "Drinks" },
    { id: "lemon-tea", name: "Ice Lemon Tea", price: 12, category: "Drinks" },
    { id: "milk-tea", name: "Ice Milk Tea", price: 12, category: "Drinks" },
    { id: "solomon-seal-tea", name: "Hot Solomon Seal Tea", price: 12, category: "Drinks" },
    { id: "ginseng-tea", name: "Hot Ginseng Tea", price: 12, category: "Drinks" },
    { id: "milkis", name: "Milkis", price: 12, category: "Drinks" },
    { id: "lotto-mango", name: "Lotto Mango", price: 12, category: "Drinks" },
    { id: "del-monte-apple", name: "Del Monte Apple", price: 12, category: "Drinks" },
    { id: "coke", name: "Coke", price: 12, category: "Drinks" },
    { id: "diet-coke", name: "Diet Coke", price: 12, category: "Drinks" },
    { id: "grapefruit", name: "Grapefruit", price: 12, category: "Drinks" },
    { id: "water", name: "Water", price: 12, category: "Drinks" },
    { id: "orange-juice", name: "Orange Juice", price: 14, category: "Drinks" },
    { id: "ice-chocolate", name: "Ice Chocolate", price: 15, category: "Drinks" },
    { id: "hot-chocolate", name: "Hot Chocolate", price: 15, category: "Drinks" },
    { id: "lychee-citron-tea", name: "Ice Lychee Citron Tea", price: 18, category: "Drinks" },
    { id: "ginger-citron-tea", name: "Hot Ginger Citron Tea", price: 18, category: "Drinks" },
    { id: "korean-beer", name: "Korean Beer", price: 22, category: "Drinks" }
  ],
  
  partyPack: {
    id: "party-pack",
    name: "Party Pack",
    price: 270,
    category: "Party Pack",
    image: FoodImage.partyPack,
    includes: {
      chulPan: { maxSelect: 2, options: ["sweet-chicken", "spicy-chicken", "original-beef", "woo-sam-beef-belly", "go-choo-pork-belly", "spicy-pork", "kimchi-pork-tofu", "la-gal-bi", "pork-rib-stew"] },
      chickenWing: { maxSelect: 1, options: ["original-wings", "sweet-spicy-wings", "honey-garlic-wings"] },
      fixedItems: ["Dduk Bok Gi", "Jap Chae", "Dumplings", "Rice"]
    }
  },
  
  chefSpecial: [
    { id: "samgetang-kalgukSu", name: "SamGeTang KalGukSu", price: 96, spicy: false, image: FoodImage.foods1, category: "Chef Special" },
    { id: "bu-de-jji-ge", name: "Bu De Jji Ge", price: 84, spicy: true, image: FoodImage.foods2, category: "Chef Special" },
    { id: "bul-go-gi-jeon-gol", name: "Bul Go Gi Jeon Gol", price: 84, spicy: false, image: FoodImage.foods3, category: "Chef Special" },
    { id: "he-mul-pa-jeon", name: "He Mul Pa Jeon", price: 74, spicy: false, image: FoodImage.foods4, category: "Chef Special" },
    { id: "kimchi-jeon", name: "Kimchi Jeon", price: 74, spicy: false, image: FoodImage.foods5, category: "Chef Special" }
  ]
};

// Helper function to get all items (useful for search)
export const getAllItems = () => {
  const allItems = [];
  
  // Chul Pan - already has category property
  menuData.chulPan.forEach(item => allItems.push(item));
  
  // Bi Bim Bap - already has category property  
  menuData.biBimBap.forEach(item => allItems.push(item));
  
  // Soups - already has category property
  menuData.soups.forEach(item => allItems.push(item));
  
  // Noodles - already has category property
  menuData.noodles.forEach(item => allItems.push(item));
  
  // Gim Bap - special structure
  menuData.gimBap.variations.forEach(variation => {
    allItems.push({
      ...variation,
      category: menuData.gimBap.category,
      image: menuData.gimBap.image
    });
  });
  
  // Dduk Bok Gi - already has category property (including laver roll)
  menuData.ddukBokGi.forEach(item => allItems.push(item));
  
  // Chicken Wings - already has category property
  menuData.chickenWings.forEach(item => allItems.push(item));
  
  // Snacks - already has category property
  menuData.snacks.forEach(item => allItems.push(item));
  
  // Drinks - already has category property
  menuData.drinks.forEach(item => allItems.push(item));
  
  // Party Pack - special single item
  allItems.push({
    ...menuData.partyPack,
    category: "Party Pack"
  });
  
  // Chef Special - already has category property
  menuData.chefSpecial.forEach(item => allItems.push(item));
  
  return allItems;
};

// Helper function to get item by ID
export const getItemById = (id) => {
  const allItems = getAllItems();
  return allItems.find(item => item.id === id);
};

// Helper function to get items by category
export const getItemsByCategory = (category) => {
  switch(category) {
    case 'Chul Pan': return menuData.chulPan;
    case 'Bi Bim Bap': return menuData.biBimBap;
    case 'Soups': return menuData.soups;
    case 'Noodles': return menuData.noodles;
    case 'Dduk Bok Gi': return menuData.ddukBokGi;
    case 'Chicken Wings': return menuData.chickenWings;
    case 'Snacks': return menuData.snacks;
    case 'Drinks': return menuData.drinks;
    case 'Chef Special': return menuData.chefSpecial;
    default: return [];
  }
};