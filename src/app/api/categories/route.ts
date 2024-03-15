import { fetchCordRESTApi } from "@/app/fetchCordRESTApi";
import { ServerUserData } from "@cord-sdk/types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const queryParams = request.nextUrl.searchParams;
  const permissions = queryParams.get("permissions");
  // TODO use permissions to check whether to get all categories
  // or group specific ones
  try {
    // TODO: grab and use logged in user token:
    // check their groups, and return all their accessible categories
    const allCategories = (
      await fetchCordRESTApi<ServerUserData>("users/all_categories_holder")
    ).metadata as Record<string, string>;

    return NextResponse.json({ data: Object.keys(allCategories) });
  } catch (error) {
    return NextResponse.error();
  }
}
