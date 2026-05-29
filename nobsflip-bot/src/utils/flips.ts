import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { supabase } from '../lib/supabase';

export type FlipStatus = 'active' | 'sold';

export type FlipItem = {
  id: string;
  title: string;
  buy: number;
  sell: number;
  notes: string;
  photoUrl: string | null;
  addedBy: string;
  createdAt: string;
  status: FlipStatus;
  soldAt: string | null;
  actualSell: number | null;
};

export type EbayDraftInput = {
  flipId: string;
  title: string;
  description: string | null;
  conditionName: string;
  categoryName: string | null;
  buyNowPrice: number;
  freePostage: boolean;
  postageCost: number;
  allowOffers: boolean;
  autoAcceptPrice: number | null;
  autoDeclinePrice: number | null;
  imageUrls: string[];
};

export type EbayDraftRow = {
  id: string;
  flip_id: string;
  ebay_sku: string;
  ebay_status: string;
  title: string;
  description: string | null;
  condition_name: string | null;
  category_name: string | null;
  buy_now_price: number;
  free_postage: boolean | null;
  postage_cost: number | null;
  allow_offers: boolean | null;
  auto_accept_price: number | null;
  auto_decline_price: number | null;
};

type FlipPostRow = {
  id: string;
  title: string | null;
  buy_price: number | null;
  sell_price: number | null;
  description: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string | null;
  status: FlipStatus | null;
  sold_at: string | null;
  actual_sell: number | null;
};

const TABLE_NAME = 'flip_posts';
const EBAY_LISTINGS_TABLE = 'ebay_listings';
const EBAY_IMAGES_TABLE = 'ebay_listing_images';

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'flips.json');

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
}

function mapRowToFlip(row: FlipPostRow): FlipItem {
  return {
    id: String(row.id),
    title: String(row.title ?? 'Untitled Flip'),
    buy: Number(row.buy_price ?? 0),
    sell: Number(row.sell_price ?? 0),
    notes: String(row.description ?? ''),
    photoUrl: row.image_url ?? null,
    addedBy: String(row.created_by ?? 'jawdoe'),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    status: row.status === 'sold' ? 'sold' : 'active',
    soldAt: row.sold_at ?? null,
    actualSell: row.actual_sell ?? null,
  };
}

function mapFlipToRow(flip: FlipItem) {
  return {
    id: flip.id,
    title: flip.title,
    buy_price: flip.buy,
    sell_price: flip.sell,
    description: flip.notes,
    image_url: flip.photoUrl,
    created_by: flip.addedBy,
    created_at: flip.createdAt,
    status: flip.status,
    sold_at: flip.soldAt,
    actual_sell: flip.actualSell,
  };
}

function mapUpdatesToRow(updates: Partial<FlipItem>) {
  const rowUpdates: Partial<FlipPostRow> = {};

  if (updates.id !== undefined) rowUpdates.id = updates.id;
  if (updates.title !== undefined) rowUpdates.title = updates.title;
  if (updates.buy !== undefined) rowUpdates.buy_price = updates.buy;
  if (updates.sell !== undefined) rowUpdates.sell_price = updates.sell;
  if (updates.notes !== undefined) rowUpdates.description = updates.notes;
  if (updates.photoUrl !== undefined) rowUpdates.image_url = updates.photoUrl;
  if (updates.addedBy !== undefined) rowUpdates.created_by = updates.addedBy;
  if (updates.createdAt !== undefined) rowUpdates.created_at = updates.createdAt;
  if (updates.status !== undefined) rowUpdates.status = updates.status;
  if (updates.soldAt !== undefined) rowUpdates.sold_at = updates.soldAt;
  if (updates.actualSell !== undefined) rowUpdates.actual_sell = updates.actualSell;

  return rowUpdates;
}

function makeEbaySku(flipId: string): string {
  const cleanId = flipId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `NBS-${cleanId}`;
}

function normaliseImageUrls(imageUrls: string[]): string[] {
  return imageUrls
    .filter(Boolean)
    .slice(0, 4);
}

