import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  private readonly users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
  ];

  findAll(): User[] {
    return this.users;
  }
}
