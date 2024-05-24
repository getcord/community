import {
  COMMUNITY_SEARCH_INDEX,
  DOCS_SEARCH_INDEX,
  DEFAULT_SEARCH_LIMIT,
} from '@/consts';
import { getSearchResults } from '@/lib/search/api';
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
  const results = await getSearchResults(
    index,
    searchTermVector,
    DEFAULT_SEARCH_LIMIT,
  );

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
