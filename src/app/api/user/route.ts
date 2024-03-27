import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { NextRequest, NextResponse } from 'next/server';

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
