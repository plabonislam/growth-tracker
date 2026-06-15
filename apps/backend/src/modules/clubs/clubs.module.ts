import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsRepository } from './clubs.repository';
import { ClubsService } from './clubs.service';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService, ClubsRepository],
})
export class ClubsModule {}
