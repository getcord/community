import { fetchCordRESTClientApi } from '@/app/fetchCordRESTApi';
import { Category } from '@/app/types';
import { ClientThreadData } from '@cord-sdk/types';

export type SingleResultData = {
  url: any;
  title: string | undefined;
  categories: Category[] | undefined;
  content: string;
};

function assertResultType(result: any) {
  if (
    result &&
    typeof result === 'object' &&
    'chunk' in result &&
    typeof result.chunk === 'string' &&
    'url' in result &&
    typeof result.url === 'string' &&
    'score' in result &&
    'title' in result &&
    typeof result.title === 'string'
  ) {
    return result;
  }
}
export async function parseResultsFromCommunity(
  results: any[],
): Promise<SingleResultData[]> {
  const parsedData = [];

  for (const result of results) {
    const typedResult = assertResultType(result);
    if (typedResult) {
      const { chunk, title, url } = typedResult;
      const chunkArary = chunk.split('\n');
      const categoriesString = chunkArary.find((content: string) =>
        content.startsWith('Categories: '),
      );
      const categories = categoriesString
        ? (categoriesString
            .substring('Categories: '.length)
            .split(', ') as Category[])
        : undefined;

      const threadID = extractThreadIDFromURL(url);
      let content;
      if (threadID) {
        // Just call the thread api to get first message rather than relying
        // on regex magic and hoping the messages are in correct order
        // (do all this only if we don't have a threadID)
        content = (await getFirstMessageInThread(threadID)) ?? '';
      } else {
        content = extractFirstMessageFromConversationChunk(chunk);
      }

      parsedData.push({
        title,
        url,
        categories,
        content,
      });
    }
  }

  return parsedData;
}

async function getFirstMessageInThread(
  threadID: string,
): Promise<string | undefined> {
  const result = await fetchCordRESTClientApi<ClientThreadData>(
    'anonymous',
    `/thread/${threadID}?initialFetchCount=${1}`,
  );
  if (!(result?.thread && result?.thread?.firstMessage)) {
    return undefined;
  }

  return result?.thread?.firstMessage.plaintext;
}

const COMMUNITY_HOST_NAME = 'community.cord.com';
function extractThreadIDFromURL(url: string): string | undefined {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === COMMUNITY_HOST_NAME) {
      const pathParts = parsedUrl.pathname.split('/');

      if (pathParts.length > 3 && pathParts[1] === 'post') {
        return pathParts[2];
      }
    }
  } catch (error) {
    console.error('Invalid URL:', error);
  }

  return undefined;
}

function extractFirstMessageFromConversationChunk(chunk: string): string {
  const lines = chunk.split('\n');
  const filteredLines = lines.filter(
    (line) => !line.startsWith('Categories:') && !line.startsWith('title:'),
  );

  // Remove author names (anything before the first colon followed by a space)
  const messages = filteredLines.map((line) => {
    const result = line.replace(/^[^:]*:\s*/gm, '');
    return result;
  });
  // when getting the messages from cord to save to the db, we've sorted by DESC
  // so first message in list should hopefully be the first one in thread
  return messages[0];
}
