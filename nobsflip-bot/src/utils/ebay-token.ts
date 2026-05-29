import { supabase } from '../lib/supabase';

type EbayTokenRow = {
  id: string;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string | null;
  scope: string | null;
  token_type: string | null;
};

function getBasicAuthHeader(): string {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET');
  }

  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return `Basic ${encoded}`;
}

function isTokenStillValid(expiresAt: string): boolean {
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();

  // Refresh if token expires within the next 5 minutes
  return expiryTime - now > 5 * 60 * 1000;
}

export async function getValidEbayAccessToken(): Promise<string> {
  const { data: tokenRow, error } = await supabase
    .from('ebay_oauth_tokens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch eBay token: ${error.message}`);
  }

  if (!tokenRow) {
    throw new Error('No eBay OAuth token found. Run OAuth connection first.');
  }

  const token = tokenRow as EbayTokenRow;

  if (isTokenStillValid(token.access_token_expires_at)) {
    return token.access_token;
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: token.refresh_token,
  });

  if (token.scope) {
    body.set('scope', token.scope);
  }

  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const tokenData = await response.json();

  if (!response.ok) {
    throw new Error(
      `Failed to refresh eBay token: ${JSON.stringify(tokenData)}`
    );
  }

  const accessTokenExpiresAt = new Date(
    Date.now() + Number(tokenData.expires_in ?? 7200) * 1000
  ).toISOString();

  const { error: updateError } = await supabase
    .from('ebay_oauth_tokens')
    .update({
      access_token: tokenData.access_token,
      access_token_expires_at: accessTokenExpiresAt,
      token_type: tokenData.token_type ?? token.token_type ?? 'Bearer',
      scope: tokenData.scope ?? token.scope,
      updated_at: new Date().toISOString(),
    })
    .eq('id', token.id);

  if (updateError) {
    throw new Error(`Failed to save refreshed eBay token: ${updateError.message}`);
  }

  return tokenData.access_token;
}