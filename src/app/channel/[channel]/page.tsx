import ChatDisplay from "./ChatDisplay";

export default function ChannelDisplay({
  params,
}: {
  params: { channel: string };
}) {
  return <ChatDisplay channelName={params.channel} />;
}
