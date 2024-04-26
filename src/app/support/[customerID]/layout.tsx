import { getUser } from '@/app/helpers/user';
import { getCustomerInfo } from '@/app/helpers/customerInfo';
import Support from './Support';
import styles from './support.module.css';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { ServerGroupData } from '@cord-sdk/types';

async function getData(customerID: string) {
  const { isAdmin } = await getUser();
  if (isAdmin) {
    // For admins, we want to load the customer information and display that
    // rather than the admins customer info (which is presumably Cord)
    const customerGroup = await fetchCordRESTApi<ServerGroupData>(
      `groups/${customerID}`,
    );
    return {
      customerID,
      customerName: customerGroup?.name,
      supportEnabled: true,
    };
  }
  // Otherwise we can just return the default for the customer
  return getCustomerInfo();
}

async function addAdminIfNecessary(customerID: string) {
  const user = await getUser();
  if (user.isAdmin) {
    // Now lets make sure the admin is part of the group
    await fetchCordRESTApi(`groups/${customerID}/members`, 'POST', {
      add: [user.userID],
    });
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { customerID: string };
}) {
  const { customerID, customerName, supportEnabled } = await getData(
    params.customerID,
  );

  if (!customerID || !customerName || !supportEnabled) {
    // TODO: should be a 404 or a "join cord" page
    // if they have account but not support enabled show upgrade button
    return <h1>Oh no! Looks like you don&apos;t have a Cord account</h1>;
  }

  await addAdminIfNecessary(params.customerID);

  return (
    <div className={styles.container}>
      <Support customerID={customerID} customerName={customerName} />
      <div>{children}</div>
    </div>
  );
}
