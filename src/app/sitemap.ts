import { ServerListThreads } from '@cord-sdk/types';
import { buildQueryParams, fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { CATEGORIES } from '@/app/types';
import { SERVER_HOST } from '@/consts';
import { MetadataRoute } from 'next';
import { slugify } from '@/utils';

async function loadPosts() {
  const filter = buildQueryParams([
    { field: 'filter', value: JSON.stringify({ groupID: 'community_all' }) },
  ]);
  const threads = await fetchCordRESTApi<ServerListThreads>(`threads${filter}`);
  if (!threads) {
    return [];
  }
  return threads.threads.map((thread) => {
    return { url: `${SERVER_HOST}/post/${thread.id}/${slugify(thread.name)}` };
  });
}

async function loadCategories() {
  return CATEGORIES.map((category) => {
    return { url: `${SERVER_HOST}/category/${category}` };
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await loadPosts();
  const categories = await loadCategories();
  return [...posts, ...categories];
}
