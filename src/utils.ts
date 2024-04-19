import { EntityMetadata } from '@cord-sdk/types';
import { PostMetadata, CATEGORIES, Category } from './app/types';

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function mapCategoryEndpointsToTitles(category: string) {
  if (category === 'api') {
    return 'API';
  }
  if (category === 'bugreport') {
    return 'Bug Report';
  }
  return capitalizeFirstLetter(category);
}

export function getPostMetadata(
  data: EntityMetadata | undefined,
): PostMetadata {
  const metadata: PostMetadata = {
    pinned: false,
    locked: false,
    categories: [],
    answerMessageID: null,
  };
  if (!data) {
    return metadata;
  }
  if (typeof data.pinned === 'boolean') {
    metadata.pinned = data.pinned;
  }
  if (typeof data.locked === 'boolean') {
    metadata.locked = data.locked;
  }

  if (
    'answerMessageID' in data &&
    typeof data['answerMessageID'] === 'string'
  ) {
    metadata.answerMessageID = data.answerMessageID;
  }
  for (const key in data) {
    // This is to make Typescript happy as it doesn't seem to consider an
    // includes check sufficient to tell that the category is properly set
    const category = key as Category;
    if (
      key !== 'pinned' &&
      key !== 'admin' &&
      typeof data[key] === 'boolean' &&
      CATEGORIES.includes(category)
    ) {
      metadata.categories.push(category);
    }
  }
  return metadata;
}

export function slugify(title: string) {
  return title
    .trim()
    .replaceAll(/[^(a-zA-Z|\d|\s)]+/g, '')
    .replaceAll(' ', '-');
}

export function isCategory(value: string): value is Category {
  return CATEGORIES.includes(value.toLowerCase() as Category);
}
