import { EntityMetadata } from '@cord-sdk/types';
import { Metadata, Category } from './app/types';

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function mapCategoryEndpointsToTitles(category: string) {
  if (category === 'api') {
    return 'API';
  }
  return capitalizeFirstLetter(category);
}

export function getTypedMetadata(data: EntityMetadata): Metadata {
  return {
    pinned: typeof data.pinned === 'boolean' ? data.pinned : false,
    admin: typeof data.admin === 'boolean' ? data.admin : false,
    category: data.category as Category,
    title: typeof data.title === 'string' ? data.title : '', // what should be the default?
  };
}
