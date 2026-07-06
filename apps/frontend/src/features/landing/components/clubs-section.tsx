import { MoveRight } from 'lucide-react';

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
    <section className="border-y bg-card py-16">
      <div className="mx-auto max-w-[1800px] px-6">
        <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <h2 className="font-serif text-4xl font-bold">Find Your Tribe</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Specialized guilds for every engineering discipline.
            </p>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-bold text-primary hover:underline"
          >
            View All 12 Clubs
            <MoveRight className="size-5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] animate-pulse rounded-[2rem] bg-muted"
                />
              ))
            : clubs.map((club) => (
                <div
                  key={club.id}
                  className="group relative h-[400px] overflow-hidden rounded-[2rem]"
                >
                  <img
                    src={CLUB_IMAGES[club.id]}
                    alt={`${club.name} club`}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-10 text-white ${TONE[club.tone].gradient}`}
                  >
                    <h4 className="mb-2 font-serif text-3xl font-semibold">
                      {club.name}
                    </h4>
                    <p className="text-lg text-white/90">{club.blurb}</p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
