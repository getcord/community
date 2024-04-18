'use server';

import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';

export async function deleteThread(threadID: string) {
  await fetchCordRESTApi(`threads/${threadID}`, 'DELETE');
}

export async function deleteMessage(threadID: string, messageID: string) {
  await fetchCordRESTApi(`threads/${threadID}/messages/${messageID}`, 'DELETE');
}
