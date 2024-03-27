import { getUser } from '@/app/helpers/user';
import UpdateUserDetails from '@/app/preferences/UpdateUserDetails';

export default async function PreferencesPage() {
  const user = await getUser();

  return <UpdateUserDetails user={user} />;
}
