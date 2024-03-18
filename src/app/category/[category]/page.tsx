import { Category } from '@/app/types';
import ChatDisplay from './ChatDisplay';

export default function ChannelDisplay({
  params,
}: {
  params: { category: Category };
}) {
  return <ChatDisplay channelName={params.category} />;
}
