import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, ChevronRight, Menu, Plus, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { AppSidebar, SidebarContent } from '@/components/layout/app-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { BrandLogo } from '@/components/layout/brand-logo';
import { NavbarActionButton } from '@/components/layout/navbar-action-button';
import { NAVBAR_ACTIONS_SLOT_ID } from '@/components/layout/navbar-actions';
import { AccountMenu } from '@/features/auth/components/account-menu';
import { ClubCreateModal } from '@/features/clubs/components/club-create-modal';
import { SearchCommand } from '@/features/search/components/search-command';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

export interface BreadcrumbItem {
  label: string;
  /** When set, the crumb is a link; the last crumb usually omits it. */
  path?: string;
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const navigate = useNavigate();
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden items-center gap-1.5 md:flex"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
            )}
            {item.path && !isLast ? (
              <button
                type="button"
                onClick={() => navigate(item.path!)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {item.label}
              </button>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className="text-sm font-semibold text-foreground"
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/**
 * Authenticated layout frame: sticky sidebar on desktop (`lg+`), hamburger +
 * slide-over drawer on tablet (`md`–`lg`), bottom nav on mobile. Pages render
 * their own `<main>` content. `activePath` drives the active state of the
 * navs; `breadcrumb` renders the page context on the left of the top bar.
 *
 * `backTo` turns that left slot into a back arrow plus the page's own title
 * (the last crumb), for pages reached from one place and returned to it — the
 * page then owns no back affordance of its own.
 */
export function AppShell({
  activePath,
  breadcrumb,
  backTo,
  children,
}: {
  activePath: string;
  breadcrumb?: BreadcrumbItem[];
  /** Where the back arrow goes. Replaces the breadcrumb trail when set. */
  backTo?: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthority = useAuthStore((s) => s.isAuthority);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createClubOpen, setCreateClubOpen] = useState(false);

  // The page's own name is the last crumb — the trail's tail is the title.
  const pageTitle = breadcrumb?.[breadcrumb.length - 1]?.label;

  // The navbar's primary action is context-aware: Create Club on Explore,
  // Create Topic on a club detail page (`/clubs/:clubId`). The club detail
  // route shares Explore's `activePath`, so key off the real URL instead.
  const showCreateClub = isAuthority && location.pathname === '/explore';

  // Close the tablet drawer on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar activePath={activePath} />

      {/* Tablet nav drawer — backdrop + sliding panel, always mounted for the transition */}
      <div
        className={cn(
          'fixed inset-0 z-[60] lg:hidden',
          !drawerOpen && 'pointer-events-none',
        )}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity duration-200',
            drawerOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-60 flex-col border-r bg-background shadow-xl transition-transform duration-200',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="size-4" />
          </button>
          <SidebarContent
            activePath={activePath}
            onNavigate={() => setDrawerOpen(false)}
          />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-[#F9FAFB] pb-16 dark:bg-background md:pb-0">
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background">
          <div className="flex h-14 w-full items-center gap-3 px-4 md:h-16 md:px-6">
            {/* Left — brand on mobile, hamburger on tablet, page context on
                desktop. A back arrow takes the brand's place on mobile: on a
                page you came from somewhere, leaving matters more than the
                logo, and the two together leave no room for the title. */}
            {!backTo && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex h-11 shrink-0 items-center md:hidden"
              >
                <BrandLogo />
              </button>
            )}
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              // Only ever shown on tablets, so it keeps the 44px touch size at
              // every width it appears at.
              className="hidden size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:flex lg:hidden"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
            {backTo ? (
              <div className="flex min-w-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Go back"
                  onClick={() => navigate(backTo)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:size-9"
                >
                  <ArrowLeft className="size-5" strokeWidth={1.75} />
                </button>
                {pageTitle && (
                  <span className="truncate text-sm font-semibold text-foreground">
                    {pageTitle}
                  </span>
                )}
              </div>
            ) : (
              breadcrumb &&
              breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />
            )}

            {/* Center — search owns the flexible space */}
            <div className="flex min-w-0 flex-1 items-center justify-end sm:justify-center">
              <SearchCommand />
            </div>

            {/* Right — global utilities */}
            <div className="flex shrink-0 items-center gap-1.5">
              {/* Page-owned actions portal in here — see `NavbarActions` */}
              <div
                id={NAVBAR_ACTIONS_SLOT_ID}
                className="flex items-center gap-1.5 empty:hidden not-empty:mr-1.5 not-empty:border-r not-empty:pr-3"
              />
              {showCreateClub && (
                <>
                  <NavbarActionButton
                    label="Create Club"
                    icon={Plus}
                    onClick={() => setCreateClubOpen(true)}
                  />
                  <span
                    aria-hidden
                    className="mx-1 hidden h-5 w-px bg-border sm:block"
                  />
                </>
              )}
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:p-2"
              >
                <Bell className="size-5" strokeWidth={1.75} />
                {/* Pinned to the icon's corner, which the padding moves. */}
                <span className="absolute right-3 top-3 size-2 rounded-full bg-destructive ring-2 ring-background md:right-2 md:top-2" />
              </button>
              <span
                aria-hidden
                className="mx-1 hidden h-5 w-px bg-border sm:block"
              />
              <AccountMenu />
            </div>
          </div>
        </header>

        {children}
      </div>

      <div className="md:hidden">
        <BottomNav activePath={activePath} />
      </div>

      <ClubCreateModal
        open={createClubOpen}
        onClose={() => setCreateClubOpen(false)}
        onCreated={() => setCreateClubOpen(false)}
      />
    </div>
  );
}
