export const CATEGORIES = [
  "api",
  "components",
  "announcements",
  "customization",
  "documentation",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Metadata {
  pinned: boolean;
  admin: boolean;
  category: Category;
  title: string;
}
