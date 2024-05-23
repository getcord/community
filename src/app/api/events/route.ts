import { NextResponse, NextRequest } from 'next/server';
import {
  ThreadMessageAddedWebhookPayload,
  WebhookWrapperProperties,
} from '@cord-sdk/types';
import { parseWebhookBody, validateWebhookSignature } from '@cord-sdk/server';
import { CORD_SECRET, EVERYONE_GROUP_ID } from '@/consts';
import { saveSearchData } from '@/app/api/events/saveSearchData';
import { sendNotificationToClack } from '@/app/api/events/sendNotificationToClack';

/*
When a new message is created in community, we want to:
- Send a notification in clack
- Create a new or update the existing post in our vector db - used for search
*/
async function onNewMessageAdded(event: ThreadMessageAddedWebhookPayload) {
  const { thread, message, groupID, author } = event;
  const isFirstMessage = thread.total === 1;
  const isCommunityMessage = groupID === EVERYONE_GROUP_ID;

  // only save message to search data if it's a public one
  if (isCommunityMessage) {
    await saveSearchData(isFirstMessage, thread, message);
  }
  await sendNotificationToClack(
    isFirstMessage,
    isCommunityMessage,
    thread,
    message,
    author,
  );
}

/**
 * This API route is the starting point for using our Events Webhook.
 * Events Webhook lets you write code that runs when something happens in cord.
 * See https://docs.cord.com/reference/events-webhook
 **/
export async function POST(request: NextRequest) {
  const text = await request.text();
  validateWebhookSignature(
    text,
    request.headers.get('X-Cord-Timestamp'),
    request.headers.get('X-Cord-Signature'),
    CORD_SECRET,
  );

  const data = parseWebhookBody<'thread-message-added' | 'url-verification'>(
    text,
  );

  if (data.type === 'url-verification') {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const threadData = data as WebhookWrapperProperties<'thread-message-added'>;
  await onNewMessageAdded(threadData.event);

  return NextResponse.json({ success: true }, { status: 200 });
}
