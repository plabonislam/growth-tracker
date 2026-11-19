import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../../core/database/database.service';
import { clubsTable } from '../../core/database/schema/clubs.schema';
import { topicMentorsTable } from '../../core/database/schema/topics.schema';
import { usersTable } from '../../core/database/schema/users.schema';

interface GoogleProfile {
  email: string;
  name: string;
  avatarUrl: string | null;
}

export const TokenType = {
  Access: 'access',
  Refresh: 'refresh',
} as const;
export type TokenType = (typeof TokenType)[keyof typeof TokenType];

/** How long each kind of token stays valid. */
export const TOKEN_LIFETIME = {
  [TokenType.Access]: '15m',
  [TokenType.Refresh]: '5h',
} as const;

export interface TokenPayload {
  sub: string;
  email: string;
  isAuthority: boolean;
  /**
   * Which job the token does. Both kinds share a secret, so without this an
   * access token could refresh itself forever and a refresh token could call
   * the API for its whole 5 hours.
   */
  typ: TokenType;
  /** The user's `token_version` when the token was issued. */
  ver: number;
}

/** What a token needs from the user row to be signed or checked. */
interface TokenSubject {
  id: string;
  email: string;
  isAuthority: boolean | null;
  tokenVersion: number;
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

  generateTokens(user: TokenSubject) {
    const accessToken = this.signToken(user, TokenType.Access);
    const refreshToken = this.signToken(user, TokenType.Refresh);
    return { accessToken, refreshToken };
  }

  /**
   * Trades a refresh token for a new access token, built from the user's
   * current row rather than the old token's claims. No new refresh token is
   * issued, so a session ends when the one from login expires.
   */
  async refreshAccessToken(token: string) {
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.resolveTokenUser(payload, TokenType.Refresh);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return { accessToken: this.signToken(user, TokenType.Access) };
  }

  /**
   * The user a verified token speaks for, read fresh from the database. Null
   * when the token is the wrong type, the user is gone, or it was revoked.
   */
  async resolveTokenUser(payload: TokenPayload, expectedType: TokenType) {
    if (payload.typ !== expectedType) return null;

    const [user] = await this.db.db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        isAuthority: usersTable.isAuthority,
        tokenVersion: usersTable.tokenVersion,
      })
      .from(usersTable)
      .where(eq(usersTable.id, payload.sub));

    if (!user || user.tokenVersion !== payload.ver) return null;
    return user;
  }

  /**
   * Invalidates every access and refresh token issued to the user so far.
   * Throws rather than succeeding silently when there is no user to revoke —
   * `WHERE id = NULL` would match nothing and logout would report success.
   */
  async revokeTokens(userId: string) {
    if (!userId) throw new UnauthorizedException();

    const revoked = await this.db.db
      .update(usersTable)
      .set({ tokenVersion: sql`${usersTable.tokenVersion} + 1` })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

    if (revoked.length === 0) throw new UnauthorizedException();
  }

  private signToken(user: TokenSubject, typ: TokenType) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      isAuthority: user.isAuthority ?? false,
      typ,
      ver: user.tokenVersion,
    };
    return this.jwtService.sign(payload, { expiresIn: TOKEN_LIFETIME[typ] });
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
