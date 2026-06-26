import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InfisicalService } from './infisical.service';

// Mock the InfisicalSDK
const mockLogin = jest.fn();
const mockListSecrets = jest.fn();

jest.mock('@infisical/sdk', () => {
  return {
    InfisicalSDK: jest.fn().mockImplementation(() => {
      return {
        auth: () => ({
          universalAuth: {
            login: mockLogin,
          },
        }),
        secrets: () => ({
          listSecrets: mockListSecrets,
        }),
      };
    }),
  };
});

describe('InfisicalService', () => {
  let service: InfisicalService;
  let configService: ConfigService;

  beforeEach(async () => {
    mockLogin.mockReset();
    mockListSecrets.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfisicalService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'INFISICAL_CLIENT_ID') return 'mock-client-id';
              if (key === 'INFISICAL_CLIENT_SECRET') return 'mock-client-secret';
              if (key === 'INFISICAL_PROJECT_ID') return 'mock-project-id';
              if (key === 'INFISICAL_ENVIRONMENT') return 'mock-env';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<InfisicalService>(InfisicalService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize and fetch credentials if config is present', async () => {
      mockLogin.mockResolvedValue({ token: 'mock-token' });
      mockListSecrets.mockResolvedValue({
        secrets: [
          { secretKey: 'SMTP_HOST', secretValue: 'smtp.test.com' },
          { secretKey: 'SMTP_PORT', secretValue: '465' },
          { secretKey: 'SMTP_USER', secretValue: 'test-user' },
          { secretKey: 'SMTP_PASS', secretValue: 'test-pass' },
          { secretKey: 'SMTP_FROM', secretValue: 'test@from.com' },
        ],
      });

      await service.onModuleInit();

      expect(mockLogin).toHaveBeenCalledWith({
        clientId: 'mock-client-id',
        clientSecret: 'mock-client-secret',
      });
      expect(mockListSecrets).toHaveBeenCalledWith({
        projectId: 'mock-project-id',
        environment: 'mock-env',
        expandSecretReferences: true,
        viewSecretValue: true,
      });

      const creds = service.getSmtpCredentials();
      expect(creds).toEqual({
        host: 'smtp.test.com',
        port: 465,
        user: 'test-user',
        pass: 'test-pass',
        from: 'test@from.com',
      });
    });

    it('should skip initialization if client credentials are not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(null);

      await service.onModuleInit();

      expect(mockLogin).not.toHaveBeenCalled();
      const creds = service.getSmtpCredentials();
      expect(creds.host).toBe('');
    });
  });

  describe('handleInterval', () => {
    it('should force reload secrets on interval', async () => {
      mockLogin.mockResolvedValue({ token: 'mock-token' });
      mockListSecrets.mockResolvedValue({
        secrets: [
          { secretKey: 'SMTP_HOST', secretValue: 'new.test.com' },
          { secretKey: 'SMTP_PORT', secretValue: '25' },
        ],
      });

      // Init first
      await service.onModuleInit();
      mockListSecrets.mockClear();

      // Trigger interval method
      mockListSecrets.mockResolvedValue({
        secrets: [
          { secretKey: 'SMTP_HOST', secretValue: 'interval.test.com' },
          { secretKey: 'SMTP_PORT', secretValue: '25' },
        ],
      });
      await service.handleInterval();

      expect(mockListSecrets).toHaveBeenCalled();
      expect(service.getSmtpCredentials().host).toBe('interval.test.com');
    });
  });
});
