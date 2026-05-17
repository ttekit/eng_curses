export type OAuthProfile = {
  id: string;
  provider: string;
  email: string;
  name: string;
  picture?: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};

export interface OAuthProvider {
  readonly name: string;
  getAuthUrl(): string;
  findUserByCode(code: string): Promise<OAuthProfile>;
}
