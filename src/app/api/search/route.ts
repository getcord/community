import {
  COMMUNITY_SEARCH_INDEX,
  DOCS_SEARCH_INDEX,
  DEFAULT_SEARCH_LIMIT,
} from '@/consts';
import { createEmbedding } from '@/lib/search/openai';
import { NextRequest, NextResponse } from 'next/server';

async function getSearchResultsFromIndex({
  searchTerm,
  index,
}: {
  searchTerm: string;
  index: string;
}) {
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
        limit: DEFAULT_SEARCH_LIMIT,
      }),
    },
  );
  if (!response.ok) {
    const errorResponse = await response.json();
    const errorMessage = errorResponse.error || response.statusText;
    console.error(`Failed to fetch: ${errorMessage}`);
    return { index, results: undefined };
  }

  const results = await response.json();
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
    }),
    getSearchResultsFromIndex({
      searchTerm,
      index: DOCS_SEARCH_INDEX,
    }),
  ]);

  return new NextResponse(JSON.stringify(allData));
}
