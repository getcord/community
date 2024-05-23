import { fetchCordRESTClientApi } from '@/app/fetchCordRESTApi';
import { Category } from '@/app/types';
import { DEFAULT_SEARCH_LIMIT } from '@/consts';
import { ClientThreadData } from '@cord-sdk/types';

export type SingleResultData = {
  url: any;
  title: string | undefined;
  categories: Category[] | undefined;
  content: string;
};

function assertResultType(result: any): true | undefined {
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
    return true;
  }
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

export async function parseResultsFromCommunity(
  results: any[],
): Promise<SingleResultData[]> {
  const parsedData = [];

  for (const result of results) {
    if (assertResultType(result)) {
      const { chunk, title, url } = result;
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
      let content = '';
      if (threadID) {
        // Just call the the thread api to get first message rather
        // than trying to break down and figure our which part of the
        // conversation is the main question and what's not just 'sounds good, thanks'
        // so we can have render a useful preview in the FE
        content = (await getFirstMessageInThread(threadID)) ?? '';
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

export function parseResultsFromCord(results: any[]): SingleResultData[] {
  const parsedData = [];

  for (const result of results) {
    if (assertResultType(result)) {
      const { chunk, title, url } = result;
      // Since we're filtering stuff out below, make sure we
      // stop doing that as soon as we've gotten the size we want
      if (parsedData.length >= DEFAULT_SEARCH_LIMIT) {
        return parsedData;
      }

      // TODO: convert chunk markdown to string - remove images, convert links
      // to proper html tags etc

      // only return results if they are not coming from community since the current
      // data we have in the 'cord' index contains everything under cord.com, we also
      // have community results - so make sure to ignore them as we're getting them
      // back from the 'community' index anyway
      if (result.url && !result.url.includes(COMMUNITY_HOST_NAME)) {
        parsedData.push({
          url: url,
          title: title,
          content: chunk,
          categories: undefined,
        });
      }
    }
  }

  return parsedData;
}
