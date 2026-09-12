const BHARATSHIP_AUTH_URL =
  "https://app.bharatship.com/api/authToken";

type BharatShipAuthResponse = {
  token?: string;
};

export async function getBharatShipToken(): Promise<string> {
  const email = process.env.BHARATSHIP_EMAIL;
  const password = process.env.BHARATSHIP_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "BharatShip credentials are missing from .env.local"
    );
  }

  const response = await fetch(BHARATSHIP_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `BharatShip authentication failed (${response.status}): ${errorText}`
    );
  }

  const data =
    (await response.json()) as BharatShipAuthResponse;

  if (!data.token) {
    throw new Error(
      "BharatShip authentication succeeded but no token was returned."
    );
  }

  return data.token;
}