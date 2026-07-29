import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';

import { BrandLogo } from '@/components/layout/brand-logo';
import { Button } from '@/components/ui/button';

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
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 md:px-6">
        <button type="button" onClick={() => navigate('/')}>
          <BrandLogo />
        </button>
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
            // The one action on the landing bar, so it carries the default 36px
            // height rather than `sm`'s 32px, with the wider padding a
            // label-only CTA needs to stop reading as a chip.
            <Button className="px-5" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
