import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [CoreModule, UserModule, AuthModule, ClubsModule],
})
export class AppModule {}
