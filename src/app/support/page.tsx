import ThreadDetails from './[threadId]/page';

export default function SupportPage({
  params,
}: {
  params?: { threadId: string };
}) {
  return params?.threadId ? <ThreadDetails /> : null;
}
