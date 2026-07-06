import { Bell, ChevronRight } from 'lucide-react';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { BrandLogo } from '@/components/layout/brand-logo';
import { AccountMenu } from '@/features/auth/components/account-menu';
import { SearchCommand } from '@/features/search/components/search-command';
import { navigate } from '@/lib/navigation';

export interface BreadcrumbItem {
  label: string;
  /** When set, the crumb is a link; the last crumb usually omits it. */
  path?: string;
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
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
 * Authenticated layout frame: sidebar on desktop (`md+`), bottom nav on
 * mobile, slim top bar in between. Pages render their own `<main>` content.
 * `activePath` drives the active state of both navs; `breadcrumb` renders
 * the page context on the left of the top bar (desktop only).
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
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar activePath={activePath} />

      <div className="flex min-w-0 flex-1 flex-col bg-[#F9FAFB] pb-20 dark:bg-background md:pb-0">
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background">
          <div className="flex h-14 w-full items-center gap-3 px-4 md:h-16 md:px-6">
            {/* Left — brand on mobile, page context on desktop */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="shrink-0 md:hidden"
            >
              <BrandLogo />
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
    </div>
  );
}
