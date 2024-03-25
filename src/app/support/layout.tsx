import { getCustomerInfo } from '../helpers/customerInfo';
import Support from './Support';
import styles from './support.module.css';


export default async function Layout({ children }: { children: React.ReactNode }) {

  const { customerID, customerName, supportEnabled } = await getCustomerInfo();

  if (!customerID || !customerName  || !supportEnabled ) {
    // TODO: should be a 404 or a "join cord" page 
    // if they have account but not support enabled show upgrade button
    return <h1>Oh no! Looks like you don&apos;t have a Cord account</h1> 
  }

  return (
    <div className={styles.container}>
      <Support customerID={customerID} customerName={customerName} />
      <div>{children}</div>
    </div>
  );
}
