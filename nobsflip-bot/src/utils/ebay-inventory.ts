import { getValidEbayAccessToken } from './ebay-token';

const EBAY_INVENTORY_BASE_URL = 'https://api.ebay.com/sell/inventory/v1';

export type CreateInventoryItemInput = {
  sku: string;
  title: string;
  description: string;
  condition: string;
  imageUrls: string[];
  quantity: number;
};

function mapCondition(condition: string): string {
  const value = condition.toLowerCase();

  if (value.includes('new')) return 'NEW';
  if (value.includes('parts')) return 'FOR_PARTS_OR_NOT_WORKING';

  return 'USED_EXCELLENT';
}

export async function createEbayInventoryItem(
  input: CreateInventoryItemInput
): Promise<void> {
  const accessToken = await getValidEbayAccessToken();

  const response = await fetch(
    `${EBAY_INVENTORY_BASE_URL}/inventory_item/${encodeURIComponent(input.sku)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-AU',
      },
      body: JSON.stringify({
        product: {
          title: input.title,
          description: input.description,
          imageUrls: input.imageUrls,
        },
        condition: mapCondition(input.condition),
        availability: {
          shipToLocationAvailability: {
            quantity: input.quantity,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Failed to create eBay inventory item: ${response.status} ${errorBody}`
    );
  }
}