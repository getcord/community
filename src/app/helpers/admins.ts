import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { ServerListGroupMembers } from '@cord-sdk/types';

export async function getAdminMembersSet() {
  const response = await fetchCordRESTApi<ServerListGroupMembers>(
    `groups/admins/members`,
  );

  const memberSet = new Set<string>();
  if (response) {
    response.users.forEach((member) => memberSet.add(member.id.toString()));
  }
  return memberSet;
}
