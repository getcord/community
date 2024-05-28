import { fetchCordRESTClientApi } from '@/app/fetchCordRESTApi';
import { Category } from '@/app/types';
import {
  COMMUNITY_SEARCH_INDEX,
  DEFAULT_SEARCH_LIMIT,
  DOCS_SEARCH_INDEX,
} from '@/consts';
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
        // For results from cord/docs, we've fetched more than we need so that
        // we can filter out community.cord.com results so make sure to return
        // the results as soon as we've gotten enough.
        if (parsedData.length >= DEFAULT_SEARCH_LIMIT) {
          return parsedData;
        }
        // Ignore results coming from community since the data we have
        // in the 'cord' index contains everything under cord.com -
        // including community.cord.com results.
        if (result.url !== COMMUNITY_HOST_NAME) {
          /*
            Regex to extract useful plaintext data from markdown results from web scraper
            1. remove all images eg ![logo](cord.com)) or [![test](cord.com)) logo] -> ''
            2. remove link structure, but leave text eg  [link](cord.com) -> 'cord.com'
            3. extra space cleaned up
          */
          const content = result.chunk
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/\s+/g, ' ');

          parsedData.push({
            title: result.title,
            url: result.url,
            content,
            categories: undefined,
          });
        }
      }
    }
  }
  return parsedData;
}

export async function parseResultsFromCommunity(
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

export function getContentFromChunk(chunk: string): string {
  let content = chunk;
  // Remove Markdown image syntax
  content = content.replace(/!\[.*?\]\(.*?\)/g, '');
  // Remove Markdown links but keep the link text
  content = content.replace(/\[(.*?)\]\(.*?\)/g, '$1').trim();
  content = content.replace(/\s+/g, ' ');

  return content;
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
}
