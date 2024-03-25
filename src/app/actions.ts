'use server';

import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { getUser } from '@/app/helpers/user';

export async function updateUserName(formData: FormData) {
  const rawFormData = {
    userName: formData.get('username'),
  };

  const { userID } = await getUser();

  if (!userID) {
    return;
  }
  try {
    await fetchCordRESTApi(`users/${userID}`, 'PUT', {
      name: rawFormData.userName,
    });
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}
