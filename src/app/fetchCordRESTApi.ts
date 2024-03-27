import { getServerAuthToken } from '@cord-sdk/server';
import { CORD_APP_ID, CORD_SECRET, CORD_API_URL } from '../consts';

export async function fetchCordRESTApi<T>(
  endpoint: string,
  method: 'GET' | 'PUT' | 'POST' | 'DELETE' = 'GET',
  data?: object,
): Promise<T | undefined> {
  const serverAuthToken = getServerAuthToken(CORD_APP_ID, CORD_SECRET);

  const response = await fetch(`${CORD_API_URL}${endpoint}`, {
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      Authorization: `Bearer ${serverAuthToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    return response.json();
  } else {
    return undefined;
  }
}

export function buildQueryParams(
  args: {
    field: string;
    value: string | number | undefined;
  }[],
) {
  const params = new URLSearchParams();
  args.forEach(({ field, value }) => {
    if (value) {
      params.set(field, value.toString());
    }
  });
  return '?' + params.toString();
}
