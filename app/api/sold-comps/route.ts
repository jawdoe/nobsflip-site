import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Verdict = "BUY" | "MAYBE" | "SKIP";
type SoldItem = { title: string; price: number; currency: string; url: string; image: string | null; condition: string | null; soldDate: string | null; };

function cleanNumber(value: number) { if (!Number.isFinite(value)) return 0; return Number(value.toFixed(2)); }
function getText(value: unknown): string | null { if (!value) return null; if (Array.isArray(value)) return value[0] ?? null; return String(value); }
function toNumber(value: unknown): number { const raw = Array.isArray(value) ? value[0] : value; const num = Number(raw); return Number.isFinite(num) ? num : 0; }
function median(values: number[]) { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; }
function getVerdict(profit: number, roi: number, soldCount: number): Verdict { if (soldCount === 0) return "SKIP"; if (profit >= 10 && roi >= 80) return "BUY"; if (profit >= 4 && roi >= 30) return "MAYBE"; return "SKIP"; }
function looksLikeBarcode(s: string) { return /^\d{8,14}$/.test(s.trim()); }

const ebayFeeRate: Record<string, number> = { AU: 0.134, US: 0.1325, GB: 0.128, CA: 0.1325, NZ: 0.134, DE: 0.125, FR: 0.125, IT: 0.125, ES: 0.125 };

const marketplaceMap: Record<string, { globalId: string; locatedIn: string; currency: string; browseId: string }> = {
  AU: { globalId: "EBAY-AU", locatedIn: "AU", currency: "AUD", browseId: "EBAY_AU" },
  US: { globalId: "EBAY-US", locatedIn: "US", currency: "USD", browseId: "EBAY_US" },
  GB: { globalId: "EBAY-GB", locatedIn: "GB", currency: "GBP", browseId: "EBAY_GB" },
  CA: { globalId: "EBAY-ENCA", locatedIn: "CA", currency: "CAD", browseId: "EBAY_CA" },
  NZ: { globalId: "EBAY-AU", locatedIn: "AU", currency: "AUD", browseId: "EBAY_AU" },
  DE: { globalId: "EBAY-DE", locatedIn: "DE", currency: "EUR", browseId: "EBAY_DE" },
  FR: { globalId: "EBAY-FR", locatedIn: "FR", currency: "EUR", browseId: "EBAY_FR" },
  IT: { globalId: "EBAY-IT", locatedIn: "IT", currency: "EUR", browseId: "EBAY_IT" },
  ES: { globalId: "EBAY-ES", locatedIn: "ES", currency: "EUR", browseId: "EBAY_ES" },
};

async function resolveBarcode(barcode: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`, { headers: { "Accept": "application/json" }, cache: "no-store" });
    if (res.ok) { const data = await res.json(); const title = data?.items?.[0]?.title; if (title && typeof title === "string" && title.trim().length > 2) return title.trim(); }
  } catch {}
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`, { cache: "no-store" });
    if (res.ok) { const data = await res.json(); const name = data?.product?.product_name; const brand = data?.product?.brands; if (name && typeof name === "string" && name.trim().length > 2) return brand ? `${brand} ${name}`.trim() : name.trim(); }
  } catch {}
  return null;
}

async function getEbayToken(clientId: string, clientSecret: string): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", { method: "POST", headers: { "Authorization": `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope", cache: "no-store" });
  if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

async function fetchFindingApi(appId: string, searchTerm: string, marketplace: typeof marketplaceMap[string]): Promise<SoldItem[] | null> {
  const qs = ["OPERATION-NAME=findCompletedItems","SERVICE-VERSION=1.13.0",`SECURITY-APPNAME=${encodeURIComponent(appId)}`,"RESPONSE-DATA-FORMAT=JSON",`GLOBAL-ID=${marketplace.globalId}`,`keywords=${encodeURIComponent(searchTerm)}`,"paginationInput.entriesPerPage=20","itemFilter(0).name=SoldItemsOnly","itemFilter(0).value=true","itemFilter(1).name=LocatedIn",`itemFilter(1).value=${marketplace.locatedIn}`].join("&");
  const res = await fetch(`https://svcs.ebay.com/services/search/FindingService/v1?${qs}`, { cache: "no-store" });
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) { console.error("[FindingAPI] Non-JSON response, status:", res.status); return null; }
  const data = await res.json();
  const ack = data?.findCompletedItemsResponse?.[0]?.ack?.[0];
  if (ack === "Failure") { const errMsg = data?.findCompletedItemsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.message?.[0]; console.error("[FindingAPI] Failure:", errMsg ?? JSON.stringify(data).slice(0, 300)); return null; }
  const rawItems = data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item ?? [];
  return rawItems.map((item: any) => { const p = item.sellingStatus?.[0]?.currentPrice?.[0]; return { title: getText(item.title) ?? "Unknown", price: toNumber(p?.__value__), currency: p?.["@currencyId"] ?? marketplace.currency, url: getText(item.viewItemURL) ?? "#", image: getText(item.galleryURL), condition: getText(item.condition?.[0]?.conditionDisplayName), soldDate: getText(item.listingInfo?.[0]?.endTime) }; }).filter((i: SoldItem) => i.price > 0);
}

