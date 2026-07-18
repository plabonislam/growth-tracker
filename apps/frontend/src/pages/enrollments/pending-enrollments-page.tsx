import { PendingEnrollmentsTabs } from '@/features/enrollments/components/pending-enrollments-tabs';
import { SectionHeading } from '@/components/ui/section-heading';

export function PendingEnrollmentsPage() {
  return (
    <div className="pb-24">
      <main className="mx-auto max-w-[1800px] px-4 md:px-6 lg:px-8">
        <SectionHeading
          as="h1"
          title="Pending enrollments"
          subtitle="Review and manage student applications for clubs and specific curriculum topics."
          className="py-6 md:py-8 lg:py-10"
        />

        <PendingEnrollmentsTabs />
      </main>
    </div>
  );
}
