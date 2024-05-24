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
}: {
  index: string;
  embedding: number[];
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
        limit: DEFAULT_SEARCH_LIMIT,
        embedding,
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
    }),
    getSearchResultsFromIndex({
      embedding: searchTermEmbedding,
      index: DOCS_SEARCH_INDEX,
    }),
  ]);

  return new NextResponse(JSON.stringify(allData));
}
