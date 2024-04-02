import { getCustomerInfo } from '@/app/helpers/customerInfo';
import { redirect } from 'next/navigation';

export default async function Page() {
  const customerInfo = await getCustomerInfo();
  if (customerInfo.customerID) {
    redirect(`/support/${customerInfo.customerID}`);
  }
  return <h1>Oh no! Looks like you don&apos;t have a Cord account</h1>;
}
