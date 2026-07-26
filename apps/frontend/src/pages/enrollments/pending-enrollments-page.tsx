import { PendingEnrollmentsTabs } from '@/features/enrollments/components/pending-enrollments-tabs';
import { SectionHeading } from '@/components/ui/section-heading';

export function PendingEnrollmentsPage() {
  return (
    <div className="pb-24">
      <main className="mx-auto max-w-[1800px] px-4 md:px-6 lg:px-8">
        <SectionHeading
          as="h1"
          title="Pending enrollments"
          // Which queues these are depends on the role reading the page, so the
          // line says what they have in common rather than naming both.
          subtitle="Review the applications waiting on your decision."
          className="py-6 md:py-8 lg:py-10"
        />

        <PendingEnrollmentsTabs />
      </main>
    </div>
  );
}
