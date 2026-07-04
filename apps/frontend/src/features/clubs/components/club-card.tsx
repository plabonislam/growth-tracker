import { MessagesSquare, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CLUB_ICONS, CLUB_TONE } from '../clubs.constants';
import type { Club } from '../clubs.types';
import { ClubStatusBadge } from './club-status-badge';

interface ClubCardProps {
  club: Club;
  onExplore?: (club: Club) => void;
  onJoin?: (club: Club) => void;
}

function Stat({ icon: Icon, value }: { icon: typeof Users; value: string }) {
  return (
    <span className="flex items-center gap-2 text-sm text-foreground">
      <Icon className="size-5 text-muted-foreground" />
      {value}
    </span>
  );
}

export function ClubCard({ club, onExplore, onJoin }: ClubCardProps) {
  const tone = CLUB_TONE[club.tone];
  const Icon = CLUB_ICONS[club.iconKey];
  const isMember = Boolean(club.membership);

  return (
    <Card
      className={`flex flex-col gap-0 border-t-4 p-6 transition-all hover:-translate-y-1 hover:shadow-md ${tone.borderTop}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-lg p-3 ${tone.bgSoft}`}>
          <Icon className={`size-6 ${tone.text}`} />
        </div>
        <ClubStatusBadge status={club.membership} />
      </div>

      <h3 className="mb-1 font-serif text-xl font-semibold">{club.name}</h3>
      <p className="mb-6 line-clamp-2 text-sm text-muted-foreground">
        {club.description}
      </p>

      <div className="mb-6 flex items-center gap-6">
        <Stat icon={MessagesSquare} value={`${club.topics} Topics`} />
        <Stat icon={Users} value={`${club.members} Members`} />
      </div>

      <div className="mt-auto flex gap-2">
        {!isMember && (
          <Button className="flex-1" onClick={() => onJoin?.(club)}>
            Join
          </Button>
        )}
        <Button
          variant="outline"
          className={`flex-1 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary ${
            isMember ? 'w-full' : ''
          }`}
          onClick={() => onExplore?.(club)}
        >
          Explore
        </Button>
      </div>
    </Card>
  );
}