// --------------------
// EXISTING JSON HELPERS
// keep these for now so other commands do not break
// --------------------

export function readFlips(): FlipItem[] {
  ensureStore();

  const raw = fs.readFileSync(filePath, 'utf8');

  try {
    const parsed = JSON.parse(raw) as FlipItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFlips(flips: FlipItem[]): void {
  ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(flips, null, 2), 'utf8');
}

// --------------------
// SHARED FLIP CREATOR
// --------------------

export function createFlip(input: {
  title: string;
  buy: number;
  sell: number;
  notes: string;
  photoUrl: string | null;
  addedBy: string;
}): FlipItem {
  return {
    id: crypto.randomUUID().slice(0, 8),
    title: input.title,
    buy: input.buy,
    sell: input.sell,
    notes: input.notes,
    photoUrl: input.photoUrl,
    addedBy: input.addedBy,
    createdAt: new Date().toISOString(),
    status: 'active',
    soldAt: null,
    actualSell: null,
  };
}

// --------------------
// SUPABASE HELPERS
// --------------------

export async function insertFlip(flip: FlipItem): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).insert(mapFlipToRow(flip));

  if (error) {
    throw new Error(`Failed to insert flip: ${error.message}`);
  }
}

export async function insertEbayDraft(input: EbayDraftInput): Promise<EbayDraftRow> {
  const imageUrls = normaliseImageUrls(input.imageUrls);
  const ebaySku = makeEbaySku(input.flipId);

  const draftReady = Boolean(
    input.title &&
      input.conditionName &&
      input.buyNowPrice > 0 &&
      imageUrls.length > 0
  );

  const ebayListingInsert = {
    flip_id: input.flipId,
    ebay_sku: ebaySku,

    ebay_status: draftReady ? 'ready' : 'draft',
    draft_ready: draftReady,

    title: input.title,
    description: input.description,
    condition_name: input.conditionName,

    category_name: input.categoryName,

    buy_now_price: input.buyNowPrice,
    quantity: 1,
    currency: 'AUD',
    marketplace_id: 'EBAY_AU',

    allow_offers: input.allowOffers,
    auto_accept_price: input.autoAcceptPrice,
    auto_decline_price: input.autoDeclinePrice,

    free_postage: input.freePostage,
    postage_cost: input.freePostage ? 0 : input.postageCost,

    listing_format: 'FIXED_PRICE',
    duration: 'GTC',
    ebay_enabled: true,
  };

  const { data: ebayListing, error: ebayListingError } = await supabase
    .from(EBAY_LISTINGS_TABLE)
    .insert(ebayListingInsert)
    .select()
    .single();

  if (ebayListingError) {
    throw new Error(`Failed to insert eBay draft: ${ebayListingError.message}`);
  }

  const typedEbayListing = ebayListing as EbayDraftRow;

  if (imageUrls.length > 0) {
    const imageRows = imageUrls.map((imageUrl, index) => ({
      ebay_listing_id: typedEbayListing.id,
      image_url: imageUrl,
      sort_order: index,
    }));

    const { error: imageError } = await supabase
      .from(EBAY_IMAGES_TABLE)
      .insert(imageRows);

    if (imageError) {
      throw new Error(`Failed to insert eBay images: ${imageError.message}`);
    }
  }

  return typedEbayListing;
}

export async function getAllFlips(): Promise<FlipItem[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch flips: ${error.message}`);
  }

  return ((data ?? []) as FlipPostRow[]).map(mapRowToFlip);
}

export async function getFlipById(id: string): Promise<FlipItem | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch flip: ${error.message}`);
  }

  return data ? mapRowToFlip(data as FlipPostRow) : null;
}

export async function updateFlipById(
  id: string,
  updates: Partial<FlipItem>
): Promise<FlipItem | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(mapUpdatesToRow(updates))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update flip: ${error.message}`);
  }

  return data ? mapRowToFlip(data as FlipPostRow) : null;
}

export async function deleteFlipById(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete flip: ${error.message}`);
  }
}