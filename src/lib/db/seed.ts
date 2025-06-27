import { db } from './index';
import { schools, departments, specialties, feeStructures, superAdminUsers } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create sample schools
    const [sampleSchool] = await db.insert(schools).values([
      {
        name: 'Tech University',
        code: 'TECH001',
        address: '123 Education Street, Tech City',
        phone: '+1-555-0123',
        email: 'admin@techuniversity.edu',
        isActive: true,
      },
    ]).returning();

    console.log('✅ Created sample school:', sampleSchool.name);

    // Create departments
    const [csDepartment, businessDepartment] = await db.insert(departments).values([
      {
        schoolId: sampleSchool.id,
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Technology',
        isActive: true,
      },
      {
        schoolId: sampleSchool.id,
        name: 'Business Administration',
        code: 'BA',
        description: 'Department of Business and Management',
        isActive: true,
      },
    ]).returning();

    console.log('✅ Created departments');

    // Create specialties
    const [softwareSpec, aiSpec, marketingSpec] = await db.insert(specialties).values([
      {
        departmentId: csDepartment.id,
        name: 'Software Engineering',
        code: 'SE',
        description: 'Software Development and Engineering',
        durationYears: '4',
        isActive: true,
      },
      {
        departmentId: csDepartment.id,
        name: 'Artificial Intelligence',
        code: 'AI',
        description: 'AI and Machine Learning',
        durationYears: '4',
        isActive: true,
      },
      {
        departmentId: businessDepartment.id,
        name: 'Digital Marketing',
        code: 'DM',
        description: 'Digital Marketing and E-commerce',
        durationYears: '3',
        isActive: true,
      },
    ]).returning();

    console.log('✅ Created specialties');

    // Create fee structures
    await db.insert(feeStructures).values([
      {
        specialtyId: softwareSpec.id,
        academicYear: '2024-2025',
        totalAmount: '8500.00',
        currency: 'USD',
        allowsInstallments: 'true',
        maxInstallments: 4,
        lateFeePercentage: '5.00',
        isActive: 'true',
      },
      {
        specialtyId: aiSpec.id,
        academicYear: '2024-2025',
        totalAmount: '9500.00',
        currency: 'USD',
        allowsInstallments: 'true',
        maxInstallments: 4,
        lateFeePercentage: '5.00',
        isActive: 'true',
      },
      {
        specialtyId: marketingSpec.id,
        academicYear: '2024-2025',
        totalAmount: '6500.00',
        currency: 'USD',
        allowsInstallments: 'true',
        maxInstallments: 3,
        lateFeePercentage: '5.00',
        isActive: 'true',
      },
    ]);

    console.log('✅ Created fee structures');

    // Create super admin user (you'll need to update this with actual user ID)
    await db.insert(superAdminUsers).values([
      {
        email: 'superadmin@platform.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        permissions: ['all'],
        isActive: true,
      },
    ]);

    console.log('✅ Created super admin user');
    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();