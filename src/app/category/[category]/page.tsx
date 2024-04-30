import { Metadata } from 'next';

import ThreadList from '@/app/components/ThreadList';
import { getUser } from '@/app/helpers/user';
import { Category } from '@/app/types';
import { mapCategoryEndpointsToTitles } from '@/utils';

type Props = {
  params: { category: Category };
};

// All categories allow discussion for logged in users except
// `announcements` which requires the user to be an admin
async function getAllowDiscussion(category: Category) {
  const { userID, isAdmin } = await getUser();
  if (!userID) {
    return false;
  }
  if (category === 'announcements') {
    return isAdmin ?? false;
  }
  return true;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = mapCategoryEndpointsToTitles(params?.category);

  return {
    title: `${category} | Cord Community`,
  };
}

export default async function PostsList({ params }: Props) {
  const allowDiscussion = await getAllowDiscussion(params.category);

  return (
    <ThreadList category={params.category} allowDiscussion={allowDiscussion} />
  );
}
