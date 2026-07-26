import { clubsService } from '@/features/clubs/services/clubs.service';
import { topicsService } from '@/features/topics/services/topics.service';

import type { SearchResult } from '../search.types';

/**
 * Global search service.
 *
 * Would normally be `httpClient.get('/search?q=…')`; until that endpoint
 * exists the index is aggregated client-side from the clubs/topics services
 * (which resolve fixtures), so the TanStack Query wiring is real and the
 * whole file swaps out for one HTTP call later.
 */
async function buildIndex(): Promise<SearchResult[]> {
  const [clubs, clubDetail, enrolledTopic] = await Promise.all([
    clubsService.getClubs(),
    clubsService.getClubDetail('data-insights'),
    topicsService.getEnrolledTopic('data-engineering-spark'),
  ]);

  const clubResults: SearchResult[] = clubs.map((club) => ({
    id: club.id,
    kind: 'club',
    title: club.name,
    subtitle: `${club.topics} topics · ${club.members} members`,
    path: `/clubs/${club.id}`,
  }));

  const topicResults: SearchResult[] = clubDetail.topics.map((topic) => ({
    id: topic.id,
    kind: 'topic',
    title: topic.title,
    subtitle: `${clubDetail.name} · ${topic.modules} modules`,
    // An approved enrollment opens the topic directly; anything else lands on
    // the club page, where the way in is.
    path:
      topic.enrollmentStatus === 'approved'
        ? `/topics/${topic.id}`
        : `/clubs/${clubDetail.id}`,
  }));

  const moduleResults: SearchResult[] = enrolledTopic.modules.map((module) => ({
    id: module.id,
    kind: 'module',
    title: module.title,
    subtitle: enrolledTopic.title,
    path: `/topics/${enrolledTopic.id}`,
  }));

  return [...clubResults, ...topicResults, ...moduleResults];
}

export const searchService = {
  getSearchIndex: buildIndex,
};
