import type { OAuthProfile, OAuthProvider } from "../oauth-provider.interface";

type GoogleProviderOptions = {
  baseUrl: string;
  client_id: string;
  client_secret: string;
  scopes: string[];
};

/**
 * Google OAuth 2.0 (authorization code) — token + userinfo for Nest `auth/oauth` routes.
 */
export class GoogleProvider implements OAuthProvider {
  readonly name = "google";

  constructor(private readonly options: GoogleProviderOptions) { }

  getAuthUrl(state?: string): string {
    const baseUrl = this.options.baseUrl.endsWith('/')
      ? this.options.baseUrl.slice(0, -1)
      : this.options.baseUrl;
    const redirectUri = `${baseUrl}/auth/oauth / callback / google`;

    const params = new URLSearchParams({
      client_id: this.options.client_id,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: this.options.scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
    });

    if (state) {
      params.append("state", state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async findUserByCode(code: string): Promise<OAuthProfile> {
    const redirectUri = `${this.options.baseUrl}/auth/oauth/callback/google`;
    const body = new URLSearchParams({
      code,
      client_id: this.options.client_id,
      client_secret: this.options.client_secret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(
        `Google token exchange failed: ${tokenRes.status} ${text}`,
      );
    }
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      throw new Error("Google token response missing access_token");
    }
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!userRes.ok) {
      const text = await userRes.text();
      throw new Error(`Google userinfo failed: ${userRes.status} ${text}`);
    }
    const profile = (await userRes.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    const sub = profile.sub?.trim();
    const email = profile.email?.trim().toLowerCase();
    if (!sub || !email) {
      throw new Error("Google profile missing sub or email");
    }
    const expiresAt =
      typeof tokenJson.expires_in === "number"
        ? Math.floor(Date.now() / 1000) + tokenJson.expires_in
        : undefined;
    return {
      id: sub,
      provider: this.name,
      email,
      name: profile.name?.trim() || email.split("@")[0] || "User",
      picture: profile.picture?.trim(),
      access_token: accessToken,
      refresh_token: tokenJson.refresh_token,
      expires_at: expiresAt,
    };
  }
}
