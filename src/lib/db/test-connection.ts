import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Test database connection and basic operations
 */
export async function testDatabaseConnection() {
  console.log('🧪 Testing database connection and operations...');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const connectionTest = await db.execute(sql`SELECT 1 as test, NOW() as timestamp`);
    console.log('✅ Connection successful:', connectionTest.rows[0]);

    // Test 2: Check existing tables
    console.log('2️⃣ Checking existing tables...');
    const tablesQuery = await db.execute(sql`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('📋 Available tables:', tablesQuery.rows.map(r => r.table_name));

    // Test 3: Check if we can query schools table
    console.log('3️⃣ Testing schools table access...');
    const schoolsTest = await db.execute(sql`
      SELECT COUNT(*) as count FROM schools;
    `);
    console.log('🏫 Schools count:', schoolsTest.rows[0].count);

    // Test 4: Check Drizzle schema compatibility
    console.log('4️⃣ Testing Drizzle schema compatibility...');
    try {
      const drizzleTest = await db.query.schools.findMany({
        limit: 1,
      });
      console.log('✅ Drizzle schema working correctly');
    } catch (error) {
      console.log('⚠️ Drizzle schema needs setup:', error.message);
    }

    console.log('🎉 All database tests completed!');
    return { success: true };

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return { success: false, error: error.message };
  }
}