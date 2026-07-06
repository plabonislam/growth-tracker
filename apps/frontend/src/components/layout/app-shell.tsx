import { Bell } from 'lucide-react';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { BrandLogo } from '@/components/layout/brand-logo';
import { BottomNav } from '@/components/layout/bottom-nav';
import { AccountMenu } from '@/features/auth/components/account-menu';
import { navigate } from '@/lib/navigation';

/**
 * Authenticated layout frame: sidebar on desktop (`md+`), bottom nav on
 * mobile, primary-colored top bar in between. Pages render their own
 * `<main>` content. `activePath` drives the active state of both navs.
 */
export function AppShell({
  activePath,
  children,
}: {
  activePath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar activePath={activePath} />

      <div className="flex min-w-0 flex-1 flex-col bg-[#F9FAFB] pb-20 dark:bg-background md:pb-0">
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background">
          <div className="flex h-14 w-full items-center justify-between px-4 md:h-16 md:justify-end md:px-6">
            {/* Brand — mobile only; the sidebar carries it on desktop */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="md:hidden"
            >
              <BrandLogo />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Bell className="size-5" strokeWidth={1.75} />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
              </button>
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
