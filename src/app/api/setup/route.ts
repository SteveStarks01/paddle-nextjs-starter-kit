import { NextResponse } from 'next/server';
import { setupDatabase, healthCheck } from '@/lib/db/setup';

export async function GET() {
  try {
    const health = await healthCheck();
    
    if (health.status === 'unhealthy') {
      return NextResponse.json({
        error: 'Database connection failed',
        details: health.error,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'Database is healthy',
      timestamp: health.timestamp,
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await setupDatabase();
    
    return NextResponse.json({
      message: 'Database setup completed successfully',
      ...result,
    });

  } catch (error) {
    console.error('Setup API error:', error);
    return NextResponse.json({
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}