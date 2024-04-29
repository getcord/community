import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { NextRequest, NextResponse } from 'next/server';
import type { ServerGetUser } from '@cord-sdk/types';
import { getUser } from '@/app/helpers/user';

export async function PUT(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const userID = params.get('userID');
  const body = await request.json();

  const response = await fetchCordRESTApi(`users/${userID}`, 'PUT', {
    name: body.name,
  });

  return new NextResponse(
    JSON.stringify({ success: !response ? false : true }),
  );
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const userID = params.get('userID');

  const { isAdmin } = await getUser();
  if (isAdmin) {
    const response = await fetchCordRESTApi<ServerGetUser>(
      `users/${userID}`,
      'GET',
    );
    if (response) {
      return new NextResponse(JSON.stringify({ email: response.email }));
    }
  }
}
