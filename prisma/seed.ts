import { PrismaClient, Size } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create sample dresses
  const dresses = [
    {
      name: 'Elegant Evening Gown',
      description: 'A stunning evening gown perfect for formal occasions.',
      price: 89.99,
      size: Size.M,
      available: true,
      featured: true,
      frontImage: '/images/dresses/dress1-front.jpg',
      backImage: '/images/dresses/dress1-back.jpg',
    },
    {
      name: 'Cocktail Dress',
      description: 'A chic cocktail dress ideal for semi-formal events.',
      price: 69.99,
      size: Size.L,
      available: true,
      featured: true,
      frontImage: '/images/dresses/dress2-front.jpg',
      backImage: '/images/dresses/dress2-back.jpg',
    },
    {
      name: 'Summer Maxi Dress',
      description: 'A flowing maxi dress perfect for summer occasions.',
      price: 59.99,
      size: Size.XL,
      available: true,
      featured: true,
      frontImage: '/images/dresses/dress3-front.jpg',
      backImage: '/images/dresses/dress3-back.jpg',
    },
    {
      name: 'Business Attire',
      description: 'Professional business attire for corporate settings.',
      price: 79.99,
      size: Size.M,
      available: true,
      featured: false,
      frontImage: '/images/dresses/dress4-front.jpg',
      backImage: '/images/dresses/dress4-back.jpg',
    },
    {
      name: 'Wedding Guest Dress',
      description: 'An elegant dress perfect for attending weddings.',
      price: 99.99,
      size: Size.S,
      available: true,
      featured: false,
      frontImage: '/images/dresses/dress5-front.jpg',
      backImage: '/images/dresses/dress5-back.jpg',
    },
    {
      name: 'Party Dress',
      description: 'A fun and flirty dress for parties and celebrations.',
      price: 74.99,
      size: Size.L,
      available: true,
      featured: false,
      frontImage: '/images/dresses/dress6-front.jpg',
      backImage: '/images/dresses/dress6-back.jpg',
    },
    {
      name: 'Casual Day Dress',
      description: 'A comfortable dress for casual day events.',
      price: 49.99,
      size: Size.XS,
      available: true,
      featured: false,
      frontImage: '/images/dresses/dress7-front.jpg',
      backImage: '/images/dresses/dress7-back.jpg',
    },
    {
      name: 'Vintage-Inspired Dress',
      description: 'A dress with vintage charm and modern comfort.',
      price: 84.99,
      size: Size.XXL,
      available: false,
      featured: false,
      frontImage: '/images/dresses/dress8-front.jpg',
      backImage: '/images/dresses/dress8-back.jpg',
    },
  ];

  console.log('🌱 Seeding dresses...');
  
  for (const dress of dresses) {
    await prisma.dress.upsert({
      where: { name: dress.name },
      update: {},
      create: dress,
    });
  }

 console.log('🌱 Seeding dresses...');
  
  for (const dress of dresses) {
    await prisma.dress.upsert({
      where: { name: dress.name },
      update: {},
      create: dress,
    });
  }

  console.log('🌱 Seeding dresses...');
  
  for (const dress of dresses) {
    await prisma.dress.upsert({
      where: { name: dress.name },
      update: {},
      create: dress,
    });
  }

  console.log(`✅ Seeded ${dresses.length} dresses`);

  // Create a demo user with wishlist
  console.log('🌱 Creating demo user...');
  
  // Hash a demo password
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      password: hashedPassword,
      admin: false,
      wishlist: {
        create: {
          name: 'Demo Wishlist',
          items: {
            create: [
              {
                dress: {
                  connect: { name: 'Elegant Evening Gown' }
                }
              },
              {
                dress: {
                  connect: { name: 'Summer Maxi Dress' }
                }
              },
              {
                dress: {
                  connect: { name: 'Cocktail Dress' }
                }
              }
            ]
          }
        }
      }
    },
    include: {
      wishlist: {
        include: {
          items: {
            include: {
              dress: true
            }
          }
        }
      }
    }
  });

  console.log(`✅ Created demo user: ${demoUser.email}`);
  console.log(`✅ Created wishlist with ${demoUser.wishlist?.items.length || 0} items`);
  console.log(`🎉 Seeding completed!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });