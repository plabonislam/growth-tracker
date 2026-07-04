import { CheckCircle2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { ClubDetail } from '../clubs.types';

type ClubExpectationsProps = Pick<
  ClubDetail,
  'expectationsIntro' | 'expectations' | 'mentorshipFocus'
>;

export function ClubExpectations({
  expectationsIntro,
  expectations,
  mentorshipFocus,
}: ClubExpectationsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 border-t-4 border-t-primary p-6">
        <h3 className="mb-4 font-serif text-2xl font-semibold">
          Club Expectations
        </h3>
        <p className="leading-relaxed text-muted-foreground">
          {expectationsIntro}
        </p>
        <ul className="mt-4 space-y-2">
          {expectations.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="rounded-xl bg-primary p-6 text-primary-foreground">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80">
          Mentorship Focus
        </h4>
        <p className="text-lg font-semibold">{mentorshipFocus}</p>
      </div>
    </div>
  );
}
