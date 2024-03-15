import ChatDisplay from './ChatDisplay';

export default function ChannelDisplay({
  params,
}: {
  params: { category: string };
}) {
  return <ChatDisplay channelName={params.category} />;
}
