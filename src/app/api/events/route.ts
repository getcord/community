import { NextResponse, NextRequest } from 'next/server';
import {
  MessageContent,
  MessageNodeType,
  ServerGroupData,
  ThreadMessageAddedWebhookPayload,
  WebhookWrapperProperties,
  EntityMetadata,
} from '@cord-sdk/types';

import { parseWebhookBody, validateWebhookSignature } from '@cord-sdk/server';
import { CORD_SECRET, EVERYONE_GROUP_ID } from '@/consts';
import { addContentToClack } from '@/lib/clack';
import { isCategory } from '@/utils';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';

export function getCategoriesString(metadata: EntityMetadata): string {
  const categories = Object.keys(metadata).filter(
    (key) => metadata[key] && isCategory(key),
  );
  return categories.join(', ');
}

/*
When a new message is created in community, we want to:
- Send a notification in clack
- TODO: Create a new or update the existing post in our vector db - used for search
*/
async function onNewMessageAdded(event: ThreadMessageAddedWebhookPayload) {
  const { thread, message, groupID, author } = event;
  const isFirstMessage = thread.total === 1;
  const isCommunityMessage = groupID === EVERYONE_GROUP_ID;

  let action = '';
  const categoriesString = getCategoriesString(thread.metadata);
  let messages = [];
  if (isFirstMessage) {
    if (isCommunityMessage) {
      action = `created a new post [${thread.id}] in ${categoriesString} : ${thread.name}.`;
      messages.push({ ...message, author: message.author.displayName });
    } else {
      const customerGroup = await fetchCordRESTApi<ServerGroupData>(
        `groups/${thread.groupID}`,
      );
      action = `asked a new question [${thread.id}] in ${customerGroup?.name}.`;
    }
  } else {
    action = `replied [${message.id}].`;
  }
  const url = isCommunityMessage
    ? `${thread.url}`
    : `${thread.url}/${thread.id}`;
  const content: MessageContent = [
    {
      type: MessageNodeType.PARAGRAPH,
      children: [
        {
          text: `${author.name} [${author.id}] `,
          bold: true,
        },
        { text: `${action}` },
      ],
    },
    {
      type: MessageNodeType.PARAGRAPH,
      children: [{ text: url }],
    },
    {
      type: MessageNodeType.PARAGRAPH,
      children: [{ text: message.plaintext }],
    },
  ];
  await addContentToClack(event.threadID, content);
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
