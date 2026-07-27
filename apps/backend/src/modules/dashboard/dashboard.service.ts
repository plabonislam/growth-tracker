import { Injectable } from '@nestjs/common';
import {
  ModuleProgressStatus,
  type CertificationStatus,
  type LearnerDashboardResponse,
} from 'shared';

import { DashboardRepository } from './dashboard.repository';

interface Caller {
  userId: string;
  isAuthority: boolean;
}

/** How many club-mates the avatar stack shows before it starts counting. */
const MEMBER_SAMPLE = 3;
/** How far down the club's calendar the dashboard looks. */
const UPCOMING_SESSIONS = 4;

@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  /**
   * Everything the learner's dashboard shows, for the caller alone. A learner
   * who has joined nothing gets `club: null` and `activeTopic: null` rather than
   * an error — an empty dashboard is a real state, not a failure.
   */
  async getLearnerDashboard(caller: Caller): Promise<LearnerDashboardResponse> {
    const { userId } = caller;

    const [
      club,
      topic,
      completedTopics,
      certificates,
      latestCertificateTopic,
      learningMinutes,
    ] = await Promise.all([
      this.repo.findActiveClub(userId),
      this.repo.findActiveTopic(userId),
      this.repo.findCompletedTopics(userId),
      this.repo.countCertificates(userId),
      this.repo.findLatestCertificateTopic(userId),
      this.repo.sumCompletedModuleMinutes(userId),
    ]);

    const clubSummary = club ? await this.buildClub(club, userId) : null;

    return {
      club: clubSummary,
      activeTopic: topic ? await this.buildTopic(topic, userId) : null,
      stats: {
        completedTopics: completedTopics.length,
        completedTopicClubs: new Set(completedTopics.map((t) => t.clubId)).size,
        earnedCertificates: certificates,
        latestCertificateTopic,
        learningMinutes,
      },
      events: club ? await this.buildEvents(club.id) : [],
    };
  }

  private async buildClub(
    club: {
      id: string;
      name: string;
      description: string | null;
      memberSince: Date | null;
    },
    userId: string,
  ) {
    const [members, memberCount, totals] = await Promise.all([
      this.repo.findClubMemberNames(club.id, MEMBER_SAMPLE),
      this.repo.countClubMembers(club.id),
      this.repo.getClubModuleTotals(club.id, userId),
    ]);

    return {
      id: club.id,
      name: club.name,
      description: club.description,
      memberSince: (club.memberSince ?? new Date()).toISOString(),
      // A club with no published modules is 0% done, not undefined.
      progressPct:
        totals.total === 0
          ? 0
          : Math.round((totals.completed / totals.total) * 100),
      memberNames: members.map((m) => m.name),
      memberCount,
    };
  }

  private async buildTopic(
    topic: {
      id: string;
      title: string;
      description: string | null;
      startedAt: Date | null;
      certificationRequired: boolean | null;
    },
    userId: string,
  ) {
    const [modules, certificationStatus] = await Promise.all([
      this.repo.findTopicModuleProgress(topic.id, userId),
      this.repo.findTopicCertification(topic.id, userId),
    ]);

    const totalWeight = modules.reduce((sum, m) => sum + m.weight, 0);
    const doneWeight = modules
      .filter((m) => m.status === ModuleProgressStatus.completed)
      .reduce((sum, m) => sum + m.weight, 0);
    const completedCount = modules.filter(
      (m) => m.status === ModuleProgressStatus.completed,
    ).length;

    return {
      id: topic.id,
      title: topic.title,
      description: topic.description,
      startedAt: (topic.startedAt ?? new Date()).toISOString(),
      // The module they are on: the one after everything finished, and the last
      // one once the topic is done.
      moduleIndex: Math.min(completedCount + 1, modules.length),
      moduleCount: modules.length,
      completedModules: completedCount,
      progressPct:
        totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100),
      // The column is nullable for topics written before it existed; those
      // never asked for a certificate.
      certificationRequired: topic.certificationRequired ?? false,
      certificationStatus: certificationStatus as CertificationStatus | null,
    };
  }

  private async buildEvents(clubId: string) {
    // Sessions carry a date, not a timestamp, so today's session still counts
    // as upcoming for the whole day.
    const today = new Date().toISOString().slice(0, 10);
    const sessions = await this.repo.findUpcomingSessions(
      clubId,
      today,
      UPCOMING_SESSIONS,
    );

    return sessions.map((session) => ({
      id: session.id,
      title: session.title,
      date: session.date,
      type: session.type,
    }));
  }
}
