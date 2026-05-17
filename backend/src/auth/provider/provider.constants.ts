import type { OAuthProvider } from "./oauth-provider.interface";

export type TypeOptions = {
  baseUrl: string;
  services: ReadonlyArray<OAuthProvider>;
};
