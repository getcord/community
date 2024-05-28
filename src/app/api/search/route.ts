import {
  COMMUNITY_SEARCH_INDEX,
  DOCS_SEARCH_INDEX,
  DEFAULT_SEARCH_LIMIT,
} from '@/consts';
import { createEmbedding } from '@/lib/search/openai';
import { NextRequest, NextResponse } from 'next/server';

async function getSearchResultsFromIndex({
  index,
  embedding,
  limit,
}: {
  index: string;
  embedding: number[];
  limit: number;
}) {
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
        embedding,
        limit,
      }),
    },
  );
  if (response.ok) {
    const results = await response.json();
    return { index, results };
  }

  return { index, results: undefined };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const searchTerm = params.get('searchTerm');
  if (!searchTerm) {
    return;
  }

  const searchTermEmbedding = await createEmbedding(searchTerm);
  const allData = await Promise.all([
    getSearchResultsFromIndex({
      embedding: searchTermEmbedding,
      index: COMMUNITY_SEARCH_INDEX,
      limit: DEFAULT_SEARCH_LIMIT,
    }),
    getSearchResultsFromIndex({
      embedding: searchTermEmbedding,
      index: DOCS_SEARCH_INDEX,
      limit: DEFAULT_SEARCH_LIMIT,
    }),
  ]);

  return new NextResponse(JSON.stringify(allData));
}
