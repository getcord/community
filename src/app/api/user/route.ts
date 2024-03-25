import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const userID = params.get('userID');
    const body = await request.json();

    await fetchCordRESTApi(`users/${userID}`, 'PUT', {
      name: body.name,
    });

    return new NextResponse(JSON.stringify({ success: true }));
  } catch (error) {
    return new NextResponse(JSON.stringify({ success: false, error }));
  }
}
