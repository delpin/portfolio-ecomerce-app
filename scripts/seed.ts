import { db } from '../src/lib/db';
import { products } from '../src/lib/db/schema';

const nikeProducts = [
  {
    name: 'Nike Air Max 270',
    description: 'The Nike Air Max 270 delivers visible cushioning under every step.',
    price: '150.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/air-max-270-mens-shoes-KkLcGR.png',
    category: 'Shoes',
    brand: 'Nike',
    stock: 50,
  },
  {
    name: 'Nike Air Force 1',
    description: 'The radiance lives on in the Nike Air Force 1, the basketball original.',
    price: '110.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-mens-shoes-jBrhbr.png',
    category: 'Shoes',
    brand: 'Nike',
    stock: 75,
  },
  {
    name: 'Nike Dri-FIT T-Shirt',
    description: 'Nike Dri-FIT technology moves sweat away from your skin.',
    price: '25.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/16a4b0a9-3c7e-4de6-9b4e-4d7b7b7b7b7b/dri-fit-mens-fitness-t-shirt-HPdvKq.png',
    category: 'Apparel',
    brand: 'Nike',
    stock: 100,
  },
  {
    name: 'Nike React Infinity Run',
    description: 'Nike React Infinity Run Flyknit is designed to help reduce injury.',
    price: '160.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/8439f823-86cf-4086-81d2-4f9ff9a66866/react-infinity-run-flyknit-mens-running-shoe-zX42Nc.png',
    category: 'Shoes',
    brand: 'Nike',
    stock: 30,
  },
  {
    name: 'Nike Sportswear Hoodie',
    description: 'The Nike Sportswear Club Fleece Hoodie is made with soft fleece.',
    price: '55.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/3396ee3c-08cc-4ada-baa9-655f12e32c71/sportswear-club-fleece-mens-hoodie-LcSw5q.png',
    category: 'Apparel',
    brand: 'Nike',
    stock: 60,
  },
  {
    name: 'Nike Air Jordan 1',
    description: 'The Air Jordan 1 Retro High OG stays true to its roots.',
    price: '170.00',
    imageUrl: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/85f9c5e8-6d8e-4b5e-9c1e-4b5e9c1e4b5e/air-jordan-1-retro-high-og-mens-shoes-Lg5sZg.png',
    category: 'Shoes',
    brand: 'Nike',
    stock: 25,
  },
];

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Insert Nike products
    await db.insert(products).values(nikeProducts);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();