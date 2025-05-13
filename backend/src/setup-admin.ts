import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// This script creates an initial admin user
async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Check if admin already exists
    const adminExists = await prisma.admin.findUnique({
      where: { username: 'admin' },
    });
    
    if (adminExists) {
      console.log('Admin user already exists.');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });
    
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change this password after logging in for the first time.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 