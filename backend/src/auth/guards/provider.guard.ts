import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ProviderService } from "../provider/provider.service";

@Injectable()
export class AuthProviderGuard implements CanActivate {
  constructor(private readonly providerService: ProviderService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ params?: { provider?: string } }>();
    const p = req.params?.provider;
    if (!p || !this.providerService.findByService(p)) {
      return false;
    }
    return true;
  }
}
