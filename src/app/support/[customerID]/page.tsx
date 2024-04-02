import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { getUser } from '@/app/helpers/user';

async function addAdminIfNecessary(customerID: string) {
  const user = await getUser();
  if (user.isAdmin) {
    console.log(`Adding ${user.userID} to group ${customerID}`);
    // Now lets make sure the admin is part of the group
    await fetchCordRESTApi(`groups/${customerID}/members`, 'POST', {
      add: [user.userID],
    });
  }
}

export default async function SupportPage({
  params,
}: {
  params: { customerID: string };
}) {
  await addAdminIfNecessary(params.customerID);
  // Currently this does nothing since all the work is done in layout.tsx
  return <></>;
}
