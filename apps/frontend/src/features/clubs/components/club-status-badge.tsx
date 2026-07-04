import { Badge } from '@/components/ui/badge';
import { MEMBERSHIP_META, NOT_ENROLLED_META } from '../clubs.constants';
import type { MembershipStatus } from '../clubs.types';

/** Renders the membership badge; falls back to "Not Enrolled" when absent. */
export function ClubStatusBadge({
  status,
}: {
  status?: MembershipStatus | null | '';
}) {
  const meta = status ? MEMBERSHIP_META[status] : NOT_ENROLLED_META;
  return (
    <Badge variant="outline" className={`border-transparent ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}
