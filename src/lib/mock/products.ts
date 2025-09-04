export type ProductItem = {
  id: number;
  title: string;
  gender: "men" | "women" | "unisex";
  sizes: string[];
  colors: string[];
  price: number;
  imageSrc: string;
  badge?: { text: string; tone?: "orange" | "green" | "red" };
  createdAt?: number;
};

export const products: ProductItem[] = [
  {
    id: 1,
    title: "Nike Air Force 1 Mid '07",
    gender: "men",
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["white"],
    price: 98.3,
    imageSrc: "/shoes/shoe-1.jpg",
    badge: { text: "Best Seller", tone: "orange" },
    createdAt: 1730000000,
  },
  {
    id: 2,
    title: "Nike Court Vision Low",
    gender: "men",
    sizes: ["8", "9", "10", "11"],
    colors: ["black", "blue"],
    price: 89.99,
    imageSrc: "/shoes/shoe-2.webp",
    badge: { text: "Extra 20% off", tone: "green" },
    createdAt: 1731000000,
  },
  {
    id: 3,
    title: "Nike Air Max SYSTM",
    gender: "men",
    sizes: ["7", "8", "9", "10"],
    colors: ["red", "white"],
    price: 98.3,
    imageSrc: "/shoes/shoe-3.webp",
    badge: { text: "New", tone: "orange" },
    createdAt: 1732000000,
  },
  {
    id: 4,
    title: "Nike Legend Essential 3",
    gender: "unisex",
    sizes: ["S", "M", "L"],
    colors: ["black"],
    price: 79.5,
    imageSrc: "/shoes/shoe-4.webp",
    badge: { text: "Sustainable Materials", tone: "green" },
    createdAt: 1733000000,
  },
  {
    id: 5,
    title: "Nike Dunk Low Retro",
    gender: "men",
    sizes: ["9", "10", "11"],
    colors: ["green", "yellow"],
    price: 120,
    imageSrc: "/shoes/shoe-7.avif",
    createdAt: 1734000000,
  },
  {
    id: 6,
    title: "Nike Blazer Low '77 Jumbo",
    gender: "women",
    sizes: ["7", "8", "9"],
    colors: ["white", "blue"],
    price: 98.3,
    imageSrc: "/shoes/shoe-8.avif",
    badge: { text: "Extra 20% off", tone: "green" },
    createdAt: 1735000000,
  },
  {
    id: 7,
    title: "Nike Air Max 90 SE",
    gender: "men",
    sizes: ["8", "9", "10"],
    colors: ["orange", "white"],
    price: 98.3,
    imageSrc: "/shoes/shoe-10.avif",
    createdAt: 1736000000,
  },
  {
    id: 8,
    title: "Jordan Series ES",
    gender: "unisex",
    sizes: ["S", "M", "L", "XL"],
    colors: ["green"],
    price: 110,
    imageSrc: "/shoes/shoe-11.avif",
    badge: { text: "Sustainable Materials", tone: "green" },
    createdAt: 1737000000,
  },
];
