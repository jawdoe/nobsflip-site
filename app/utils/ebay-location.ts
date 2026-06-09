import { getValidEbayAccessToken } from "./ebay-token";

const EBAY_INVENTORY_BASE_URL = "https://api.ebay.com/sell/inventory/v1";

export async function createDefaultEbayLocation(): Promise<string> {
  const accessToken = await getValidEbayAccessToken();
  const merchantLocationKey = "nobs-main";

  const response = await fetch(
    `${EBAY_INVENTORY_BASE_URL}/location/${merchantLocationKey}`,
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
      body: JSON.stringify({
        name: "NoBSFlip Main Location",
        merchantLocationStatus: "ENABLED",
        locationTypes: ["WAREHOUSE"],
        location: {
          address: {
            city: "Melbourne",
            stateOrProvince: "VIC",
            postalCode: "3000",
            country: "AU",
          },
        },
      }),
    }
  );

  const responseText = await response.text();

  console.log("EBAY CREATE LOCATION STATUS:", response.status);
  console.log("EBAY CREATE LOCATION RESPONSE:", responseText);

  const alreadyExists =
    response.status === 400 && responseText.includes("merchantLocationKey already exists");

  if (!response.ok && !alreadyExists) {
    throw new Error(
      `Failed to create eBay location: ${response.status} ${responseText}`
    );
  }

  return merchantLocationKey;
}