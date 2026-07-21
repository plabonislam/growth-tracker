import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  CreateClub,
  JoinClub,
  UpdateClub,
  UpdateMembershipStatus,
} from 'shared';
import {
  CreateClubSchema,
  JoinClubSchema,
  UpdateClubSchema,
  UpdateMembershipStatusSchema,
} from 'shared';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { RequireRole } from '../../core/decorators/require-role.decorator';
import { ZodBody } from '../../core/decorators/zod-body.decorator';
import { ClubsService } from './clubs.service';

interface CallerUser {
  userId: string;
  isAuthority: boolean;
  email: string;
}

@ApiTags('Clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'List all active clubs with user membership status',
  })
  findAll(@CurrentUser() caller: CallerUser) {
    return this.clubsService.findAll(caller);
  }

  @RequireRole('authority')
  @Get('check-name')
  @ApiOperation({ summary: 'Check whether a club name is available (public)' })
  checkName(@Query('name') name: string) {
    return this.clubsService.checkNameAvailable(name);
  }

  @ApiBearerAuth()
  @RequireRole('authority')
  @Get('enrollments/pending')
  @ApiOperation({
    summary: 'Get pending club enrollment requests (Authority only)',
  })
  getPendingEnrollments(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.clubsService.getPendingClubEnrollments(
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    );
  }

  @RequireRole('authority')
  @Get(':id')
  @ApiOperation({ summary: 'Get a club by id (public)' })
  findOne(@Param('id') id: string) {
    return this.clubsService.findById(id);
  }

  @ApiBearerAuth()
  @RequireRole('authority')
  @Post()
  @ApiOperation({ summary: 'Create a club (Authority only)' })
  create(@ZodBody(CreateClubSchema) dto: CreateClub) {
    return this.clubsService.create(dto);
  }

  @ApiBearerAuth()
  @RequireRole('authority')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a club (Authority only)' })
  update(@Param('id') id: string, @ZodBody(UpdateClubSchema) dto: UpdateClub) {
    return this.clubsService.update(id, dto);
  }

  @ApiBearerAuth()
  @RequireRole('authority')
  @Delete(':id')
  @ApiOperation({ summary: 'Archive a club — soft delete (Authority only)' })
  archive(@Param('id') id: string) {
    return this.clubsService.archive(id);
  }

  @ApiBearerAuth()
  @Get(':id/members')
  @ApiOperation({
    summary: 'List club members (Coordinator / Mentor / Authority)',
  })
  findMembers(@Param('id') clubId: string, @CurrentUser() caller: CallerUser) {
    return this.clubsService.findMembers(clubId, caller);
  }

  @ApiBearerAuth()
  @Post(':id/members')
  @ApiOperation({ summary: 'Apply to join a club (authenticated member)' })
  joinClub(
    @Param('id') clubId: string,
    @ZodBody(JoinClubSchema) dto: JoinClub,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.clubsService.submitJoinApplication(clubId, caller.userId, dto);
  }

  @ApiBearerAuth()
  @Patch(':id/members/:userId')
  @ApiOperation({
    summary: 'Update a member status (Coordinator / Mentor / Authority)',
  })
  updateMemberStatus(
    @Param('id') clubId: string,
    @Param('userId') userId: string,
    @ZodBody(UpdateMembershipStatusSchema) dto: UpdateMembershipStatus,
    @CurrentUser() caller: CallerUser,
  ) {
    return this.clubsService.updateMembershipStatus(
      clubId,
      userId,
      dto,
      caller,
    );
  }
}
