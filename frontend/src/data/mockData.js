export const PRODUCTS = [
  {
    id: "prod-1",
    name: "ApexPro 16 5G Smartphone",
    brand: "ApexTech",
    rating: 4.8,
    reviewCount: 142,
    categories: ["mobiles"],
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
    description: "Flagship 5G smartphone featuring a 6.7-inch Super Retina OLED display, titanium chassis, and advanced triple-camera system.",
    variants: [
      {
        id: "v-1-1",
        name: "Space Black / 256GB",
        price: 999.00,
        colorHex: "#1c1c1e",
        sku: "WH-APX-16-BLK-256",
        stock: 24,
      },
      {
        id: "v-1-2",
        name: "Silver Frost / 512GB",
        price: 1149.00,
        colorHex: "#e3e4e5",
        sku: "WH-APX-16-SLV-512",
        stock: 12,
      },
      {
        id: "v-1-3",
        name: "Deep Marine / 1TB",
        price: 1399.00,
        colorHex: "#1f2a38",
        sku: "WH-APX-16-BLU-1TB",
        stock: 0, // Restocking (+3 days buffer)
      },
    ],
  },
  {
    id: "prod-2",
    name: "AuraWave ANC Wireless Headphones",
    brand: "SoundSculpt",
    rating: 4.7,
    reviewCount: 98,
    categories: ["audio"],
    badge: "Editor's Choice",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    description: "Premium over-ear wireless headphones with active noise cancellation, 40-hour battery life, and spatial audio support.",
    variants: [
      {
        id: "v-2-1",
        name: "Midnight Carbon",
        price: 349.00,
        colorHex: "#2b2b2b",
        sku: "WH-SND-AWANC-MBLK",
        stock: 45,
      },
      {
        id: "v-2-2",
        name: "Sandstone Beige",
        price: 349.00,
        colorHex: "#d8cbb5",
        sku: "WH-SND-AWANC-[#dad7cd]",
        stock: 18,
      },
    ],
  },
  {
    id: "prod-3",
    name: "RoboMaster AI Programmable Rover Toy",
    brand: "OmniRobotics",
    rating: 4.9,
    reviewCount: 64,
    categories: ["toys"],
    badge: "STEM Choice",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    description: "Educational robotics kit for kids and students. Programmable in Python and Scratch with HD camera AI recognition.",
    variants: [
      {
        id: "v-3-1",
        name: "Standard STEM Edition",
        price: 219.00,
        colorHex: "#3a5a40",
        sku: "WH-TOY-RBO-STDRD",
        stock: 15,
      },
      {
        id: "v-3-2",
        name: "Pro Competition Kit",
        price: 329.00,
        colorHex: "#588157",
        sku: "WH-TOY-RBO-PRO-KIT",
        stock: 0, // Restocking (+3 days buffer)
      },
    ],
  },
  {
    id: "prod-4",
    name: "QuantumWatch Ultra GPS Smartwatch",
    brand: "Chronos",
    rating: 4.6,
    reviewCount: 112,
    categories: ["wearables"],
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    description: "Rugged outdoor GPS smartwatch with titanium case, dual-frequency location tracking, and 100m water resistance.",
    variants: [
      {
        id: "v-4-1",
        name: "Titanium / Orange Alpine Loop (49mm)",
        price: 799.00,
        colorHex: "#d97706",
        sku: "WH-WCH-QTM-49-ORG",
        stock: 30,
      },
      {
        id: "v-4-2",
        name: "Titanium / Black Ocean Band (49mm)",
        price: 799.00,
        colorHex: "#111827",
        sku: "WH-WCH-QTM-49-BLK",
        stock: 14,
      },
    ],
  },
  {
    id: "prod-5",
    name: "HoverGlide 4K Falcon Drone",
    brand: "AeroDynamics",
    rating: 4.7,
    reviewCount: 76,
    categories: ["gaming"],
    badge: "New Arrival",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    description: "Compact folding drone with 4K HDR video, 3-axis gimbal, 31-minute flight time, and tri-directional obstacle sensing.",
    variants: [
      {
        id: "v-5-1",
        name: "Standard Remote Combo",
        price: 499.00,
        colorHex: "#4b5563",
        sku: "WH-DRN-FLC-BASE",
        stock: 8,
      },
      {
        id: "v-5-2",
        name: "Fly More Kit (3 Batteries + Bag)",
        price: 679.00,
        colorHex: "#1f2937",
        sku: "WH-DRN-FLC-COMB",
        stock: 3,
      },
    ],
  },
  {
    id: "prod-6",
    name: "CyberPulse RGB Mechanical Keyboard",
    brand: "VortexGaming",
    rating: 4.8,
    reviewCount: 210,
    categories: ["gaming", "audio"],
    badge: "Gamer Top Pick",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    description: "Hot-swappable wireless mechanical gaming keyboard with PBT keycaps and per-key RGB backlighting.",
    variants: [
      {
        id: "v-6-1",
        name: "Tactile Brown Switches",
        price: 149.00,
        colorHex: "#78350f",
        sku: "WH-KB-CYB-BRN",
        stock: 50,
      },
      {
        id: "v-6-2",
        name: "Linear Red Switches",
        price: 149.00,
        colorHex: "#dc2626",
        sku: "WH-KB-CYB-RED",
        stock: 22,
      },
    ],
  },
  {
    id: "prod-7",
    name: "LuminaTab 12.9 Pro OLED Tablet",
    brand: "ApexTech",
    rating: 4.9,
    reviewCount: 53,
    categories: ["mobiles"],
    badge: "Pro Choice",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    description: "12.9-inch Ultra Retina Tandem OLED display powered by next-gen AI chip for creator workflows.",
    variants: [
      {
        id: "v-7-1",
        name: "Space Silver / 128GB Wi-Fi",
        price: 849.00,
        colorHex: "#cbd5e1",
        sku: "WH-TAB-LUM-SLV-128",
        stock: 19,
      },
      {
        id: "v-7-2",
        name: "Space Gray / 512GB 5G Cellular",
        price: 1199.00,
        colorHex: "#334155",
        sku: "WH-TAB-LUM-GRY-512",
        stock: 7,
      },
    ],
  },
];

