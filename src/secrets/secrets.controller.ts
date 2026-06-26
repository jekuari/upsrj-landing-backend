import { Controller, Post, UseGuards, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { InfisicalService } from '../infisical/infisical.service';
import { ApiKeyGuard } from '../api-keys/guards/api-key.guard';
import { RequirePermissions } from '../api-keys/decorators/require-permissions.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('api/secrets')
export class SecretsController {
  constructor(
    private readonly infisicalService: InfisicalService,
    private readonly configService: ConfigService,
  ) {}

  @Post('reload')
  @UseGuards(ApiKeyGuard)
  @RequirePermissions('reload_secrets')
  async reload() {
    await this.infisicalService.forceReload();
    return { message: 'Secrets reloaded successfully' };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-infisical-signature') signature: string,
    @Body() payload: any,
  ) {
    const webhookSecret = this.configService.get<string>('INFISICAL_WEBHOOK_SECRET');
    
    // Simple verification: Check if the secret is provided and matches
    // In a real production scenario, you would verify the HMAC signature of the payload
    if (!webhookSecret || signature !== webhookSecret) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    await this.infisicalService.forceReload();
    return { message: 'Secrets updated via webhook' };
  }
}
