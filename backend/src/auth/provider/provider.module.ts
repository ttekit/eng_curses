import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProviderService, OAUTH_TYPE_OPTIONS } from "./provider.service";
import { AuthProviderGuard } from "../guards/provider.guard";
import type { TypeOptions } from "./provider.constants";

@Module({})
export class ProviderModule {
  static registerAsync(options: {
    imports?: unknown[];
    useFactory: (...args: any[]) => TypeOptions | Promise<TypeOptions>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: ProviderModule,
      imports: [...(options.imports ?? []), ConfigModule] as never[],
      providers: [
        {
          provide: OAUTH_TYPE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        ProviderService,
        AuthProviderGuard,
      ],
      exports: [ProviderService, AuthProviderGuard],
    };
  }
}
