import { BookOpen, Users } from 'lucide-react';

import { CLUB_TONE } from '../clubs.constants';
import type { ClubDetail } from '../clubs.types';

type ClubHeroProps = Pick<
  ClubDetail,
  'name' | 'tone' | 'topicsCount' | 'membersLabel'
>;

export function ClubHero({
  name,
  tone,
  topicsCount,
  membersLabel,
}: ClubHeroProps) {
  return (
    <section className="relative h-[240px] overflow-hidden rounded-xl shadow-lg md:h-[320px]">
      {/* self-contained cover — tinted gradient (no external asset) */}
      <div
        className={`absolute inset-0 bg-gradient-to-br to-slate-900 ${CLUB_TONE[tone].bgSoft}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full p-6">
        <h1 className="mb-1 font-serif text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          {name}
        </h1>
        <div className="flex gap-4 text-white/90">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
            <BookOpen className="size-4" />
            {topicsCount} Topics
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
            <Users className="size-4" />
            {membersLabel} Members
          </span>
        </div>
      </div>
    </section>
  );
}