export const CATEGORIES = [
  { id: "all", name: "All Products", count: PRODUCTS.length, image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80" },
  { id: "mobiles", name: "Mobiles & Tablets", count: 2, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80" },
  { id: "audio", name: "Audio Devices", count: 2, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80" },
  { id: "toys", name: "Smart Toys & STEM", count: 1, image: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&w=400&q=80" },
  { id: "wearables", name: "Wearables & Watches", count: 1, image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80" },
  { id: "gaming", name: "Drones & Gaming", count: 2, image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80" },
];

export const TEXAS_CITIES = [
  { name: "Austin", isMain: true },
  { name: "Dallas", isMain: true },
  { name: "Houston", isMain: true },
  { name: "San Antonio", isMain: true },
  { name: "Fort Worth", isMain: true },
  { name: "El Paso", isMain: false },
  { name: "Arlington", isMain: false },
  { name: "Corpus Christi", isMain: false },
  { name: "Plano", isMain: false },
  { name: "Lubbock", isMain: false },
  { name: "Laredo", isMain: false },
  { name: "Irving", isMain: false },
  { name: "Amarillo", isMain: false },
];

// Single Centralized Store Pickup Location (BrightBuy Central Texas Hub in Austin)
export const STORE_PICKUP_LOCATIONS = [
  {
    id: "central-hub",
    name: "BrightBuy Central Texas Hub",
    city: "Austin",
    address: "4500 Tech Ridge Blvd, Suite 100, Austin, TX 78753",
    hours: "Mon-Sat: 8:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM",
    phone: "(512) 555-0100",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
  },
];

/**
 * Calculates dynamic delivery estimate based on stock availability and Texas city tier
 */
export function calculateDeliveryEstimate(cityName = "Austin", isInStock = true) {
  const city = TEXAS_CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
  const isMainCity = city ? city.isMain : false;
  
  const baseDays = isMainCity ? 5 : 7;
  const stockDelayAdded = !isInStock;
  const totalDays = baseDays + (stockDelayAdded ? 3 : 0);

  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + totalDays);

  const formattedDate = deliveryDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return {
    isMain: isMainCity,
    baseDays,
    stockDelayAdded,
    days: totalDays,
    estimatedDate: formattedDate,
  };
}
