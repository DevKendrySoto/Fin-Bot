import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  // Expense
  { name: 'Groceries', icon: '🛒', color: '#FF5733', type: 'Expense' },
  { name: 'Food & Dining', icon: '🍔', color: '#FF8C00', type: 'Expense' },
  { name: 'Transport', icon: '🚗', color: '#FFC300', type: 'Expense' },
  { name: 'Health', icon: '🏥', color: '#28B463', type: 'Expense' },
  { name: 'Entertainment', icon: '🎬', color: '#8E44AD', type: 'Expense' },
  { name: 'Utilities', icon: '💡', color: '#2E86C1', type: 'Expense' },
  { name: 'Rent', icon: '🏠', color: '#E74C3C', type: 'Expense' },
  { name: 'Education', icon: '📚', color: '#1ABC9C', type: 'Expense' },
  { name: 'Clothing', icon: '👕', color: '#F39C12', type: 'Expense' },
  { name: 'Personal Care', icon: '💆', color: '#EB984E', type: 'Expense' },
  { name: 'Subscriptions', icon: '📺', color: '#5D6D7E', type: 'Expense' },
  { name: 'Travel', icon: '✈️', color: '#48C9B0', type: 'Expense' },
  { name: 'Gifts', icon: '🎁', color: '#F1948A', type: 'Expense' },
  { name: 'Other Expense', icon: '📦', color: '#AAB7B8', type: 'Expense' },
  // Income
  { name: 'Salary', icon: '💰', color: '#27AE60', type: 'Income' },
  { name: 'Freelance', icon: '💻', color: '#2ECC71', type: 'Income' },
  { name: 'Business', icon: '🏢', color: '#16A085', type: 'Income' },
  { name: 'Investments', icon: '📈', color: '#1E8BC3', type: 'Income' },
  { name: 'Rental Income', icon: '🏘️', color: '#2980B9', type: 'Income' },
  { name: 'Bonus', icon: '🎯', color: '#8E44AD', type: 'Income' },
  { name: 'Other Income', icon: '💵', color: '#7F8C8D', type: 'Income' },
];

async function main() {
  console.log('Seeding default categories...');

  // Delete existing default categories and re-seed
  await prisma.category.deleteMany({ where: { userId: null } });
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: null })),
  });

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
