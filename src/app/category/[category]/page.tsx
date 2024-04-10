import { Metadata } from 'next';

import { Category } from '@/app/types';
import ChatDisplay from './ChatDisplay';
import { mapCategoryEndpointsToTitles } from '@/utils';

type Props = {
  params: { category: Category };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = mapCategoryEndpointsToTitles(params?.category);

  return {
    title: `${category} | Cord Community`,
  };
}

export default function ChannelDisplay({ params }: Props) {
  return <ChatDisplay channelName={params.category} />;
}
