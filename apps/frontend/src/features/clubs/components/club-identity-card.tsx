import { Card } from '@/components/ui/card';
import { TOPIC_ICONS } from '../clubs.constants';
import type { ClubJoinInfo } from '../clubs.types';

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

type ClubIdentityCardProps = Pick<
  ClubJoinInfo,
  'name' | 'iconKey' | 'topicsLabel' | 'membersLabel' | 'coordinators'
>;

export function ClubIdentityCard({
  name,
  iconKey,
  topicsLabel,
  membersLabel,
  coordinators,
}: ClubIdentityCardProps) {
  const Icon = TOPIC_ICONS[iconKey];
  const shown = coordinators.slice(0, 2);
  const extra = coordinators.length - shown.length;

  return (
    <Card className="gap-0 border-t-4 border-t-primary p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase text-primary">
            Application Portal
          </span>
          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight">
            Joining {name}
          </h1>
        </div>
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Icon className="size-8" />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Fact label="Club Name" value={name} />
        <Fact label="# Topics" value={topicsLabel} />
        <Fact label="# Members" value={membersLabel} />
        <div className="rounded-lg border bg-background p-4">
          <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
            Coordinators
          </p>
          <div className="flex -space-x-2">
            {shown.map((name) => (
              <span
                key={name}
                title={name}
                className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground"
              >
                {initials(name)}
              </span>
            ))}
            {extra > 0 && (
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold">
                +{extra}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
