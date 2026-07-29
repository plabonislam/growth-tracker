import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsRepository } from './sessions.repository';
import { SessionsService } from './sessions.service';

/**
 * Writing the club's session log. Reading it belongs to the dashboard, which
 * reports a whole month at once — nothing here serves a list.
 */
@Module({
  controllers: [SessionsController],
  providers: [SessionsService, SessionsRepository],
})
export class SessionsModule {}
