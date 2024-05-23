import {
  MessageContent,
  MessageNodeType,
  ServerGroupData,
  CoreThreadData,
  ClientUserData,
  WebhookMessage,
} from '@cord-sdk/types';
import { addContentToClack } from '@/lib/clack';
import { getCategoriesString } from '@/utils';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';

export async function sendNotificationToClack(
  isFirstMessage: boolean,
  isCommunityMessage: boolean,
  thread: CoreThreadData,
  message: WebhookMessage,
  author: ClientUserData,
) {
  let action = '';
  const categoriesString = getCategoriesString(thread.metadata);

  if (isFirstMessage) {
    if (isCommunityMessage) {
      action = `created a new post [${thread.id}] in ${categoriesString} : ${thread.name}.`;
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
  await addContentToClack(thread.id, content);
}
