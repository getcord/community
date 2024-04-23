'use server';

import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { getUser } from '@/app/helpers/user';
import { addContentToClack } from '@/lib/clack';
import { MessageContent, MessageNodeType } from '@cord-sdk/types';

export async function deleteThread(threadID: string) {
  await Promise.all([
    fetchCordRESTApi(`threads/${threadID}`, 'DELETE'),
    logDeletionToClack(threadID),
  ]);
}

export async function deleteMessage(threadID: string, messageID: string) {
  await Promise.all([
    fetchCordRESTApi(`threads/${threadID}/messages/${messageID}`, 'DELETE'),
    logDeletionToClack(threadID, messageID),
  ]);
}

async function logDeletionToClack(
  threadID: string,
  messageID?: string | undefined,
) {
  const deleter = await getUser();
  if (!deleter.userID || !deleter.name) {
    return;
  }
  const content: MessageContent = [
    {
      type: MessageNodeType.PARAGRAPH,
      children: [
        {
          text: `${deleter.name} [${deleter.userID}] `,
          bold: true,
        },
        {
          text: `deleted ${
            !messageID ? 'the post' : `message (${messageID})`
          }.`,
        },
      ],
    },
  ];
  await addContentToClack(threadID, content);
}
