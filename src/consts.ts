export const CORD_API_URL =
  process.env.CORD_API_URL ?? 'https://api.cord.com/v1/';
export const CORD_DOCS_URL = 'https://docs.cord.com';
export const CORD_CONSOLE_URL = 'https://console.cord.com';

export const CORD_APP_ID = process.env.CORD_APP_ID!;
export const CORD_SECRET = process.env.CORD_SECRET!;
export const EVERYONE_GROUP_ID = 'community_all';
export const ADMINS_GROUP_ID = 'admins';
export const SERVER_HOST = process.env.NEXT_PUBLIC_SERVER_HOST!;

export const CLACK_APP_ID = process.env.CLACK_APP_ID!;
export const CLACK_APP_SECRET = process.env.CLACK_APP_SECRET!;

export const THREAD_INITIAL_FETCH_COUNT = 100;

export const COMMUNITY_SEARCH_INDEX = 'community';
export const DOCS_SEARCH_INDEX = 'cord';
export const DEFAULT_SEARCH_LIMIT = 7;
// Fetching way more than needed so we can exclude
// community.com results
export const DOCS_SEARCH_LIMIT = 50;
