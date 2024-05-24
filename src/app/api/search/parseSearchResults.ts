import { fetchCordRESTClientApi } from '@/app/fetchCordRESTApi';
import { Category } from '@/app/types';
import { COMMUNITY_SEARCH_INDEX } from '@/consts';
import { ClientThreadData } from '@cord-sdk/types';

export type SingleResultData = {
  url: any;
  title: string | undefined;
  categories: Category[] | undefined;
  content: string;
};

export async function parseSearchResuls(
  index: string,
  results: any[],
): Promise<SingleResultData[]> {
  const parsedData: SingleResultData[] = [];

  for (const result of results) {
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
      if (index === COMMUNITY_SEARCH_INDEX) {
        const structuredData = await parseResultsFromCommunity(
          result.title,
          result.url,
          result.chunk,
        );

        parsedData.push(structuredData);
      } else {
      }
    }
  }
  return parsedData;
}

async function parseResultsFromCommunity(
  title: string,
  url: string,
  chunk: string,
): Promise<SingleResultData> {
  const chunkArray = chunk.split('\n');

  const categoriesString = chunkArray.find((content: string) =>
    content.startsWith('Categories: '),
  );
  const categories = categoriesString
    ? (categoriesString
        .substring('Categories: '.length)
        .split(', ') as Category[])
    : undefined;

  const threadID = extractThreadIDFromURL(url);

  // If we have threadID, just call the thread api to get first message otherwise
  // do some string manipulation magic on the plaintext conversation chunk.
  let content = '';
  if (threadID) {
    const threadResults = await fetchCordRESTClientApi<ClientThreadData>(
      'anonymous',
      `/thread/${threadID}?initialFetchCount=${1}`,
    );

    content = threadResults?.thread?.firstMessage?.plaintext ?? '';
  } else {
    const filteredChunks = chunkArray.filter(
      (value) =>
        !value.startsWith('Categories:') && !value.startsWith('Title:'),
    );

    // when getting the messages from cord to save to the db, we've sorted by DESC
    // so first message in list should hopefully be the first one in thread
    const maybeFirstMessage = filteredChunks[0];
    // Remove author names (anything before the first colon followed by a space)
    content = maybeFirstMessage.replace(/^[^:]*:\s*/gm, '');
  }

  return {
    title,
    url,
    categories,
    content,
  };
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
