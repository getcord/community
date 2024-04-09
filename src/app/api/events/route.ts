import { NextResponse, NextRequest } from 'next/server';
import { validateWebhookSignature } from '@cord-sdk/server';
import { CORD_SECRET } from '@/consts';

/**
 * This API route is the starting point for using our Events Webhook.
 * Events Webhook lets you write code that runs when something happens in cord.
 * See https://docs.cord.com/reference/events-webhook
 **/
export async function POST(request: NextRequest) {
  const data = await request.json();
  validateWebhookSignature(
    {
      header: (header) => request.headers.get(header) ?? '',
      body: data,
    },
    CORD_SECRET,
  );
  return NextResponse.json({ success: true }, { status: 200 });
}
