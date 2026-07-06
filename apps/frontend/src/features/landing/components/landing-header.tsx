import { Bell, GraduationCap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { navigate } from '@/lib/navigation';

interface LandingHeaderProps {
  /** Hides the Login button on pages where it's redundant (e.g. login). */
  showLogin?: boolean;
  /** Shows the notification bell on authenticated pages (e.g. dashboard). */
  showNotifications?: boolean;
}

export function LandingHeader({
  showLogin = true,
  showNotifications = false,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-primary">
            DSI Club
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showNotifications && (
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
            >
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
            </button>
          )}
          {showLogin && (
            <Button size="sm" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
