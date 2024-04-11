import { ID } from '@cord-sdk/types';

export const CATEGORIES = [
  'api',
  'components',
  'announcements',
  'customization',
  'documentation',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Metadata {
  pinned: boolean;
  admin: boolean;
  categories: Category[];
  answerMessageID: string | null;
}

export interface SupportChat {
  customerID: ID;
  customerName: string;
}
