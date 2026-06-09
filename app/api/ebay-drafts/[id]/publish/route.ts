import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEbayInventoryItem } from "@/app/utils/ebay-inventory";
import { createEbayOffer, publishEbayOffer } from "@/app/utils/ebay-offer";
import { createDefaultEbayLocation } from "@/app/utils/ebay-location";

function makeSku(id: string) {
  return `nobs-${id.slice(0, 8)}`;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const { data: draft, error: loadError } = await supabase
    .from("ebay_drafts")
    .select("*")
    .eq("id", id)
    .single();

  if (loadError || !draft) {
    return NextResponse.json(
      { error: loadError?.message ?? "Draft not found." },
      { status: 404 }
    );
  }

  const sku = draft.ebay_inventory_item_id || makeSku(draft.id);
  const title = draft.generated_title || draft.title;

  const description =
    draft.generated_description ||
    draft.description ||
    draft.notes ||
    draft.title;

  const price = Number(draft.final_price || draft.suggested_price);
  const categoryId = draft.category_id || process.env.EBAY_DEFAULT_CATEGORY_ID;

  const itemSpecifics =
    draft.item_specifics && typeof draft.item_specifics === "object"
      ? draft.item_specifics
      : {};

  if (!price || price <= 0) {
    return NextResponse.json(
      { error: "Final price is required before publishing." },
      { status: 400 }
    );
  }

  if (!categoryId) {
    return NextResponse.json(
      { error: "eBay category ID is required before publishing." },
      { status: 400 }
    );
  }

  if (!draft.photo_urls || draft.photo_urls.length === 0) {
    return NextResponse.json(
      { error: "At least one photo is required before publishing to eBay." },
      { status: 400 }
    );
  }

  try {
    await supabase
      .from("ebay_drafts")
      .update({
        status: "publishing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    await createEbayInventoryItem({
      sku,
      title,
      description,
      condition: draft.condition || "Used",
      imageUrls: draft.photo_urls,
      quantity: 1,
      aspects: itemSpecifics,
    });

    const locationKey = await createDefaultEbayLocation();
    console.log("USING EBAY LOCATION KEY:", locationKey);

    let offerId = draft.ebay_offer_id as string | null;

    if (!offerId) {
      offerId = await createEbayOffer({
        sku,
        price,
        quantity: 1,
        categoryId,
        description,
      });

      await supabase
        .from("ebay_drafts")
        .update({
          status: "offer_created",
          ebay_inventory_item_id: sku,
          ebay_offer_id: offerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }

    const listingId = await publishEbayOffer(offerId);

    await supabase
      .from("ebay_drafts")
      .update({
        status: "published",
        ebay_inventory_item_id: sku,
        ebay_offer_id: offerId,
        ebay_listing_id: listingId,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      status: "published",
      sku,
      offerId,
      listingId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown eBay publish error.";

    await supabase
      .from("ebay_drafts")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}