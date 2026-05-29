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
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Content-Language': 'en-AU',
        'Accept-Language': 'en-AU',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_AU',
      },
      body: JSON.stringify({
        availability: {
          shipToLocationAvailability: {
            quantity: input.quantity,
          },
        },
        condition: mapCondition(input.condition),
        product: {
          title: input.title,
          description: input.description,
          imageUrls: input.imageUrls,
        },
      }),
    }
  );

  const responseText = await response.text();

  console.log('EBAY STATUS:', response.status);
  console.log('EBAY RESPONSE:', responseText);

  if (!response.ok) {
    throw new Error(
      `Failed to create eBay inventory item: ${response.status} ${responseText}`
    );
  }
}