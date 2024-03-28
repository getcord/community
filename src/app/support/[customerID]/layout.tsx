import { getUser } from '@/app/helpers/user';
import { getCustomerInfo } from '@/app/helpers/customerInfo';
import Support from './Support';
import styles from './support.module.css';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { customerID: string };
}) {
  const { customerID, customerName, supportEnabled } = await getCustomerInfo();
  const { isAdmin } = await getUser();

  if (!customerID || !customerName || (!supportEnabled && !isAdmin)) {
    // TODO: should be a 404 or a "join cord" page
    // if they have account but not support enabled show upgrade button
    return <h1>Oh no! Looks like you don&apos;t have a Cord account</h1>;
  }

  return (
    <div className={styles.container}>
      <Support customerID={params.customerID} customerName={customerName} />
      <div>{children}</div>
    </div>
  );
}
