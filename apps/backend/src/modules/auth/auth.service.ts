import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../core/database/database.service';
import { clubsTable } from '../../core/database/schema/clubs.schema';
import { topicMentorsTable } from '../../core/database/schema/topics.schema';
import { usersTable } from '../../core/database/schema/users.schema';

interface GoogleProfile {
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface TokenPayload {
  sub: string;
  email: string;
  isAuthority: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async upsertUser(profile: GoogleProfile) {
    const existing = await this.db.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, profile.email));

    if (existing.length > 0) {
      const [updated] = await this.db.db
        .update(usersTable)
        .set({ name: profile.name, avatarUrl: profile.avatarUrl })
        .where(eq(usersTable.email, profile.email))
        .returning();
      return updated;
    }

    const [created] = await this.db.db
      .insert(usersTable)
      .values({
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      })
      .returning();
    return created;
  }

  generateTokens(user: {
    id: string;
    email: string;
    isAuthority: boolean | null;
  }) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      isAuthority: user.isAuthority ?? false,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  refreshAccessToken(token: string) {
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const accessToken = this.jwtService.sign({
      sub: payload.sub,
      email: payload.email,
      isAuthority: payload.isAuthority,
    });
    return { accessToken };
  }

  async getMe(userId: string) {
    // `id` is intentionally omitted — the client already has it from the JWT
    // `sub` claim (see frontend auth.store). This endpoint supplies only the
    // profile fields the token doesn't carry.
    const [[user], [coordinated], [mentored]] = await Promise.all([
      this.db.db
        .select({
          name: usersTable.name,
          email: usersTable.email,
          avatarUrl: usersTable.avatarUrl,
          isAuthority: usersTable.isAuthority,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId)),
      // Held in join tables rather than on the user row, so a role is a
      // question about what they run, not a column anyone can read off a token.
      this.db.db
        .select({ id: clubsTable.id })
        .from(clubsTable)
        .where(eq(clubsTable.coordinatorId, userId))
        .limit(1),
      this.db.db
        .select({ topicId: topicMentorsTable.topicId })
        .from(topicMentorsTable)
        .where(eq(topicMentorsTable.userId, userId))
        .limit(1),
    ]);

    if (!user) throw new NotFoundException('User not found');

    return {
      ...user,
      /** What the caller runs, which decides the reviewing screens they get. */
      roles: {
        isAuthority: user.isAuthority ?? false,
        isCoordinator: coordinated != null,
        isMentor: mentored != null,
      },
    };
  }
}
