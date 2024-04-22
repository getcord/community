import { NextResponse, NextRequest } from 'next/server';
import {
  MessageContent,
  MessageNodeType,
  ServerGroupData,
  ThreadMessageAddedWebhookPayload,
  WebhookWrapperProperties,
} from '@cord-sdk/types';

import { parseWebhookBody, validateWebhookSignature } from '@cord-sdk/server';
import { CORD_SECRET, EVERYONE_GROUP_ID } from '@/consts';
import { addContentToClack } from '@/lib/clack';
import { isCategory } from '@/utils';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';

async function sendNotificationToClack(
  event: ThreadMessageAddedWebhookPayload,
) {
  const isFirstMessage = event.thread.total === 1;
  const isCommunityMessage = event.groupID === EVERYONE_GROUP_ID;
  const author = event.author.name;
  const authorID = event.author.id;
  const thread = event.thread;
  const message = event.message;
  let action = '';
  if (isFirstMessage) {
    if (isCommunityMessage) {
      const metadata = thread.metadata;
      const categories = [];
      for (const key in metadata) {
        if (metadata[key] && isCategory(key)) {
          categories.push(key);
        }
      }
      action = `created a new post [${thread.id}] in ${categories.join(
        ', ',
      )} : ${thread.name}.`;
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
          text: `${author} [${authorID}] `,
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
  await sendNotificationToClack(threadData.event);

  return NextResponse.json({ success: true }, { status: 200 });
}
