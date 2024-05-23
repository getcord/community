import {
  CoreMessageData,
  CoreThreadData,
  WebhookMessage,
} from '@cord-sdk/types';
import { COMMUNITY_SEARCH_INDEX } from '@/consts';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { createEmbedding } from '@/lib/search/openai';
import { getClientUserById } from '@/app/helpers/user';
import { deleteURLFromIndex, storeChunk } from '@/lib/search/api';
import { getCategoriesString } from '@/utils';

// function to save post/thread data to our vector db which
// we use for semantic search.
export async function saveSearchData(
  isFirstMessage: boolean,
  thread: CoreThreadData,
  message: WebhookMessage,
) {
  let messages = [];

  // if first message, just use the message from the message-added event
  if (isFirstMessage) {
    messages.push({
      ...message,
      authorDisplayName: message.author.displayName,
    });
  } else {
    // if a reply, get all messages in thread
    const messagesData = await fetchCordRESTApi<CoreMessageData[]>(
      `threads/${thread.id}/messages?sortDirection=ASCENDING`,
      'GET',
    );
    if (messagesData) {
      const usersIdNameMap = new Map();
      for (const message of messagesData) {
        if (!usersIdNameMap.has(message.authorID)) {
          const user = await getClientUserById(message.authorID);
          usersIdNameMap.set(message.authorID, user?.displayName ?? '');
        }
        messages.push({
          ...message,
          authorDisplayName: usersIdNameMap.get(message.authorID),
        });
      }
    }
  }

  if (messages.length > 0) {
    try {
      // if it's a reply delete the existing entry in db so we can regenerate
      // the vector embedding with new message.
      if (!isFirstMessage) {
        await deleteURLFromIndex(COMMUNITY_SEARCH_INDEX, thread.url);
      }

      // Make sure to include categories, post title and authors as searchable elements.
      const categories = `Categories: ${getCategoriesString(thread.metadata)}`;
      const title = `Title: ${thread.name}`;
      const conversationArray = [categories, title];

      // breaks down the cord message object to readable plaintext string
      // that we can easily convert to a vector. Make sure to not have weird
      // characters or symbols to make it clear to the llm what's searchable.
      messages.forEach((message) => {
        conversationArray.push(
          `${message.authorDisplayName}: ${message.plaintext.replace(
            /\n/g,
            ' ',
          )}`,
        );
      });
      const chunk = conversationArray.join('\n');
      const embedding = await createEmbedding(chunk);
      await storeChunk(
        COMMUNITY_SEARCH_INDEX,
        chunk,
        embedding,
        thread.name,
        thread.url,
      );
    } catch (_) {
      // do nothing
    }
  }
}
