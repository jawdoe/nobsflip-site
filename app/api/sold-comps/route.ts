import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Verdict = "BUY" | "MAYBE" | "SKIP";

type SoldItem = {
  title: string;
  price: number;
  currency: string;
  url: string;
  image: string | null;
  condition: string | null;
  soldDate: string | null;
};

function cleanNumber(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(2));
}

function getText(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return String(value);
}

function toNumber(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
}

function median(values: number[]) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function getVerdict(profit: number, roi: number, soldCount: number): Verdict {
  if (soldCount < 3) return "SKIP";
  if (profit >= 15 && roi >= 100 && soldCount >= 5) return "BUY";
  if (profit >= 8 && roi >= 50) return "MAYBE";
  return "SKIP";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const barcode = searchParams.get("barcode")?.trim();
  const query = searchParams.get("query")?.trim();
  const keyword = searchParams.get("keyword")?.trim();

  const buyPrice = Number(searchParams.get("buy") ?? 0);
  const postage = Number(searchParams.get("postage") ?? 0);

  const locale = searchParams.get("locale") ?? "en-AU";
  const country = locale.split("-")[1]?.toUpperCase() ?? "AU";
  const marketplaceMap: Record<string, { globalId: string; locatedIn: string }> = {
    AU: { globalId: "EBAY-AU", locatedIn: "AU" },
    US: { globalId: "EBAY-US", locatedIn: "US" },
    GB: { globalId: "EBAY-GB", locatedIn: "GB" },
    CA: { globalId: "EBAY-ENCA", locatedIn: "CA" },
    NZ: { globalId: "EBAY-AU", locatedIn: "AU" },
    DE: { globalId: "EBAY-DE", locatedIn: "DE" },
    FR: { globalId: "EBAY-FR", locatedIn: "FR" },
    IT: { globalId: "EBAY-IT", locatedIn: "IT" },
    ES: { globalId: "EBAY-ES", locatedIn: "ES" },
  };
  const marketplace = marketplaceMap[country] ?? { globalId: "EBAY-US", locatedIn: "US" };

  const searchTerm = barcode || query || keyword;

  if (!searchTerm) {
    return NextResponse.json(
      { error: "Missing barcode, query, or keyword" },
      { status: 400 }
    );
  }

  const appId = process.env.EBAY_CLIENT_ID;

  if (!appId) {
    return NextResponse.json(
      { error: "Missing EBAY_CLIENT_ID env var" },
      { status: 500 }
    );
  }

  const ebayUrl = new URL(
    "https://svcs.ebay.com/services/search/FindingService/v1"
  );

  ebayUrl.searchParams.set("OPERATION-NAME", "findCompletedItems");
  ebayUrl.searchParams.set("SERVICE-VERSION", "1.13.0");
  ebayUrl.searchParams.set("SECURITY-APPNAME", appId);
  ebayUrl.searchParams.set("RESPONSE-DATA-FORMAT", "JSON");
  ebayUrl.searchParams.set("REST-PAYLOAD", "");
  ebayUrl.searchParams.set("GLOBAL-ID", marketplace.globalId);
  ebayUrl.searchParams.set("keywords", searchTerm);
  ebayUrl.searchParams.set("paginationInput.entriesPerPage", "20");

  ebayUrl.searchParams.set("itemFilter(0).name", "SoldItemsOnly");
  ebayUrl.searchParams.set("itemFilter(0).value", "true");

  ebayUrl.searchParams.set("itemFilter(1).name", "LocatedIn");
  ebayUrl.searchParams.set("itemFilter(1).value", marketplace.locatedIn);

  try {
    const ebayRes = await fetch(ebayUrl.toString(), {
      cache: "no-store",
    });

    const contentType = ebayRes.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) {
      const text = await ebayRes.text();
      return NextResponse.json(
        { error: "eBay returned non-JSON response", details: text.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = await ebayRes.json();

    const ack = data?.findCompletedItemsResponse?.[0]?.ack?.[0];

    if (!ebayRes.ok || ack === "Failure") {
      return NextResponse.json(
        {
          error: "eBay request failed",
          details: data,
        },
        { status: ebayRes.status || 500 }
      );
    }

    const response = data?.findCompletedItemsResponse?.[0];
    const searchResult = response?.searchResult?.[0];
    const rawItems = searchResult?.item ?? [];

    const items: SoldItem[] = rawItems
      .map((item: any) => {
        const sellingStatus = item.sellingStatus?.[0];
        const currentPrice = sellingStatus?.currentPrice?.[0];

        return {
          title: getText(item.title) ?? "Unknown item",
          price: toNumber(currentPrice?.__value__),
          currency: currentPrice?.["@currencyId"] ?? "AUD",
          url: getText(item.viewItemURL) ?? "#",
          image: getText(item.galleryURL),
          condition: getText(item.condition?.[0]?.conditionDisplayName),
          soldDate: getText(item.listingInfo?.[0]?.endTime),
        };
      })
      .filter((item: SoldItem) => item.title && item.price > 0 && item.url);

    const prices = items.map((item) => item.price);

    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : 0;

    const medianPrice = median(prices);
    const estimatedSalePrice = medianPrice || averagePrice;
    const ebayFeeEstimate = estimatedSalePrice * 0.14;

    const estimatedProfit =
      estimatedSalePrice - buyPrice - postage - ebayFeeEstimate;

    const roi = buyPrice > 0 ? (estimatedProfit / buyPrice) * 100 : 0;

    const verdict = getVerdict(estimatedProfit, roi, items.length);

    return NextResponse.json({
      search: searchTerm,
      searchType: barcode ? "BARCODE" : "QUERY",
      dataSource: "EBAY_FIND_COMPLETED_ITEMS",
      warning:
        "Free testing route using eBay Finding API. This may fail if your eBay key does not have completed-items access.",
      buyPrice: cleanNumber(buyPrice),
      postage: cleanNumber(postage),
      resultCount: items.length,
      averagePrice: cleanNumber(averagePrice),
      medianPrice: cleanNumber(medianPrice),
      estimatedSalePrice: cleanNumber(estimatedSalePrice),
      ebayFeeEstimate: cleanNumber(ebayFeeEstimate),
      estimatedProfit: cleanNumber(estimatedProfit),
      roi: cleanNumber(roi),
      verdict,
      items,
    });
  } catch (error) {
    console.error("Sold comps API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch sold comps",
      },
      { status: 500 }
    );
  }
}