import { getValidEbayAccessToken } from "./ebay-token";

const EBAY_INVENTORY_BASE_URL = "https://api.ebay.com/sell/inventory/v1";

export type CreateEbayOfferInput = {
  sku: string;
  price: number;
  quantity: number;
  categoryId: string;
  description: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env value: ${name}`);
  }

  return value;
}

export async function createEbayOffer(
  input: CreateEbayOfferInput
): Promise<string> {
  const accessToken = await getValidEbayAccessToken();

  const response = await fetch(`${EBAY_INVENTORY_BASE_URL}/offer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Language": "en-AU",
      "Accept-Language": "en-AU",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_AU",
    },
    body: JSON.stringify({
      sku: input.sku,
      marketplaceId: "EBAY_AU",
      format: "FIXED_PRICE",
      availableQuantity: input.quantity,
      categoryId: input.categoryId,
      merchantLocationKey: requiredEnv("EBAY_MERCHANT_LOCATION_KEY"),
      listingDescription: input.description,
      pricingSummary: {
        price: {
          value: input.price.toFixed(2),
          currency: "AUD",
        },
      },
      listingPolicies: {
        paymentPolicyId: requiredEnv("EBAY_PAYMENT_POLICY_ID"),
        returnPolicyId: requiredEnv("EBAY_RETURN_POLICY_ID"),
        fulfillmentPolicyId: requiredEnv("EBAY_FULFILLMENT_POLICY_ID"),
      },
    }),
  });

  const responseText = await response.text();

  console.log("EBAY CREATE OFFER STATUS:", response.status);
  console.log("EBAY CREATE OFFER RESPONSE:", responseText);

  if (!response.ok) {
    throw new Error(
      `Failed to create eBay offer: ${response.status} ${responseText}`
    );
  }

  const data = JSON.parse(responseText) as { offerId?: string };

  if (!data.offerId) {
    throw new Error("eBay offer created but no offerId was returned.");
  }

  return data.offerId;
}

export async function publishEbayOffer(offerId: string): Promise<string> {
  const accessToken = await getValidEbayAccessToken();

  const response = await fetch(
    `${EBAY_INVENTORY_BASE_URL}/offer/${encodeURIComponent(offerId)}/publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Content-Language": "en-AU",
        "Accept-Language": "en-AU",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_AU",
      },
    }
  );

  const responseText = await response.text();

  console.log("EBAY PUBLISH OFFER STATUS:", response.status);
  console.log("EBAY PUBLISH OFFER RESPONSE:", responseText);

  if (!response.ok) {
    throw new Error(
      `Failed to publish eBay offer: ${response.status} ${responseText}`
    );
  }

  const data = JSON.parse(responseText) as { listingId?: string };

  if (!data.listingId) {
    throw new Error("eBay offer published but no listingId was returned.");
  }

  return data.listingId;
}