import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfisicalSDK } from '@infisical/sdk';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class InfisicalService implements OnModuleInit {
  private readonly logger = new Logger(InfisicalService.name);
  private sdk: any; // Use any to allow easier testing and avoid strict SDK version clashes in typing

  private smtpHost = '';
  private smtpPort = 587;
  private smtpUser = '';
  private smtpPass = '';
  private smtpFrom = '';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const clientId = this.configService.get<string>('INFISICAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('INFISICAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      this.logger.warn('Infisical credentials not set in env. Skipping initialization.');
      return;
    }

    try {
      this.sdk = new InfisicalSDK({});
      await this.sdk.auth().universalAuth.login({
        clientId,
        clientSecret,
      });
      this.logger.log('Successfully logged in to Infisical');
      await this.forceReload();
    } catch (err: any) {
      this.logger.error('Failed to initialize Infisical client', err?.stack || err);
    }
  }

  @Interval(300000)
  async handleInterval() {
    await this.forceReload();
  }

  async forceReload() {
    if (!this.sdk) {
      this.logger.warn('Infisical SDK not initialized. Cannot reload secrets.');
      return;
    }

    const projectId = this.configService.get<string>('INFISICAL_PROJECT_ID');
    const environment = this.configService.get<string>('INFISICAL_ENVIRONMENT');

    if (!projectId || !environment) {
      this.logger.warn('INFISICAL_PROJECT_ID or INFISICAL_ENVIRONMENT is missing');
      return;
    }

    try {
      this.logger.log('Fetching secrets from Infisical...');
      const allSecrets = await this.sdk.secrets().listSecrets({
        projectId,
        environment,
        expandSecretReferences: true,
        viewSecretValue: true,
      });

      const secretsMap = new Map<string, string>();
      if (allSecrets && Array.isArray(allSecrets.secrets)) {
        for (const secret of allSecrets.secrets) {
          secretsMap.set(secret.secretKey, secret.secretValue);
        }
      }

      this.smtpHost = secretsMap.get('SMTP_HOST') || '';
      this.smtpPort = Number(secretsMap.get('SMTP_PORT')) || 587;
      this.smtpUser = secretsMap.get('SMTP_USER') || '';
      this.smtpPass = secretsMap.get('SMTP_PASS') || '';
      this.smtpFrom = secretsMap.get('SMTP_FROM') || '';

      this.logger.log('Successfully updated SMTP credentials from Infisical');
    } catch (err: any) {
      this.logger.error('Failed to fetch secrets from Infisical', err?.stack || err);
    }
  }

  getSmtpCredentials() {
    return {
      host: this.smtpHost,
      port: this.smtpPort,
      user: this.smtpUser,
      pass: this.smtpPass,
      from: this.smtpFrom,
    };
  }
}
