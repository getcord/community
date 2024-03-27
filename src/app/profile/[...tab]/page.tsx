import { getUser } from '@/app/helpers/user';
import Tabs from '@/app/components/Tabs';
import Notifications from '@/app/profile/Notifications';
import Preferences from '@/app/profile/Preferences';
import { redirect } from 'next/navigation';

export default async function ProfileTab({
  params,
}: {
  params: { tab: string[] };
}) {
  const user = await getUser();
  const currentPage = params?.tab[0];

  if (!['notifications', 'preferences'].includes(currentPage)) {
    redirect('/profile/notifications');
  }

  return (
    <>
      <Tabs
        tabs={[
          { label: 'notifications', name: 'Notifications' },
          { label: 'preferences', name: 'Preferences' },
        ]}
        activeTab={currentPage}
      />

      {currentPage === 'preferences' ? (
        <Preferences user={user} />
      ) : (
        <Notifications />
      )}
    </>
  );
}
