import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfisicalService } from './infisical.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [InfisicalService],
  exports: [InfisicalService],
})
export class InfisicalModule {}
