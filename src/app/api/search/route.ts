import {
  COMMUNITY_SEARCH_INDEX,
  DOCS_SEARCH_INDEX,
  DEFAULT_SEARCH_LIMIT,
  DOCS_SEARCH_LIMIT,
} from '@/consts';
import { createEmbedding } from '@/lib/search/openai';
import { NextRequest, NextResponse } from 'next/server';
import {
  SingleResultData,
  parseResultsFromCommunity,
  parseResultsFromCord,
} from '@/app/api/search/parseSearchResults';

async function getSearchResultsFromIndex({
  searchTerm,
  index,
  limit,
}: {
  searchTerm: string;
  index: string;
  limit: number;
}): Promise<{
  index: string;
  results: SingleResultData[] | undefined;
}> {
  const searchTermVector = await createEmbedding(searchTerm);
  const response = await fetch(
    `${process.env.SEARCH_DATA_API_HOST}/api/chatContext`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.SEARCH_DATA_API_SECRET,
        index,
        embedding: searchTermVector,
        limit,
      }),
    },
  );
  let results;
  if (response.ok) {
    const data = await response.json();
    if (Array.isArray(data)) {
      if (index === COMMUNITY_SEARCH_INDEX) {
        results = await parseResultsFromCommunity(data);
      }
      if (index === DOCS_SEARCH_INDEX) {
        results = parseResultsFromCord(data);
      }
    }
  }

  return { index, results };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const searchTerm = params.get('searchTerm');
  if (!searchTerm) {
    return;
  }

  const allData = await Promise.all([
    getSearchResultsFromIndex({
      searchTerm,
      index: COMMUNITY_SEARCH_INDEX,
      limit: DEFAULT_SEARCH_LIMIT,
    }),
    getSearchResultsFromIndex({
      searchTerm,
      index: DOCS_SEARCH_INDEX,
      limit: DOCS_SEARCH_LIMIT,
    }),
  ]);

  return new NextResponse(JSON.stringify(allData));
}
