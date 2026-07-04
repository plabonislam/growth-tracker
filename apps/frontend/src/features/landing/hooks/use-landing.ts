import { useQuery } from '@tanstack/react-query';

import { landingService } from '../services/landing.service';

/** Query keys for the landing domain. */
export const LANDING_KEYS = {
  all: ['landing'] as const,
  stats: () => [...LANDING_KEYS.all, 'stats'] as const,
  clubs: () => [...LANDING_KEYS.all, 'clubs'] as const,
  testimonials: () => [...LANDING_KEYS.all, 'testimonials'] as const,
  faqs: () => [...LANDING_KEYS.all, 'faqs'] as const,
};

export function useStats() {
  return useQuery({
    queryKey: LANDING_KEYS.stats(),
    queryFn: landingService.getStats,
  });
}

export function useClubs() {
  return useQuery({
    queryKey: LANDING_KEYS.clubs(),
    queryFn: landingService.getClubs,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: LANDING_KEYS.testimonials(),
    queryFn: landingService.getTestimonials,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: LANDING_KEYS.faqs(),
    queryFn: landingService.getFaqs,
  });
}
