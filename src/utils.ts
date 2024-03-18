import { EntityMetadata } from '@cord-sdk/types';
import { Metadata, CATEGORIES, Category } from './app/types';

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function mapCategoryEndpointsToTitles(category: string) {
  if (category === 'api') {
    return 'API';
  }
  return capitalizeFirstLetter(category);
}

export function getTypedMetadata(data: EntityMetadata | undefined): Metadata {
  const metadata: Metadata = { pinned: false, admin: false, categories: [] };
  if (!data) {
    return metadata;
  }
  if (typeof data.pinned === 'boolean') {
    metadata.pinned = data.pinned;
  }
  if (typeof data.admin === 'boolean') {
    metadata.admin = data.admin;
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
