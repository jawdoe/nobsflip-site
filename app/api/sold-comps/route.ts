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

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getVerdict(profit: number, roi: number, soldCount: number): Verdict {
  if (soldCount === 0) return "SKIP";
  if (profit >= 10 && roi >= 80) return "BUY";
  if (profit >= 4 && roi >= 30) return "MAYBE";
  return "SKIP";
}

async function getEbayToken(clientId: string, clientSecret: string): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

const marketplaceMap: Record<string, { id: string; currency: string }> = {
  AU: { id: "EBAY_AU", currency: "AUD" },
  US: { id: "EBAY_US", currency: "USD" },
  GB: { id: "EBAY_GB", currency: "GBP" },
  CA: { id: "EBAY_CA", currency: "CAD" },
  NZ: { id: "EBAY_AU", currency: "AUD" },
  DE: { id: "EBAY_DE", currency: "EUR" },
  FR: { id: "EBAY_FR", currency: "EUR" },
  IT: { id: "EBAY_IT", currency: "EUR" },
  ES: { id: "EBAY_ES", currency: "EUR" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const barcode = searchParams.get("barcode")?.trim();
  const query = searchParams.get("query")?.trim();
  const keyword = searchParams.get("keyword")?.trim();
  const buyPrice = Number(searchParams.get("buy") ?? 0);
  const postage = Number(searchParams.get("postage") ?? 0);
  const locale = searchParams.get("locale") ?? "en-AU";
  const country = locale.split("-")[1]?.toUpperCase() ?? "AU";
  const marketplace = marketplaceMap[country] ?? { id: "EBAY_US", currency: "USD" };

  const searchTerm = barcode || query || keyword;
  if (!searchTerm) {
    return NextResponse.json({ error: "Missing barcode, query, or keyword" }, { status: 400 });
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET" }, { status: 500 });
  }

  try {
    const token = await getEbayToken(clientId, clientSecret);

    // Try Marketplace Insights API (sold items)
    const insightsUrl = `https://api.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search?q=${encodeURIComponent(searchTerm)}&marketplace_ids=${marketplace.id}&limit=20`;

    const insightsRes = await fetch(insightsUrl, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });

    let items: SoldItem[] = [];
    let dataSource = "EBAY_MARKETPLACE_INSIGHTS";

    if (insightsRes.ok) {
      const insightsData = await insightsRes.json();
      const rawItems = insightsData.itemSales ?? [];

      items = rawItems
        .map((item: any) => ({
          title: item.title ?? "Unknown item",
          price: Number(item.lastSoldPrice?.value ?? 0),
          currency: item.lastSoldPrice?.currency ?? marketplace.currency,
          url: item.itemWebUrl ?? "#",
          image: item.image?.imageUrl ?? null,
          condition: item.condition ?? null,
          soldDate: item.lastSoldDate ?? null,
        }))
        .filter((item: SoldItem) => item.price > 0);
    } else {
      // Fallback: Browse API (active listings — note this in warning)
      dataSource = "EBAY_BROWSE_ACTIVE";
      const browseUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(searchTerm)}&marketplace_ids=${marketplace.id}&filter=buyingOptions%3A%7BFIXED_PRICE%7D&limit=20`;

      const browseRes = await fetch(browseUrl, {
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      });

      if (!browseRes.ok) {
        const text = await browseRes.text();
        return NextResponse.json({ error: `eBay API error: ${browseRes.status} ${text.slice(0, 200)}` }, { status: 502 });
      }

      const browseData = await browseRes.json();
      const rawItems = browseData.itemSummaries ?? [];

      items = rawItems
        .map((item: any) => ({
          title: item.title ?? "Unknown item",
          price: Number(item.price?.value ?? 0),
          currency: item.price?.currency ?? marketplace.currency,
          url: item.itemWebUrl ?? "#",
          image: item.image?.imageUrl ?? null,
          condition: item.condition ?? null,
          soldDate: null,
        }))
        .filter((item: SoldItem) => item.price > 0);
    }

    const prices = items.map((i) => i.price);
    const averagePrice = prices.length ? prices.reduce((s, p) => s + p, 0) / prices.length : 0;
    const medianPrice = median(prices);
    const estimatedSalePrice = medianPrice || averagePrice;
    const ebayFeeEstimate = estimatedSalePrice * 0.14;
    const estimatedProfit = estimatedSalePrice - buyPrice - postage - ebayFeeEstimate;
    const roi = buyPrice > 0 ? (estimatedProfit / buyPrice) * 100 : 0;
    const verdict = getVerdict(estimatedProfit, roi, items.length);

    return NextResponse.json({
      search: searchTerm,
      searchType: barcode ? "BARCODE" : "QUERY",
      dataSource,
      warning: dataSource === "EBAY_BROWSE_ACTIVE"
        ? "Showing active listing prices (not sold). Sold data unavailable via Marketplace Insights for this region."
        : "",
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
