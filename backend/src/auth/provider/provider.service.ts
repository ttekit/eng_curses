import { Inject, Injectable } from "@nestjs/common";
import type { TypeOptions } from "./provider.constants";
import type { OAuthProvider } from "./oauth-provider.interface";

export const OAUTH_TYPE_OPTIONS = "OAUTH_TYPE_OPTIONS";

@Injectable()
export class ProviderService {
  private readonly byName = new Map<string, OAuthProvider>();

  constructor(@Inject(OAUTH_TYPE_OPTIONS) options: TypeOptions) {
    for (const service of options.services) {
      this.byName.set(service.name.toLowerCase(), service);
    }
  }

  findByService(name: string): OAuthProvider | undefined {
    return this.byName.get(String(name).trim().toLowerCase());
  }
}
