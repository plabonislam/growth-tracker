import { PlusCircle } from 'lucide-react';

import devopsImg from '@/assets/clubs/devops.png';
import frontendImg from '@/assets/clubs/frontend.png';
import javaImg from '@/assets/clubs/java.png';
import securityImg from '@/assets/clubs/security.png';
import { TONE } from '../landing.constants';
import { useClubs } from '../hooks/use-landing';

/** Exact Stitch tile artwork, keyed by club id. */
const CLUB_IMAGES: Record<string, string> = {
  frontend: frontendImg,
  java: javaImg,
  devops: devopsImg,
  security: securityImg,
};

export function ClubsSection() {
  const { data: clubs = [], isLoading } = useClubs();

  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <h2 className="font-serif text-3xl font-bold">Find Your Tribe</h2>
            <p className="mt-2 text-muted-foreground">
              Specialized guilds for every engineering discipline.
            </p>
          </div>
          <a href="#" className="font-bold text-primary hover:underline">
            View All 12 Clubs
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[16/9] animate-pulse rounded-2xl bg-muted md:col-span-2"
                />
              ))
            : clubs.map((club) => (
                <div
                  key={club.id}
                  className={`group relative flex aspect-[16/9] items-end overflow-hidden rounded-2xl ${
                    club.span === 'wide' ? 'md:col-span-2' : ''
                  }`}
                >
                  <img
                    src={CLUB_IMAGES[club.id]}
                    alt={`${club.name} club`}
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* legibility overlay — tinted per tone, matching Stitch */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t to-transparent ${TONE[club.tone].gradient}`}
                  />
                  <div className="relative z-10 p-8 text-white">
                    <h4 className="text-2xl font-semibold">{club.name}</h4>
                    <p className="mt-2 text-sm text-white/80">{club.blurb}</p>
                  </div>
                </div>
              ))}

          {/* Propose a Club — static affordance */}
          <div className="flex aspect-[16/9] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 md:col-span-2">
            <div className="text-center text-muted-foreground">
              <PlusCircle className="mx-auto mb-2 size-9" />
              <span className="text-xl font-semibold">Propose a Club</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
