import { Injectable } from '@nestjs/common';
import { UserResponse } from 'shared';
import { DatabaseService } from '../../core/database/database.service';
import { usersTable } from '../../core/database/schema/users.schema';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<UserResponse[]> {
    return this.databaseService.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(usersTable);
  }
}
