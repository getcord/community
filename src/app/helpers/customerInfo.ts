import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { getUser } from '@/app/helpers/user';

export type CustomerInfo = {
  customerID?: string;
  customerName?: string;
  supportEnabled?: boolean;
};

export async function getCustomerInfo(): Promise<CustomerInfo> {
  const { userID } = await getUser();
  if (!userID) {
    return {};
  }
  return getCustomerInfoForUserId(userID);
}

export async function getCustomerInfoForUserId(
  userID: string,
): Promise<CustomerInfo> {
  return fetchCordRESTApi<CustomerInfo>(`community/users/${userID}`);
}
