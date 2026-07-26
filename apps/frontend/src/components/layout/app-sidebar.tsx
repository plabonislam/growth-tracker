import {
  CircleCheckBig,
  Compass,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router';

import { BrandLogo } from '@/components/layout/brand-logo';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { usePendingEnrollmentsCount } from '@/features/enrollments/hooks/use-enrollments';
import { usePendingModuleReviews } from '@/features/topics/hooks/use-topics';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  path: string;
  /** Numeric badge shown at the end of the row (e.g. pending request count). */
  count?: number;
  /** Only rendered for someone who reviews enrollment requests. */
  reviewersOnly?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

function buildSections(
  /** True for an authority, a club coordinator, or a topic mentor. */
  isReviewer: boolean,
  pendingCount: number,
): SidebarSection[] {
  // Only routes that exist. Tasks, sessions and certifications were listed
  // here as "Soon" placeholders — nothing to navigate to, so nothing to show.
  const sections: SidebarSection[] = [
    {
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Explore Clubs', icon: Compass, path: '/explore' },
        {
          label: 'Pending requests',
          icon: CircleCheckBig,
          path: '/pending-enrollments',
          count: pendingCount > 0 ? pendingCount : undefined,
          reviewersOnly: true,
        },
      ],
    },
  ];

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.reviewersOnly || isReviewer),
    }))
    .filter((section) => section.items.length > 0);
}

function SidebarLink({
  item,
  isActive,
  onNavigate,
}: {
  item: SidebarItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const { label, icon: Icon, path, count } = item;

  return (
    <button
      type="button"
      onClick={() => {
        navigate(path);
        onNavigate?.();
      }}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        isActive
          ? 'bg-primary/10 font-semibold text-primary'
          : 'font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground',
      )}
    >
      {/* Active rail marker — anchors the highlight to the sidebar edge */}
      <span
        className={cn(
          'absolute -left-3 h-5 w-1 rounded-r-full bg-primary transition-opacity',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Icon className="size-[18px]" strokeWidth={isActive ? 2.25 : 1.75} />
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 py-px text-[11px] font-semibold',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Sidebar inner content (brand + nav sections), shared by the sticky desktop
 * sidebar and the tablet slide-over drawer. `onNavigate` fires after a link
 * is followed so the drawer can close itself.
 */
export function SidebarContent({
  activePath,
  onNavigate,
}: {
  activePath: string;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  // The token carries only `isAuthority`; coordinating and mentoring are
  // relationships the profile has to answer for.
  const isAuthority = useAuthStore((s) => s.isAuthority);
  const { data: user } = useCurrentUser();
  const isReviewer =
    isAuthority ||
    user?.roles?.isCoordinator === true ||
    user?.roles?.isMentor === true;
  const { total: pendingEnrollments } = usePendingEnrollmentsCount({
    enabled: isReviewer,
  });
  // One row is enough to learn the total; the badge counts every queue the
  // page holds, so submitted modules are part of it.
  const { data: reviews } = usePendingModuleReviews(0, 1, {
    enabled: isReviewer,
  });
  const sections = buildSections(
    isReviewer,
    pendingEnrollments + (reviews?.total ?? 0),
  );
  return (
    <>
      {/* Brand lockup — mark + wordmark, free-floating (no border row) */}
      <button
        type="button"
        onClick={() => {
          navigate('/dashboard');
          onNavigate?.();
        }}
        className="mx-3 mt-5 flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <BrandLogo caption />
      </button>

      {/* Nav sections */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-4 pt-7">
        {sections.map((section, i) => (
          <div key={section.title ?? i} className="space-y-0.5">
            {section.title && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <SidebarLink
                key={item.label}
                item={item}
                isActive={activePath === item.path}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>
    </>
  );
}

/**
 * Desktop navigation sidebar (hidden below `lg`). `activePath` marks the
 * current route; tablet uses the AppShell drawer, mobile uses BottomNav.
 */
export function AppSidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-background lg:flex">
      <SidebarContent activePath={activePath} />
    </aside>
  );
}
