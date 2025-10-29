window.CC_DATA = window.CC_DATA || {};

CC_DATA.products = [
  { slug: "lait", name: "Lait (1 L)" },
  { slug: "restaurant", name: "Repas au restaurant" },
  { slug: "hotel", name: "Nuit d’hôtel (3★)" }
];

CC_DATA.countries = [
  {
    slug: "france",
    name: "France",
    categories: {
      lait: 1.15,
      restaurant: 15.00,
      hotel: 95.00
    }
  },
  {
    slug: "japon",
    name: "Japon",
    categories: {
      lait: 1.30,
      restaurant: 8.50,
      hotel: 80.00
    }
  },
  {
    slug: "espagne",
    name: "Espagne",
    categories: {
      lait: 0.95,
      restaurant: 12.00,
      hotel: 70.00
    }
  }
];