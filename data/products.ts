export type Product = {
  id: number;
  name: string;
  category: "Coats" | "Pants" | "Suits" | "Sherwani";
  price: number;
  description: string;
  sizes: string[];
  image: string;
  featured: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Black Coat",
    category: "Coats",
    price: 7999,
    description:
      "A timeless black coat designed for a sharp and confident look.",
    sizes: ["38", "40", "42", "44", "46"],
    image: "/products/black-coat.jpg",
    featured: true,
  },

  {
    id: 2,
    name: "Midnight Blue Coat",
    category: "Coats",
    price: 8499,
    description:
      "A refined midnight blue coat suitable for formal and special occasions.",
    sizes: ["38", "40", "42", "44", "46"],
    image: "/products/blue-coat.jpg",
    featured: true,
  },

  {
    id: 3,
    name: "Charcoal Grey Coat",
    category: "Coats",
    price: 8299,
    description:
      "A versatile charcoal grey coat with a clean modern silhouette.",
    sizes: ["38", "40", "42", "44", "46"],
    image: "/products/grey-coat.jpg",
    featured: false,
  },

  {
    id: 4,
    name: "Classic Formal Pants",
    category: "Pants",
    price: 2999,
    description:
      "Clean-cut formal pants designed for everyday professional dressing.",
    sizes: ["30", "32", "34", "36", "38", "40"],
    image: "/products/formal-pants.jpg",
    featured: true,
  },

  {
    id: 5,
    name: "Slim Fit Trousers",
    category: "Pants",
    price: 3299,
    description:
      "Modern slim-fit trousers designed to complement coats and suits.",
    sizes: ["30", "32", "34", "36", "38", "40"],
    image: "/products/slim-pants.jpg",
    featured: false,
  },

  {
    id: 6,
    name: "Light Grey Formal Pants",
    category: "Pants",
    price: 2999,
    description:
      "A versatile light grey trouser option for a clean formal appearance.",
    sizes: ["30", "32", "34", "36", "38", "40"],
    image: "/products/light-grey-pants.jpg",
    featured: false,
  },

  {
    id: 7,
    name: "Premium Navy Suit",
    category: "Suits",
    price: 11999,
    description:
      "A premium navy suit designed for weddings, events and formal occasions.",
    sizes: ["38", "40", "42", "44", "46"],
    image: "/products/navy-suit.jpg",
    featured: true,
  },

    {
    id: 8,
    name: "Classic Black Suit",
    category: "Suits",
    price: 12999,
    description:
      "A classic black suit offering a sophisticated and timeless appearance.",
    sizes: ["38", "40", "42", "44", "46"],
    image: "/products/black-suit.jpg",
    featured: false,
  },

  {
    id: 9,
    name: "White Sherwani",
    category: "Sherwani",
    price: 3500,
    description:
      "Elegant white sherwani designed for weddings, festive occasions and traditional celebrations. Available in multiple sizes and two designs.",
    sizes: ["36", "38", "40", "42", "44"],
    image: "/products/White_Sherwani.jpg",
    featured: true,
  },
];