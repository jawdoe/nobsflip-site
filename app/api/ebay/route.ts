import { NextRequest, NextResponse } from "next/server";

type Verdict = "BUY" | "MAYBE" | "SKIP";

type EbayItem = {
  title?: string;
  itemWebUrl?: string;
  price?: {
    value?: string;
    currency?: string;
  };
  shippingOptions?: {
    shippingCost?: {
      value?: string;
    };
  }[];
  condition?: string;
};

function median(values: number[]) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function cleanNumber(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(2));
}

function getVerdict(profit: number, roi: number, listingCount: number): Verdict {
  if (listingCount < 3) return "SKIP";
  if (profit >= 15 && roi >= 100 && listingCount >= 5) return "BUY";
  if (profit >= 8 && roi >= 50) return "MAYBE";
  return "SKIP";
}

async function getEbayToken() {
  const clientId = process.env.EBAY_CLIENT_ID?.trim();
  const clientSecret = process.env.EBAY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`eBay token failed: ${await response.text()}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("eBay token response did not include an access token");
  }

  return data.access_token as string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("query")?.trim();
    const barcode = searchParams.get("barcode")?.trim();

    const buyPrice = Number(searchParams.get("buy") ?? 0);
    const postage = Number(searchParams.get("postage") ?? 0);

    if (!query && !barcode) {
      return NextResponse.json(
        { error: "Use ?query= or ?barcode=" },
        { status: 400 }
      );
    }

    const token = await getEbayToken();

    const ebayParams = new URLSearchParams({
      limit: "30",
      filter: "buyingOptions:{FIXED_PRICE}",
    });

    if (barcode) {
      ebayParams.set("gtin", barcode);
    } else if (query) {
      ebayParams.set("q", query);
    }

    const ebayUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?${ebayParams.toString()}`;

    const ebayResponse = await fetch(ebayUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_AU",
      },
      cache: "no-store",
    });

    if (!ebayResponse.ok) {
      throw new Error(`eBay search failed: ${await ebayResponse.text()}`);
    }

    const ebayData = await ebayResponse.json();
    const items: EbayItem[] = ebayData.itemSummaries ?? [];

    const prices = items
      .map((item) => Number(item.price?.value ?? 0))
      .filter((price) => Number.isFinite(price) && price > 0);

    const averagePrice =
      prices.length > 0
        ? prices.reduce((total, price) => total + price, 0) / prices.length
        : 0;

    const medianPrice = median(prices);

    const estimatedSalePrice = medianPrice || averagePrice;

    const ebayFeeEstimate = estimatedSalePrice * 0.14;

    const estimatedProfit =
      estimatedSalePrice - buyPrice - postage - ebayFeeEstimate;

    const roi = buyPrice > 0 ? (estimatedProfit / buyPrice) * 100 : 0;

    const verdict = getVerdict(estimatedProfit, roi, items.length);

    return NextResponse.json({
      search: barcode ?? query,
      dataSource: "ACTIVE_EBAY_LISTINGS",
      warning:
        "This estimate is based on active eBay listings, not sold comps. Sold-history access requires eBay Marketplace Insights access.",
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
      items: items.slice(0, 10).map((item) => ({
        title: item.title ?? "Untitled listing",
        price: item.price?.value ?? "0",
        currency: item.price?.currency ?? "AUD",
        condition: item.condition ?? "Unknown",
        url: item.itemWebUrl ?? "#",
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown eBay API error",
      },
      { status: 500 }
    );
  }
}