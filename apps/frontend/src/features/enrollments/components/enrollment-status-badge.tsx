import { Badge } from '@/components/ui/badge';
import { ENROLLMENT_STATUS_META } from '../enrollments.constants';
import type { EnrollmentRequestStatus } from '../enrollments.types';

export function EnrollmentStatusBadge({
  status,
}: {
  status: EnrollmentRequestStatus;
}) {
  const meta = ENROLLMENT_STATUS_META[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 border-transparent ${meta.className}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dotClassName}`} />
      {meta.label}
    </Badge>
  );
}
