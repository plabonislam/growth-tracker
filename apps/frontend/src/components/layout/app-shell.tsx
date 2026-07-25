import { useEffect, useState } from 'react';
import { Bell, ChevronRight, Menu, Plus, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { AppSidebar, SidebarContent } from '@/components/layout/app-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { BrandLogo } from '@/components/layout/brand-logo';
import { NAVBAR_ACTIONS_SLOT_ID } from '@/components/layout/navbar-actions';
import { Button } from '@/components/ui/button';
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
 */
export function AppShell({
  activePath,
  breadcrumb,
  children,
}: {
  activePath: string;
  breadcrumb?: BreadcrumbItem[];
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthority = useAuthStore((s) => s.isAuthority);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createClubOpen, setCreateClubOpen] = useState(false);

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
            className="absolute right-2 top-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
            {/* Left — brand on mobile, hamburger on tablet, page context on desktop */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="shrink-0 md:hidden"
            >
              <BrandLogo />
            </button>
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              className="hidden shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:block lg:hidden"
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
            {breadcrumb && breadcrumb.length > 0 && (
              <Breadcrumb items={breadcrumb} />
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
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setCreateClubOpen(true)}
                    className="gap-1.5"
                  >
                    <Plus className="size-4" strokeWidth={1.75} />
                    <span className="hidden sm:inline">Create Club</span>
                  </Button>
                  <span
                    aria-hidden
                    className="mx-1 hidden h-5 w-px bg-border sm:block"
                  />
                </>
              )}
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Bell className="size-5" strokeWidth={1.75} />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
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
      />
    </div>
  );
}