async function fetchBrowseApi(token: string, searchTerm: string, marketplace: typeof marketplaceMap[string]): Promise<SoldItem[]> {
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(searchTerm)}&marketplace_ids=${marketplace.browseId}&filter=buyingOptions%3A%7BFIXED_PRICE%7D&limit=20`;
  const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.itemSummaries ?? []).map((item: any) => ({ title: item.title ?? "Unknown", price: Number(item.price?.value ?? 0), currency: item.price?.currency ?? marketplace.currency, url: item.itemWebUrl ?? "#", image: item.image?.imageUrl ?? null, condition: item.condition ?? null, soldDate: null })).filter((i: SoldItem) => i.price > 0).sort((a: SoldItem, b: SoldItem) => a.price - b.price);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawBarcode = searchParams.get("barcode")?.trim();
  const query = searchParams.get("query")?.trim();
  const keyword = searchParams.get("keyword")?.trim();
  const buyPrice = Number(searchParams.get("buy") ?? 0);
  const postage = Number(searchParams.get("postage") ?? 0);
  const locale = searchParams.get("locale") ?? "en-AU";
  const country = locale.split("-")[1]?.toUpperCase() ?? "AU";
  const marketplace = marketplaceMap[country] ?? marketplaceMap["AU"];
  const rawSearchTerm = rawBarcode || query || keyword;
  if (!rawSearchTerm) return NextResponse.json({ error: "Missing barcode, query, or keyword" }, { status: 400 });

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId) return NextResponse.json({ error: "Missing EBAY_CLIENT_ID" }, { status: 500 });

  let searchTerm = rawSearchTerm;
  let barcodeResolved = false;
  if (rawBarcode && looksLikeBarcode(rawBarcode)) {
    const resolvedName = await resolveBarcode(rawBarcode);
    if (resolvedName) { searchTerm = resolvedName; barcodeResolved = true; }
  }

  try {
    let items = await fetchFindingApi(clientId, searchTerm, marketplace);
    let dataSource = "EBAY_FINDING_SOLD";
    let warning = "";
    let findingApiStatus = items === null ? "FAILED" : `OK - ${items.length} results`;

    if (barcodeResolved && items !== null && items.length === 0) {
      const fallback = await fetchFindingApi(clientId, rawBarcode!, marketplace);
      if (fallback && fallback.length > 0) { items = fallback; searchTerm = rawBarcode!; barcodeResolved = false; findingApiStatus = `OK via raw barcode - ${items.length} results`; }
    }

    if (!items) {
      if (!clientSecret) return NextResponse.json({ error: "eBay sold data unavailable" }, { status: 502 });
      const token = await getEbayToken(clientId, clientSecret);
      items = await fetchBrowseApi(token, searchTerm, marketplace);
      dataSource = "EBAY_BROWSE_ACTIVE";
      warning = "Showing active listing prices, not what items actually sold for.";
      findingApiStatus = "FAILED - using Browse API fallback";
    }

    const prices = items.map((i) => i.price);
    const averagePrice = prices.length ? prices.reduce((s, p) => s + p, 0) / prices.length : 0;
    const medianPrice = median(prices);
    const estimatedSalePrice = medianPrice || averagePrice;
    const feeRate = ebayFeeRate[country] ?? 0.135;
    const ebayFeeEstimate = estimatedSalePrice * feeRate;
    const estimatedProfit = estimatedSalePrice - buyPrice - postage - ebayFeeEstimate;
    const roi = buyPrice > 0 ? (estimatedProfit / buyPrice) * 100 : 0;
    const verdict = getVerdict(estimatedProfit, roi, items.length);

    return NextResponse.json({
      search: searchTerm,
      resolvedFrom: barcodeResolved ? rawBarcode : null,
      searchType: rawBarcode ? "BARCODE" : "QUERY",
      dataSource, warning,
      buyPrice: cleanNumber(buyPrice),
      postage: cleanNumber(postage),
      feeRate: cleanNumber(feeRate),
      resultCount: items.length,
      averagePrice: cleanNumber(averagePrice),
      medianPrice: cleanNumber(medianPrice),
      estimatedSalePrice: cleanNumber(estimatedSalePrice),
      ebayFeeEstimate: cleanNumber(ebayFeeEstimate),
      estimatedProfit: cleanNumber(estimatedProfit),
      roi: cleanNumber(roi),
      verdict, items,
      _debug: { findingApiStatus, country, marketplace: marketplace.globalId },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch" }, { status: 500 });
  }
}
