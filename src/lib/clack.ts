import { CLACK_APP_ID, CLACK_APP_SECRET, CORD_API_URL } from '@/consts';
import { fetchCordRESTApi } from '@cord-sdk/server';
import type { MessageContent } from '@cord-sdk/types';

export async function addContentToClack(id: string, content: MessageContent) {
  const channel = 'community-events';
  const clackThreadID = `community-events-${id}`;

  await fetchCordRESTApi(`threads/${clackThreadID}/messages`, {
    method: 'POST',
    project_id: CLACK_APP_ID,
    project_secret: CLACK_APP_SECRET,
    api_url: CORD_API_URL,
    body: {
      authorID: 'eventbot',
      skipLinkPreviews: true,
      content,
      createThread: {
        name: `Community Event ${id}`,
        url: `https://clack.cord.com/channel/${channel}/thread/${clackThreadID}`,
        location: { channel },
        organizationID: 'clack_all',
      },
    },
  });
}
