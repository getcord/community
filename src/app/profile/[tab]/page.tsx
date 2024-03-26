import Tabs from '@/app/components/Tabs';
import Notifications from '@/app/profile/Notifications';

export default async function ProfileTab({
  params,
}: {
  params: { tab: string };
}) {
  const currentPage = params?.tab;

  return (
    <>
      <Tabs
        tabs={[{ label: 'notifications', name: 'Notifications' }]}
        activeTab={currentPage}
      />

      <Notifications />
    </>
  );
}
