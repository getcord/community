export const CATEGORIES = [
  'api',
  'components',
  'announcements',
  'customization',
  'documentation',
  'bugreport',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type PostMetadata = {
  pinned: boolean;
  locked: boolean;
  categories: Category[];
  answerMessageID: string | null;
};

export interface SupportChat {
  customerID: string;
  customerName: string;
}
