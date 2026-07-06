import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { searchService } from '../services/search.service';
import type { SearchResult } from '../search.types';

export const SEARCH_KEYS = {
  index: ['search', 'index'] as const,
};

/** Case-insensitive substring match over title and subtitle. */
function matches(result: SearchResult, term: string) {
  return (
    result.title.toLowerCase().includes(term) ||
    result.subtitle.toLowerCase().includes(term)
  );
}

/**
 * Global search over clubs, topics, and modules. The index is fetched once
 * and filtered client-side as the user types.
 */
export function useSearch(query: string) {
  const { data: index = [], isLoading } = useQuery({
    queryKey: SEARCH_KEYS.index,
    queryFn: searchService.getSearchIndex,
    staleTime: 5 * 60 * 1000,
  });

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return index.filter((result) => matches(result, term));
  }, [index, query]);

  return { results, isLoading };
}
