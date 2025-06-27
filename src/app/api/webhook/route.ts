import { NextRequest, NextResponse } from 'next/server';

// This endpoint is no longer needed since we removed Paddle
// Keeping it for backward compatibility but returning 404
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Webhook endpoint no longer available' },
    { status: 404 }
  );
}