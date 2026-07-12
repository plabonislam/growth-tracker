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
import type { CreateClub, UpdateClub, UpdateMembershipStatus } from 'shared';
import {
  CreateClubSchema,
  UpdateClubSchema,
  UpdateMembershipStatusSchema,
} from 'shared';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
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

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active clubs (public)' })
  findAll() {
    return this.clubsService.findAll();
  }

  @RequireRole('authority')
  @Get('check-name')
  @ApiOperation({ summary: 'Check whether a club name is available (public)' })
  checkName(@Query('name') name: string) {
    return this.clubsService.checkNameAvailable(name);
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
