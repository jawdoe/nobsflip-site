import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const appId = process.env.EBAY_CLIENT_ID ?? "";

  if (!appId) {
    return NextResponse.json({ error: "EBAY_CLIENT_ID is empty" });
  }

  const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.13.0&SECURITY-APPNAME=${encodeURIComponent(appId)}&RESPONSE-DATA-FORMAT=JSON&GLOBAL-ID=EBAY-AU&keywords=lego&paginationInput.entriesPerPage=1&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true`;

  const res = await fetch(url, { cache: "no-store" });
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();

  return NextResponse.json({
    appIdLength: appId.length,
    appIdStart: appId.slice(0, 12),
    appIdEnd: appId.slice(-6),
    httpStatus: res.status,
    contentType,
    bodyPreview: body.slice(0, 400),
  });
}
