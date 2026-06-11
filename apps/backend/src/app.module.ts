import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [CoreModule, UserModule, AuthModule],
})
export class AppModule {}
