import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        birthday: new Date('1990-01-15'),
        lastLoginAt: new Date(),
        createdAt: new Date('2024-03-10')
      }
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        phoneNumber: '+1987654321',
        birthday: new Date('1992-03-22'),
        lastLoginAt: new Date(),
        createdAt: new Date('2024-03-12')
      }
    }),
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        phoneNumber: '+1122334455',
        birthday: new Date('1988-07-30'),
        lastLoginAt: new Date(),
        createdAt: new Date('2024-03-13')
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Wilson',
        phoneNumber: '+1555666777',
        birthday: new Date('1995-11-05'),
        lastLoginAt: new Date(),
        createdAt: new Date('2024-03-14')
      }
    }),
    prisma.user.create({
      data: {
        name: 'Carol Brown',
        phoneNumber: '+1999888777',
        birthday: new Date('1991-09-18'),
        lastLoginAt: new Date(),
        createdAt: new Date('2024-03-15')
      }
    }),
    prisma.user.create({
      data:{
        name: 'Вильгемина Великая',
        phoneNumber: '+79123456789',
        birthday: new Date('2023-08-26'),
        lastLoginAt: new Date(),
        createdAt: new Date('2025-02-10')
      }
    }),
    prisma.user.create({
      data:{
        name: 'Мася Краснозаяц',
        phoneNumber: '+79987654321',
        birthday: new Date('2024-12-15'),
        lastLoginAt: new Date(),
        createdAt: new Date('2025-02-10')
      }
    })
  ]);

  // Create test products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Шоколадный бархат',
        description: 'Нежный шоколадный маффин с бархатистой текстурой',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Какао, Сливочное масло, Шоколадные капли',
        pictureURL: 'author_muffins/chok.png',
        price: 299,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Апельсин и трюфель',
        description: 'Изысканный маффин с апельсиновым ароматом и трюфельной начинкой',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Апельсиновая цедра, Сливочное масло, Трюфельная паста',
        pictureURL: 'author_muffins/orange.png',
        price: 349,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Медовая лаванда',
        description: 'Нежный маффин с медом и ароматом лаванды',
        ingredients: 'Мука, Мёд, Яйца, Молоко, Лавандовый экстракт, Сливочное масло',
        pictureURL: 'author_muffins/lavanda.png',
        price: 329,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Карамельное яблоко',
        description: 'Маффин с кусочками яблок и карамельным соусом',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Яблоки, Карамельный соус, Сливочное масло, Корица',
        pictureURL: 'author_muffins/apple.png',
        price: 319,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Пина колада',
        description: 'Тропический маффин с кокосом и ананасом',
        ingredients: 'Мука, Сахар, Яйца, Кокосовое молоко, Ананас, Кокосовая стружка, Сливочное масло',
        pictureURL: 'author_muffins/pina.png',
        price: 339,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Сливочная ваниль',
        description: 'Классический ванильный маффин со сливочным вкусом',
        ingredients: 'Мука, Сахар, Яйца, Сливки, Ванильный экстракт, Сливочное масло',
        pictureURL: 'author_muffins/vanil.png',
        price: 289,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Мятный шоколад',
        description: 'Шоколадный маффин с освежающей мятой',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Какао, Мятный экстракт, Шоколадные капли, Сливочное масло',
        pictureURL: 'author_muffins/myata.png',
        price: 329,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Клубничный тарт',
        description: 'Маффин с клубничным джемом и песочной крошкой',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Клубничный джем, Сливочное масло, Ванильный экстракт',
        pictureURL: 'author_muffins/klubnika.png',
        price: 349,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Солёная карамель',
        description: 'Маффин с соленой карамелью',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Карамельный соус, Морская соль, Сливочное масло',
        pictureURL: 'author_muffins/salt.png',
        price: 339,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Банановый брауни',
        description: 'Шоколадно-банановый маффин в стиле брауни',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Бананы, Какао, Шоколадные капли, Сливочное масло',
        pictureURL: 'author_muffins/banan.png',
        price: 329,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Цитрусовый сад',
        description: 'Маффин с цитрусовым миксом',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Лимонная цедра, Апельсиновая цедра, Лайм, Сливочное масло',
        pictureURL: 'author_muffins/citrus.png',
        price: 319,
        bonusPercent: 5
      }
    }),
    prisma.product.create({
      data: {
        name: 'Тирамису',
        description: 'Кофейный маффин в стиле тирамису',
        ingredients: 'Мука, Сахар, Яйца, Молоко, Кофейный экстракт, Маскарпоне, Какао, Сливочное масло',
        pictureURL: 'author_muffins/tiramisu.png',
        price: 359,
        bonusPercent: 5
      }
    })
  ]);

  // Create test orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        totalAmount: 299,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: {
          create: {
            productId: products[0].id,
            quantity: 1,
            price: 299,
            totalPrice: 299,
            earnedBonus: 15
          }
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        totalAmount: 698,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        items: {
          create: {
            productId: products[1].id,
            quantity: 2,
            price: 349,
            totalPrice: 698,
            earnedBonus: 35
          }
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[2].id,
        totalAmount: 1197,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        items: {
          create: {
            productId: products[2].id,
            quantity: 3,
            price: 399,
            totalPrice: 1197,
            earnedBonus: 84
          }
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[3].id,
        totalAmount: 748,
        status: 'CANCELLED',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        items: {
          create: {
            productId: products[1].id,
            quantity: 1,
            price: 349,
            totalPrice: 349,
            earnedBonus: 17
          }
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[4].id,
        totalAmount: 399,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        items: {
          create: {
            productId: products[2].id,
            quantity: 1,
            price: 399,
            totalPrice: 399,
            earnedBonus: 28
          }
        }
      }
    })
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 